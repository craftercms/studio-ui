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

import { ContentTypeField, Primitive } from '../../models';
import { MonacoWrapper } from '../MonacoWrapper';
import Box from '@mui/material/Box';
import React from 'react';
import { fromString, serialize } from '../../utils/xml';
import { nnou } from '../../utils/object';
import { countLines } from '../../utils/string';
import { initialFieldViewState, useVersionsDialogContext } from '../CompareVersionsDialog/VersionsDialogContext';
import DefaultView from './FieldTypesViews/DefaultView';
import Image from './FieldTypesViews/Image';
import Video from './FieldTypesViews/Video';
import Time from './FieldTypesViews/Time';
import DateTime from './FieldTypesViews/DateTime';
import BooleanView from './FieldTypesViews/Boolean';
import NodeSelector from './FieldTypesViews/NodeSelector';
import RepeatGroup from './FieldTypesViews/RepeatGroup';
import Number from './FieldTypesViews/Number';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import CheckboxGroup from './FieldTypesViews/CheckboxGroup';

export interface ContentFieldViewProps {
  content: Primitive;
  field: ContentTypeField;
  xml?: string;
  showToolbar?: boolean;
  dynamicHeight?: boolean;
  onSelectField?(field: ContentTypeField): void;
}

export const typesViewMap = {
  text: MonacoWrapper,
  textarea: MonacoWrapper,
  html: MonacoWrapper,
  'node-selector': NodeSelector,
  'checkbox-group': CheckboxGroup,
  repeat: RepeatGroup,
  image: Image,
  'video-picker': Video,
  time: Time,
  'date-time': DateTime,
  boolean: BooleanView,
  'page-nav-order': BooleanView,
  'numeric-input': Number,
  dropdown: MonacoWrapper
};

export function ContentFieldView(props: ContentFieldViewProps) {
  const { content, field, xml = '', dynamicHeight } = props;
  const fieldDoc =
    fromString(xml).querySelector(`page > ${field.id}`) ??
    fromString(xml).querySelector(`component > ${field.id}`) ??
    fromString(xml).querySelector(`item > ${field.id}`);
  const fieldXml = fieldDoc ? serialize(fieldDoc) : '';
  const [{ fieldsViewState }] = useVersionsDialogContext();
  const viewState = fieldsViewState[field.id] ?? initialFieldViewState;
  const { compareXml: viewXml, cleanText, xmlEditorOptions } = viewState;
  const monacoEditorHeight = !dynamicHeight ? '100%' : countLines(fieldXml ?? '') < 15 ? '200px' : '600px';
  const ViewComponent = typesViewMap[field.type] ?? DefaultView;
  const viewComponentProps = {
    contentA: content,
    xml: fieldXml,
    field,
    isHTML: true,
    cleanText,
    editorProps: {
      options: xmlEditorOptions,
      height: monacoEditorHeight
    }
  };
  const noContentSet = ViewComponent !== Boolean && !content;

  return (
    <Box sx={{ flexGrow: 1, maxHeight: 'calc(100% - 60px)' }}>
      {viewXml ? (
        <MonacoWrapper contentA={fieldXml} isHTML={true} editorProps={viewComponentProps.editorProps} />
      ) : nnou(ViewComponent) ? (
        noContentSet ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary">
              <FormattedMessage defaultMessage="No content set" />
            </Typography>
          </Box>
        ) : (
          <ViewComponent {...viewComponentProps} />
        )
      ) : null}
    </Box>
  );
}

export default ContentFieldView;
