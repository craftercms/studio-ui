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

import ContentInstance from '../../../models/ContentInstance';
import { ContentTypeField, LookupTable } from '../../../models';
import React, { useEffect, useState } from 'react';
import useSpreadState from '../../../hooks/useSpreadState';
import { fromString, serialize } from '../../../utils/xml';
import Box from '@mui/material/Box';
import { FormattedMessage } from 'react-intl';
import palette from '../../../styles/palette';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { areObjectsEqual } from '../../../utils/object';
import { Alert } from '@mui/material';
import CompareVersionsDialog from '../CompareVersionsDialog';

interface RepeatGroupItemsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
  aXml: string;
  bXml: string;
  compareMode: boolean;
  fields: LookupTable<ContentTypeField>;
  field: ContentTypeField;
}

export function RepeatGroupItems(props: RepeatGroupItemsProps) {
  const { contentA, contentB, aXml, bXml, compareMode, fields, field } = props;
  const [repDiff, setRepDiff] = useState([]);
  const [repItemsCompare, setRepItemsCompare] = useSpreadState({ a: null, b: null });
  const showRepItemsCompare = repItemsCompare.a?.content && repItemsCompare.b?.content;
  const selectedItemsAreEqual =
    showRepItemsCompare && areObjectsEqual(repItemsCompare.a?.content, repItemsCompare.b?.content);
  const [compareRepItemsDialogState, setCompareRepItemsDialogState] = useSpreadState({
    open: false,
    selectionContent: null,
    fields: null
  });

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

  const onCloseSubDialog = () => {
    setCompareRepItemsDialogState({ open: false });
    setRepItemsCompare({ a: null, b: null });
  };

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

  useEffect(() => {
    if (compareMode && repItemsCompare.a?.content && repItemsCompare.b?.content) {
      setCompareRepItemsDialogState({
        open: true,
        selectionContent: repItemsCompare,
        fields
      });
    }
  }, [repItemsCompare, fields, compareMode, setCompareRepItemsDialogState]);

  return (
    <>
      <Box
        component="section"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        {compareMode && selectedItemsAreEqual && (
          <Alert severity="warning" variant="outlined" sx={{ pt: 0, pb: 0, pl: 1, pr: 1, mb: 2 }}>
            <FormattedMessage defaultMessage="Selected items are the same" />
          </Alert>
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
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8.5px 10px',
                  borderRadius: '5px',
                  width: '100%',
                  '&.unchanged': {
                    color: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.getContrastText(palette.gray.medium4)
                        : palette.gray.medium4,
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
                  },
                  '&.deleted': {
                    color: palette.red.shade,
                    backgroundColor: palette.red.highlight
                  }
                }
              }}
            >
              {item.a === 'unchanged' || item.a === 'changed' ? (
                <Box className={`rep-group-compare ${item.a}`}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        sx={{ color: 'inherit', p: 0, pr: 1, display: !compareMode && 'none' }}
                        checked={repItemsCompare.a?.content === contentA[index]}
                        onChange={(e) => {
                          // TODO: not sure about this logic
                          if (compareMode) {
                            onSetRepItemsCompare(e, 'a', index);
                            if (item.a === 'changed') {
                              onSetRepItemsCompare(e, 'b', index);
                            }
                          }
                        }}
                      />
                    }
                    label={<FormattedMessage defaultMessage="Item {index}" values={{ index }} />}
                    sx={{ width: '100%', marginLeft: !compareMode && 0 }}
                  />
                  <Typography variant="caption">
                    {item.a === 'unchanged' ? (
                      <FormattedMessage defaultMessage="Unchanged" />
                    ) : (
                      <FormattedMessage defaultMessage="Changed" />
                    )}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box className={`rep-group-compare ${item.a && 'deleted'}`}>
                    {item.a === 'new' && (
                      <>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              sx={{ color: 'inherit', p: 0, pr: 1, display: !compareMode && 'none' }}
                              checked={repItemsCompare.b?.content === contentB[index]}
                              onChange={(e) => compareMode && onSetRepItemsCompare(e, 'a', index)}
                            />
                          }
                          label={<FormattedMessage defaultMessage="Item {index}" values={{ index }} />}
                          sx={{ marginLeft: !compareMode && 0 }}
                        />
                      </>
                    )}
                  </Box>
                  <Box className={`rep-group-compare ${item.b && 'new'}`}>
                    {item.b === 'new' && (
                      <>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              sx={{ color: 'inherit', p: 0, pr: 1, display: !compareMode && 'none' }}
                              checked={repItemsCompare.b?.content === contentB[index]}
                              onChange={(e) => compareMode && onSetRepItemsCompare(e, 'b', index)}
                            />
                          }
                          label={<FormattedMessage defaultMessage="Item {index} - New" values={{ index }} />}
                          sx={{ marginLeft: !compareMode && 0 }}
                        />
                      </>
                    )}
                  </Box>
                </>
              )}
            </Box>
          ))}
      </Box>
      <CompareVersionsDialog
        subDialog
        {...compareRepItemsDialogState}
        subtitle={<FormattedMessage defaultMessage="{fieldId} - Repeat Group" values={{ fieldId: field.id }} />}
        error={null}
        isFetching={false}
        onClose={onCloseSubDialog}
      />
    </>
  );
}

export default RepeatGroupItems;
