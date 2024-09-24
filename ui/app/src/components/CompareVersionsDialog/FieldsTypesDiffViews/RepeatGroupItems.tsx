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
import { deepCopy, nou } from '../../../utils/object';
import { Alert } from '@mui/material';
import { CompareVersionsDialogProps } from '../utils';
import { ViewVersionDialogProps } from '../../ViewVersionDialog/utils';
import StateItem from './StateItem';

interface RepeatGroupItemsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
  aXml: string;
  bXml: string;
  compareMode: boolean;
  fields: LookupTable<ContentTypeField>;
  field: ContentTypeField;
  setCompareModeDisabled?(disabled: boolean): void;
  setCompareSubDialogState?(props: Partial<CompareVersionsDialogProps>): void;
  setViewSubDialogState?(props: Partial<ViewVersionDialogProps>): void;
}

export type ItemDiffState = 'changed' | 'unchanged' | 'new' | 'deleted';

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
    setViewSubDialogState,
    setCompareModeDisabled
  } = props;
  const [repDiff, setRepDiff] = useState([]);
  const [repItemsCompare, setRepItemsCompare] = useSpreadState({ a: null, b: null });
  const showRepItemsCompare = repItemsCompare.a?.content && repItemsCompare.b?.content;
  const selectedItemsAreEqual = showRepItemsCompare && repItemsCompare.a?.xml === repItemsCompare.b?.xml;

  const getItemDataAtVersion = (side: string, index: number): { content: ContentInstance; xml: string } => {
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

  const onSetRepItemsCompare = (checked, side, index, multiSide = false) => {
    const { content, xml } = getItemDataAtVersion(side, index);
    setRepItemsCompare({
      [side]: {
        multiSide,
        content: checked ? content : null,
        xml: checked ? xml : null
      }
    });
  };

  const onSetDeletedItemCompare = (checked: boolean, index: number) => {
    // Deleted items will always show on the left side of the comparison (side 'a'), and since when selecting an 'unchanged'
    // or 'changed' item we default it to side 'a', if theres a 'multiSide' item selected, switch it to side 'b'
    if (repItemsCompare.a?.multiSide) {
      const switchItem = deepCopy(repItemsCompare.a);
      onSetRepItemsCompare(checked, 'a', index);
      setRepItemsCompare({
        b: switchItem
      });
    } else {
      onSetRepItemsCompare(checked, 'a', index);
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

  const onSelectItemAction = (checked: boolean, side: 'a' | 'b', index: number, diffState: ItemDiffState) => {
    if (diffState === 'changed' || diffState === 'unchanged') {
      if (compareMode) {
        const oppositeSide = side === 'a' ? 'b' : 'a';
        let selectSide = side;
        // If current side already has a value (an item selected), and it's multi-side, add the selection to the opposite side.
        if (repItemsCompare[side]?.multiSide) {
          selectSide = oppositeSide;
        }
        onSetRepItemsCompare(checked, selectSide, index, true);
      } else {
        if (diffState === 'changed') {
          onSetRepItemsCompare(checked, 'a', index);
          // If items have changed Compare both versions on current item
          onSetRepItemsCompare(checked, 'b', index);
        }
      }
    } else {
      if (compareMode) {
        if (diffState === 'new') {
          onSetRepItemsCompare(checked, side, index);
        } else {
          onSetDeletedItemCompare(checked, index);
        }
      } else {
        onViewItemVersion(side, index);
      }
    }
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
        diffArray.push({ a: itemA ? 'deleted' : null, b: itemB ? 'new' : null });
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

  useEffect(() => {
    const diffItemsSameSide = repDiff.every((entry) => nou(entry.a)) || repDiff.every((entry) => nou(entry.b));
    if (diffItemsSameSide) {
      setCompareModeDisabled(true);
    } else {
      setCompareModeDisabled(false);
    }
  }, [setCompareModeDisabled, repDiff]);

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
                maxWidth: '1100px'
              }}
            >
              <StateItem
                state={item.a ?? item.b}
                label={<FormattedMessage defaultMessage="Item {index}" values={{ index: index + 1 }} />}
                selectionMode={compareMode}
                selected={isItemSelected(item.a ? 'a' : 'b', index)}
                onSelect={(selected) => onSelectItemAction(selected, item.a ? 'a' : 'b', index, item.a ?? item.b)}
                disableHighlight={(item.a ?? item.b) === 'unchanged'}
              />
            </Box>
          ))}
      </Box>
    </>
  );
}

export default RepeatGroupItems;
