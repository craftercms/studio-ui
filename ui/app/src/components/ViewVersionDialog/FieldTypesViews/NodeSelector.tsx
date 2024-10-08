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

// TODO: props, need to inherit from some other prop
import Box from '@mui/material/Box';
import ContentInstance from '../../../models/ContentInstance';
import DiffCollectionItem from '../../CompareVersionsDialog/FieldsTypesDiffViews/DiffCollectionItem';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import useItemsByPath from '../../../hooks/useItemsByPath';
import { useVersionsDialogContext } from '../../CompareVersionsDialog/VersionsDialogContext';
import useSelection from '../../../hooks/useSelection';

// TODO: props, need to inherit from some other prop
export function NodeSelector(props) {
  const { contentA: content, xml, field } = props;
  const itemsByPath = useItemsByPath();
  const [, contextApiRef] = useVersionsDialogContext();
  const contentTypesBranch = useSelection((state) => state.contentTypes);

  console.log('content', content);

  // TODO: move functions to utils
  const getItemLabel = (item: ContentInstance): string => {
    return item.craftercms?.label ?? itemsByPath?.[item.craftercms?.path]?.label ?? item.craftercms?.id ?? item.key;
  };

  const isEmbedded = (item: ContentInstance): boolean => {
    return item?.craftercms && !item.craftercms.path;
  };
  // TODO: ^

  const onSelectStateItem = (item: ContentInstance) => {
    const isEmbeddedComponent = isEmbedded(item);
    const fields = isEmbeddedComponent ? contentTypesBranch.byId[item.craftercms.contentTypeId].fields : field.fields;

    contextApiRef.current.setViewSlideOutState({
      open: true,
      data: {
        content: item,
        xml,
        fields
      },
      title: field.name,
      subtitle: <FormattedMessage defaultMessage="{fieldId} - Repeat Group" values={{ fieldId: field.id }} />,
      onClose: () => contextApiRef.current.closeSlideOuts()
    });
  };

  return (
    <Box component="section" sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1100px', gap: '10px' }}>
        {content?.map((item) => (
          <DiffCollectionItem
            key={item.craftercms.path}
            state="unchanged"
            primaryText={getItemLabel(item)}
            secondaryText={
              item.craftercms && isEmbedded(item) ? (
                <FormattedMessage defaultMessage="Embedded" />
              ) : (
                (item.craftercms?.path ?? item.value)
              )
            }
            disableHighlight={!isEmbedded(item)}
            hideState
            onSelect={() => {
              if (isEmbedded(item)) {
                onSelectStateItem(item);
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default NodeSelector;
