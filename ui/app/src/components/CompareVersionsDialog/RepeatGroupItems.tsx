/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import ContentInstance from '../../models/ContentInstance';
import { ContentTypeField, LookupTable } from '../../models';
import React, { useEffect, useState } from 'react';
import useSpreadState from '../../hooks/useSpreadState';
import { fromString, serialize } from '../../utils/xml';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIosRounded from '@mui/icons-material/ArrowBackIosRounded';
import { FormattedMessage } from 'react-intl';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import palette from '../../styles/palette';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { CompareFieldPanel } from './CompareVersions';
import { areObjectsEqual } from '../../utils/object';

interface RepeatGroupItemsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
  aXml: string;
  bXml: string;
  fields: LookupTable<ContentTypeField>;
}

export function RepeatGroupItems(props: RepeatGroupItemsProps) {
  const { contentA, contentB, aXml, bXml, fields } = props;
  const [repDiff, setRepDiff] = useState([]);
  const [repItemsCompare, setRepItemsCompare] = useSpreadState({
    a: null,
    b: null
  });
  const showRepItemsCompare = repItemsCompare.a?.content && repItemsCompare.b?.content;
  const selectedItemsAreEqual =
    showRepItemsCompare && areObjectsEqual(repItemsCompare.a?.content, repItemsCompare.b?.content);
  const [compareRepItemVersionsMode, setCompareRepItemVersionsMode] = useState(false);

  useEffect(() => {
    const contentALength = (contentA ?? []).length;
    const contentBLength = (contentB ?? []).length;
    const maxLength = contentALength > contentBLength ? contentALength : contentBLength;
    const diffArray = [];

    for (let x = 0; x < maxLength; x++) {
      const itemA = contentA?.[x] ? JSON.stringify(contentA[x]) : null;
      const itemB = contentB?.[x] ? JSON.stringify(contentB[x]) : null;

      if (itemA && itemB) {
        const result = itemA === itemB ? 'unchanged' : 'changed';
        diffArray.push({ a: result, b: result });
      } else {
        diffArray.push({ a: itemA ? 'new' : null, b: itemB ? 'new' : null });
      }
    }
    setRepDiff(diffArray);
  }, [contentA, contentB, setRepDiff]);

  const onSetRepItemsCompare = (event, side, index) => {
    const content = side === 'a' ? contentA : contentB;
    const xml = side === 'a' ? aXml : bXml;
    // When selecting an item on the rep-group diff view, we need to calculate its xml (so the items can be compared
    // using the CompareFieldPanel).
    const doc = fromString(xml).querySelectorAll('item')[index];
    const itemXml = doc ? serialize(doc) : '';
    const item = content[index];
    const isChecked = event.target.checked;
    setRepItemsCompare({
      [side]: {
        content: isChecked ? item : null,
        xml: isChecked ? itemXml : null
      }
    });
  };

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }}
    >
      {compareRepItemVersionsMode ? (
        <>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosRounded />}
            sx={{ mb: 2 }}
            onClick={() => setCompareRepItemVersionsMode(false)}
          >
            <FormattedMessage defaultMessage="Go back" />
          </Button>
          <Typography>
            <FormattedMessage defaultMessage="Comparing rep-group items" />
          </Typography>
          {Object.values(fields).map((field) => (
            <CompareFieldPanel a={repItemsCompare.a} b={repItemsCompare.b} field={field} key={field.id} accordion />
          ))}
        </>
      ) : (
        <>
          {showRepItemsCompare && (
            <Button
              variant="outlined"
              startIcon={<CompareArrowsRoundedIcon />}
              sx={{ mb: 2 }}
              disabled={selectedItemsAreEqual}
              onClick={() => {
                setCompareRepItemVersionsMode(true);
              }}
            >
              {selectedItemsAreEqual ? (
                <FormattedMessage defaultMessage="Selected items are the same" />
              ) : (
                <FormattedMessage defaultMessage="Compare" />
              )}
            </Button>
          )}
          {repDiff.length &&
            repDiff.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginBottom: '12px',
                  '& .rep-group-compare': {
                    padding: '4px 15px',
                    borderRadius: '10px',
                    width: '100%',
                    '&.unchanged': {
                      color: (theme) =>
                        theme.palette.getContrastText(
                          theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1
                        ),
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1
                    },
                    '&.new': {
                      color: palette.green.shade,
                      backgroundColor: palette.green.highlight,
                      marginLeft: 'auto'
                    },
                    '&.changed': {
                      color: palette.yellow.shade,
                      backgroundColor: palette.yellow.highlight
                    }
                  }
                }}
              >
                {item.a === 'unchanged' ? (
                  <Box className="rep-group-compare unchanged">
                    <Typography>
                      <FormattedMessage defaultMessage="Item {index} - Unchanged" values={{ index }} />
                    </Typography>
                  </Box>
                ) : item.a === 'changed' ? (
                  <>
                    <Box className="rep-group-compare changed">
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            sx={{ color: 'inherit', p: 1 }}
                            checked={repItemsCompare.a?.content === contentA[index]}
                            onChange={(e) => onSetRepItemsCompare(e, 'a', index)}
                          />
                        }
                        label={<FormattedMessage defaultMessage="Item {index} - Changed" values={{ index }} />}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                    <Box className="rep-group-compare changed">
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            sx={{ color: 'inherit', p: 1 }}
                            checked={repItemsCompare.b?.content === contentB[index]}
                            onChange={(e) => onSetRepItemsCompare(e, 'b', index)}
                          />
                        }
                        label={<FormattedMessage defaultMessage="Item {index} - Changed" values={{ index }} />}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  </>
                ) : (
                  <>
                    <Box className={`rep-group-compare ${item.a && 'new'}`}>
                      {item.a === 'new' && (
                        <>
                          <FormControlLabel
                            control={<Checkbox size="small" color="default" sx={{ padding: '4px ' }} />}
                            label={<FormattedMessage defaultMessage="Item {index} - New" values={{ index }} />}
                          />
                        </>
                      )}
                    </Box>
                    <Box className={`rep-group-compare ${item.b && 'new'}`}>
                      {item.b === 'new' && (
                        <>
                          <FormControlLabel
                            control={<Checkbox size="small" color="default" sx={{ padding: '4px ' }} />}
                            label={<FormattedMessage defaultMessage="Item {index} - New" values={{ index }} />}
                          />
                        </>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            ))}
        </>
      )}
    </Box>
  );
}

export default RepeatGroupItems;
