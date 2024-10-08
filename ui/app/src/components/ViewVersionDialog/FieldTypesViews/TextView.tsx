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
import Editor, { EditorProps } from '@monaco-editor/react';
import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useVersionsDialogContext } from '../../CompareVersionsDialog/VersionsDialogContext';
import { removeTags } from '../../CompareVersionsDialog';

export interface TextViewProps {
  contentA: string;
  field?: ContentTypeField;
  editorProps?: EditorProps;
}

export function TextView(props: TextViewProps) {
  const { contentA: content, field, editorProps } = props;
  const [{ fieldsViewState }] = useVersionsDialogContext();
  const cleanText = field && fieldsViewState[field.id]?.cleanText;
  const value = cleanText ? removeTags(content ?? '') : content;

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isHTML = field?.type === 'html'; // TODO: more accurate language depending on field.type - get from context

  // TODO: move to context
  const monacoOptions: EditorProps['options'] = {
    readOnly: true,
    automaticLayout: true,
    fontSize: 14,
    contextmenu: false,
    scrollBeyondLastLine: false,
    renderWhitespace: 'none',
    scrollbar: { alwaysConsumeMouseWheel: false },
    ...editorProps.options
  };

  return (
    <Editor
      height="100%"
      language={isHTML ? 'html' : 'xml'} // TODO: more accurate language depending on field.type - get from context
      value={value}
      theme={prefersDarkMode ? 'vs-dark' : 'vs'}
      {...(editorProps as EditorProps)}
      options={monacoOptions}
    />
  );
}

export default TextView;
