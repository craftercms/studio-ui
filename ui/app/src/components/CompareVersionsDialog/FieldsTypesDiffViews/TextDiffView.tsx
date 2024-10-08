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
import { DiffEditor, DiffEditorProps, EditorProps } from '@monaco-editor/react';
import { useVersionsDialogContext } from '../VersionsDialogContext';
import { removeTags } from '../utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

export interface TextViewProps {
  contentA: string;
  contentB: string;
  field?: ContentTypeField;
  editorProps?: EditorProps;
}

export function TextDiffView(props) {
  const { contentA, contentB, field, editorProps } = props;
  const [{ fieldsViewState }] = useVersionsDialogContext();
  const cleanText = field && fieldsViewState[field.id]?.cleanText;
  const originalContent = cleanText ? removeTags(contentA ?? '') : contentA;
  const modifiedContent = cleanText ? removeTags(contentB ?? '') : contentB;

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isHTML = field?.type === 'html'; // TODO: more accurate language depending on field.type

  // TODO: move to context
  const monacoOptions: DiffEditorProps['options'] = {
    readOnly: true,
    automaticLayout: true,
    fontSize: 14,
    contextmenu: false,
    scrollBeyondLastLine: false,
    renderWhitespace: 'none',
    renderIndicators: false,
    scrollbar: { alwaysConsumeMouseWheel: false },
    ...editorProps.options
  };

  return (
    <DiffEditor // text diff
      height="100%"
      language={isHTML ? 'html' : 'xml'} // TODO: more accurate language depending on field.type
      original={originalContent}
      modified={modifiedContent}
      theme={prefersDarkMode ? 'vs-dark' : 'vs'}
      {...(editorProps as DiffEditorProps)}
      options={monacoOptions}
    />
  );
}

export default TextDiffView;
