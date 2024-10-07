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
import DefaultView from './ViewVersionDefaultFieldView';

export interface ContentFieldViewProps {
  content: Primitive;
  field: ContentTypeField;
  xml?: string;
  showToolbar?: boolean;
  contentTypeFields: ContentTypeField[];
  showToolbarFieldNavigation?: boolean;
  dynamicHeight?: boolean;
  onSelectField?(field: ContentTypeField): void;
}

const typesRenderMap = {
  text: MonacoWrapper,
  textarea: MonacoWrapper,
  html: MonacoWrapper,
  'node-selector': DefaultView,
  'checkbox-group': DefaultView,
  repeat: DefaultView,
  image: DefaultView,
  'video-picker': DefaultView,
  time: DefaultView,
  'date-time': DefaultView,
  boolean: DefaultView,
  'numeric-input': DefaultView,
  dropdown: DefaultView
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
  const ViewComponent = typesRenderMap[field.type] ?? DefaultView;
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

  return (
    <Box sx={{ flexGrow: 1, maxHeight: 'calc(100% - 60px)' }}>
      {viewXml ? (
        <MonacoWrapper contentA={fieldXml} isHTML={true} editorProps={viewComponentProps.editorProps} />
      ) : nnou(ViewComponent) ? (
        <ViewComponent {...viewComponentProps} />
      ) : null}
    </Box>
  );
}

export default ContentFieldView;
