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
import { SelectionContentVersion } from '../utils';
import DiffCollectionItem from './DiffCollectionItem';
import { useVersionsDialogContext } from '../VersionsDialogContext';

interface RepeatGroupItemsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
  aXml: string;
  bXml: string;
  compareMode: boolean;
  fields: LookupTable<ContentTypeField>;
  field: ContentTypeField;
  setCompareModeDisabled?(disabled: boolean): void;
}

export type ItemDiffState = 'changed' | 'unchanged' | 'new' | 'deleted';
type RepItemDiffSide = 'a' | 'b';

export function RepeatGroupItems(props: RepeatGroupItemsProps) {
  const { contentA, contentB, aXml, bXml, compareMode, fields, field, setCompareModeDisabled } = props;
  const [repeatGroupDiff, setRepeatGroupDiff] = useState([]);
  const [itemsCompareModeSelection, setItemsCompareModeSelection] = useSpreadState<{
    a: SelectionContentVersion & {
      multiSide: boolean;
    };
    b: SelectionContentVersion & {
      multiSide: boolean;
    };
  }>({
    a: null,
    b: null
  });
  const enableItemsCompareMode = itemsCompareModeSelection.a?.content && itemsCompareModeSelection.b?.content;
  const areSelectedItemsEqual =
    enableItemsCompareMode && itemsCompareModeSelection.a?.xml === itemsCompareModeSelection.b?.xml;
  const [, contextApiRef] = useVersionsDialogContext();

  const getItemDataAtVersion = (side: RepItemDiffSide, index: number): { content: ContentInstance; xml: string } => {
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

  const onSelectItemToCompare = (checked: boolean, side: RepItemDiffSide, index: number, multiSide = false): void => {
    const { content, xml } = getItemDataAtVersion(side, index);
    setItemsCompareModeSelection({
      [side]: {
        multiSide,
        content: checked ? content : null,
        xml: checked ? xml : null
      }
    });
  };

  const onSelectDeletedItemToCompare = (checked: boolean, index: number): void => {
    // Deleted items will always show on the left side of the comparison (side 'a'), and since when selecting an 'unchanged'
    // or 'changed' item we default it to side 'a', if there's a 'multiSide' item selected, switch it to side 'b'
    if (itemsCompareModeSelection.a?.multiSide) {
      const switchItem = deepCopy(itemsCompareModeSelection.a);
      onSelectItemToCompare(checked, 'a', index);
      setItemsCompareModeSelection({ b: switchItem });
    } else {
      onSelectItemToCompare(checked, 'a', index);
    }
  };

  const onViewItemVersion = (side: RepItemDiffSide, index: number): void => {
    const { content, xml } = getItemDataAtVersion(side, index);
    contextApiRef.current.setViewSlideOutState({
      open: true,
      error: null,
      isFetching: false,
      data: { content, xml, fields },
      title: field.name,
      subtitle: <FormattedMessage defaultMessage="{fieldId} - Repeat Group" values={{ fieldId: field.id }} />,
      onClose: () => contextApiRef.current.closeSlideOuts()
    });
  };

  const isItemSelected = (side: RepItemDiffSide, index: number): boolean => {
    const contentToCompare = side === 'a' ? contentA?.[index] : contentB?.[index];
    return compareMode && itemsCompareModeSelection[side]?.content === contentToCompare;
  };

  const onSelectItemAction = (
    checked: boolean,
    side: RepItemDiffSide,
    index: number,
    diffState: ItemDiffState
  ): void => {
    if (diffState === 'changed' || diffState === 'unchanged') {
      if (compareMode) {
        const oppositeSide = side === 'a' ? 'b' : 'a';
        let selectSide = side;
        // If current side already has a value (an item selected), and it's multi-side, add the selection to the opposite side.
        if (itemsCompareModeSelection[side]?.multiSide) {
          selectSide = oppositeSide;
        }
        onSelectItemToCompare(checked, selectSide, index, true);
      } else {
        if (diffState === 'changed') {
          onSelectItemToCompare(checked, 'a', index);
          // If items have changed Compare both versions on current item
          onSelectItemToCompare(checked, 'b', index);
        } else {
          onViewItemVersion(side, index);
        }
      }
    } else {
      if (compareMode) {
        if (diffState === 'new') {
          onSelectItemToCompare(checked, side, index);
        } else {
          onSelectDeletedItemToCompare(checked, index);
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
    setRepeatGroupDiff(diffArray);
  }, [contentA, contentB, setRepeatGroupDiff]);

  useEffect(() => {
    if (itemsCompareModeSelection.a?.content && itemsCompareModeSelection.b?.content) {
      contextApiRef.current.setCompareSlideOutState({
        open: true,
        error: null,
        isFetching: false,
        selectionContent: deepCopy(itemsCompareModeSelection),
        fields,
        title: field.name,
        subtitle: <FormattedMessage defaultMessage="{fieldId} - Repeat Group" values={{ fieldId: field.id }} />,
        onClose: () => contextApiRef.current.closeSlideOuts()
      });
      setItemsCompareModeSelection?.({ a: null, b: null });
    }
  }, [
    itemsCompareModeSelection,
    fields,
    compareMode,
    field.id,
    setItemsCompareModeSelection,
    field.name,
    contextApiRef
  ]);

  useEffect(() => {
    const diffItemsSameSide =
      repeatGroupDiff.every((entry) => nou(entry.a)) || repeatGroupDiff.every((entry) => nou(entry.b));
    if (diffItemsSameSide) {
      setCompareModeDisabled(true);
    } else {
      setCompareModeDisabled(false);
    }
  }, [setCompareModeDisabled, repeatGroupDiff]);

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center'
      }}
    >
      {compareMode && areSelectedItemsEqual && (
        <Alert severity="warning" variant="outlined" sx={{ pt: 0, pb: 0, pl: 1, pr: 1, mb: 2 }}>
          <FormattedMessage defaultMessage="Selected items are the same" />
        </Alert>
      )}
      {repeatGroupDiff.length &&
        repeatGroupDiff.map((item, index) => (
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
            <DiffCollectionItem
              state={item.a ?? item.b}
              primaryText={<FormattedMessage defaultMessage="Item {index}" values={{ index: index + 1 }} />}
              selectionMode={compareMode}
              selected={isItemSelected(item.a ? 'a' : 'b', index)}
              onSelect={(selected) => onSelectItemAction(selected, item.a ? 'a' : 'b', index, item.a ?? item.b)}
            />
          </Box>
        ))}
    </Box>
  );
}

export default RepeatGroupItems;
