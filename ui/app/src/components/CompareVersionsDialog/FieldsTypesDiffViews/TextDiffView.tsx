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

import { ContentTypeField } from '../../../models';
import { DiffEditor, DiffEditorProps } from '@monaco-editor/react';
import { useVersionsDialogContext } from '../VersionsDialogContext';
import { DiffViewComponentBaseProps, removeTags } from '../utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { parseElementByContentType } from '../../../utils/content';
import { fromString } from '../../../utils/xml';
import useContentTypes from '../../../hooks/useContentTypes';
import { textViewLanguageMap } from '../../ViewVersionDialog/utils';

export interface TextDiffViewProps extends Pick<DiffViewComponentBaseProps, 'aXml' | 'bXml'> {
  field?: ContentTypeField;
  editorProps?: DiffEditorProps;
}

export function TextDiffView(props: TextDiffViewProps) {
  const { aXml, bXml, field, editorProps } = props;
  const contentTypes = useContentTypes();
  const contentA =
    aXml && field ? parseElementByContentType(fromString(aXml).querySelector(field.id), field, contentTypes, {}) : aXml;
  const contentB =
    bXml && field ? parseElementByContentType(fromString(bXml).querySelector(field.id), field, contentTypes, {}) : bXml;
  const [{ fieldsViewState }] = useVersionsDialogContext();
  const cleanText = field && fieldsViewState[field.id]?.cleanText;
  const originalContent = cleanText ? removeTags(contentA ?? '') : contentA;
  const modifiedContent = cleanText ? removeTags(contentB ?? '') : contentB;
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const language = textViewLanguageMap[field?.type] || 'xml';

  const monacoOptions: DiffEditorProps['options'] = {
    readOnly: true,
    automaticLayout: true,
    fontSize: 14,
    contextmenu: false,
    scrollBeyondLastLine: false,
    renderWhitespace: 'none',
    renderIndicators: false,
    scrollbar: { alwaysConsumeMouseWheel: false },
    ...editorProps?.options
  };

  return (
    <DiffEditor
      height="100%"
      language={language}
      original={originalContent}
      modified={modifiedContent}
      theme={prefersDarkMode ? 'vs-dark' : 'vs'}
      {...editorProps}
      options={monacoOptions}
    />
  );
}

export default TextDiffView;
