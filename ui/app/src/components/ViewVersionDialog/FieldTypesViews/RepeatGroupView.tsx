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

import Box from '@mui/material/Box';
import ContentInstance from '../../../models/ContentInstance';
import DiffCollectionItem from '../../CompareVersionsDialog/FieldsTypesDiffViews/DiffCollectionItem';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { useVersionsDialogContext } from '../../CompareVersionsDialog/VersionsDialogContext';
import useContentTypes from '../../../hooks/useContentTypes';
import { parseElementByContentType } from '../../../utils/content';
import { fromString } from '../../../utils/xml';
import { ViewComponentBaseProps } from '../utils';

export interface RepeatGroupViewProps extends ViewComponentBaseProps {}

export function RepeatGroupView(props: RepeatGroupViewProps) {
  const { xml, field } = props;
  const [, contextApiRef] = useVersionsDialogContext();
  const contentTypes = useContentTypes();
  const content = xml
    ? parseElementByContentType(fromString(xml).querySelector(field.id), field, contentTypes, {})
    : [];

  const isEmbedded = (item: ContentInstance): boolean => {
    return item?.craftercms && !item.craftercms.path;
  };

  const onSelectStateItem = (item: ContentInstance) => {
    const isEmbeddedComponent = isEmbedded(item);
    const fields = isEmbeddedComponent ? contentTypes[item.craftercms.contentTypeId].fields : field.fields;

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
        {content?.map((item, index) => (
          <DiffCollectionItem
            key={index}
            state="unchanged"
            primaryText={<FormattedMessage defaultMessage="Item {index}" values={{ index }} />}
            onSelect={() => onSelectStateItem(item)}
            hideState
          />
        ))}
      </Box>
    </Box>
  );
}

export default RepeatGroupView;
