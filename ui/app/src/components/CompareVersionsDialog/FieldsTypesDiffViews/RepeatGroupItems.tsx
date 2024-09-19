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
import { deepCopy } from '../../../utils/object';
import { Alert } from '@mui/material';
import { CompareVersionsDialogProps } from '../utils';
import { ViewVersionDialogProps } from '../../ViewVersionDialog/utils';
import useStyles from '../../UserManagement/styles';

interface RepeatGroupItemsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
  aXml: string;
  bXml: string;
  compareMode: boolean;
  fields: LookupTable<ContentTypeField>;
  field: ContentTypeField;
  setCompareSubDialogState?(props: Partial<CompareVersionsDialogProps>): void;
  setViewSubDialogState?(props: Partial<ViewVersionDialogProps>): void;
}

export function RepeatGroupItems(props: RepeatGroupItemsProps) {
  const {
    contentA,
    contentB,
    aXml,
    bXml,
    compareMode,
    fields,
    field,
    setCompareSubDialogState,
    setViewSubDialogState
  } = props;
  const [repDiff, setRepDiff] = useState([]);
  const [repItemsCompare, setRepItemsCompare] = useSpreadState({ a: null, b: null });
  const showRepItemsCompare = repItemsCompare.a?.content && repItemsCompare.b?.content;
  const selectedItemsAreEqual = showRepItemsCompare && repItemsCompare.a?.xml === repItemsCompare.b?.xml;
  const { cx } = useStyles();

  const getItemDataAtVersion = (side, index) => {
    const content = side === 'a' ? contentA : contentB;
    const xml = side === 'a' ? aXml : bXml;
    // When selecting an item on the rep-group diff view, we need to calculate its xml (so the items can be compared
    // using the CompareFieldPanel).
    const doc = fromString(xml).querySelectorAll('item')[index];
    const itemXml = doc ? serialize(doc) : '';
    const item = content[index];

    return {
      content: item,
      xml: itemXml
    };
  };

  const onSetRepItemsCompare = (event, side, index, multiSide = false) => {
    const { content, xml } = getItemDataAtVersion(side, index);
    const isChecked = event.target.checked;
    setRepItemsCompare({
      [side]: {
        multiSide,
        content: isChecked ? content : null,
        xml: isChecked ? xml : null
      }
    });
  };

  const onSetDeletedItemCompare = (event, index) => {
    // Deleted items will always show on the left side of the comparison (side 'a'), and since when selecting an 'unchanged'
    // or 'changed' item we default it to side 'a', if theres a 'multiSide' item selected, switch it to side 'b'
    if (repItemsCompare.a?.multiSide) {
      const switchItem = deepCopy(repItemsCompare.a);
      onSetRepItemsCompare(event, 'a', index);
      setRepItemsCompare({
        b: switchItem
      });
    } else {
      onSetRepItemsCompare(event, 'a', index);
    }
  };

  const onViewItemVersion = (side, index) => {
    const { content, xml } = getItemDataAtVersion(side, index);
    setViewSubDialogState({
      open: true,
      data: {
        content,
        xml,
        fields
      },
      title: field.name,
      subtitle: <FormattedMessage defaultMessage="{fieldId} - Repeat Group" values={{ fieldId: field.id }} />,
      onClose: () => setViewSubDialogState({ open: false })
    });
  };

  const isItemSelected = (side, index) => {
    const contentToCompare = side === 'a' ? contentA[index] : contentB[index];
    return compareMode && repItemsCompare[side]?.content === contentToCompare;
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
    if (repItemsCompare.a?.content && repItemsCompare.b?.content) {
      setCompareSubDialogState?.({
        open: true,
        selectionContent: deepCopy(repItemsCompare),
        fields,
        title: field.name,
        subtitle: <FormattedMessage defaultMessage="{fieldId} - Repeat Group" values={{ fieldId: field.id }} />,
        onClose: () => setCompareSubDialogState({ open: false })
      });
      setRepItemsCompare?.({ a: null, b: null });
    }
  }, [repItemsCompare, fields, compareMode, setCompareSubDialogState, field?.id, setRepItemsCompare, field?.name]);

  return (
    <>
      <Box
        component="section"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center'
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
                width: '100%',
                maxWidth: '1100px',
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
                      theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1,
                    '&:hover, &.selected': {
                      color: (theme) =>
                        theme.palette.mode === 'dark'
                          ? theme.palette.getContrastText(palette.gray.medium7)
                          : palette.gray.medium4,
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? palette.gray.medium7 : palette.gray.light5
                    }
                  },
                  '&.new': {
                    color: palette.green.shade,
                    backgroundColor: palette.green.highlight,
                    marginLeft: 'auto',
                    width: '50%',
                    '&:hover, &.selected': {
                      backgroundColor: palette.green.main,
                      color: (theme) => theme.palette.getContrastText(palette.green.main)
                    }
                  },
                  '&.changed': {
                    color: palette.yellow.shade,
                    backgroundColor: palette.yellow.highlight,
                    '&:hover, &.selected': {
                      background: palette.yellow.main,
                      color: (theme) => theme.palette.getContrastText(palette.yellow.main)
                    }
                  },
                  '&.deleted': {
                    color: palette.red.shade,
                    backgroundColor: palette.red.highlight,
                    width: '50%',
                    '&:hover, &.selected': {
                      background: palette.red.tint,
                      color: (theme) => theme.palette.getContrastText(palette.red.tint)
                    }
                  }
                }
              }}
            >
              {item.a === 'unchanged' || item.a === 'changed' ? (
                <Box className={cx('rep-group-compare', item.a, isItemSelected('a', index) && 'selected')}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        sx={{
                          color: 'inherit',
                          p: 0,
                          pr: 1,
                          display: !compareMode && 'none'
                        }}
                        checked={repItemsCompare.a?.content === contentA[index]}
                        onChange={(e) => {
                          // Maybe if something else is selected, set to opposite side (?)
                          if (compareMode) {
                            onSetRepItemsCompare(e, 'a', index, true);
                          } else {
                            if (item.a === 'changed') {
                              onSetRepItemsCompare(e, 'a', index);
                              // If items have changed Compare both versions on current item
                              onSetRepItemsCompare(e, 'b', index);
                            }
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 14 }}>
                        <FormattedMessage defaultMessage="Item {index}" values={{ index: index + 1 }} />
                      </Typography>
                    }
                    sx={{
                      width: '100%',
                      marginLeft: !compareMode && 0
                    }}
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
                <Box
                  className={cx(
                    'rep-group-compare',
                    item.a ? 'deleted' : item.b ? 'new' : '',
                    isItemSelected(item.a === 'new' ? 'a' : 'b', index) ? 'selected' : ''
                  )}
                >
                  {(item.a === 'new' || item.b === 'new') && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          sx={{
                            color: 'inherit',
                            p: 0,
                            pr: 1,
                            display: !compareMode && 'none'
                          }}
                          checked={
                            item.a === 'new'
                              ? repItemsCompare.a?.content === contentA[index]
                              : repItemsCompare.b?.content === contentB[index]
                          }
                          onChange={(e) => {
                            if (compareMode) {
                              if (item.a === 'new') {
                                onSetDeletedItemCompare(e, index);
                              } else {
                                onSetRepItemsCompare(e, 'b', index);
                              }
                            }
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: 14 }}>
                          <FormattedMessage defaultMessage="Item {index}" values={{ index: index + 1 }} />
                        </Typography>
                      }
                      sx={{ marginLeft: !compareMode && 0, width: '100%' }}
                      onClick={() => !compareMode && onViewItemVersion(item.a === 'new' ? 'a' : 'b', index)}
                    />
                  )}
                </Box>
              )}
            </Box>
          ))}
      </Box>
    </>
  );
}

export default RepeatGroupItems;
