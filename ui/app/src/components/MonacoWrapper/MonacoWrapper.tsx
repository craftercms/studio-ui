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

import React, { useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { removeTags } from '../CompareVersionsDialog';
import Editor, { DiffEditor, DiffEditorProps, EditorProps } from '@monaco-editor/react';

interface MonacoWrapperProps {
  contentA: string;
  contentB?: string;
  isHTML?: boolean;
  isDiff?: boolean;
  cleanText?: boolean;
  editorProps?: EditorProps | DiffEditorProps;
}

export function MonacoWrapper(props: MonacoWrapperProps) {
  const { contentA, contentB, isHTML = false, cleanText, isDiff, editorProps = {} } = props;
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const originalContent = useMemo(() => (cleanText ? removeTags(contentA ?? '') : contentA), [cleanText, contentA]);
  const modifiedContent = useMemo(() => (cleanText ? removeTags(contentB ?? '') : contentB), [cleanText, contentB]);

  const monacoOptions: EditorProps['options'] | DiffEditorProps['options'] = {
    readOnly: true,
    automaticLayout: true,
    fontSize: 14,
    contextmenu: false
  };

  return isDiff ? (
    <DiffEditor
      height="100%"
      language={isHTML ? 'html' : 'xml'}
      original={originalContent}
      modified={modifiedContent}
      theme={prefersDarkMode ? 'vs-dark' : 'vs'}
      {...(editorProps as DiffEditorProps)}
      options={{ ...monacoOptions, ...editorProps.options }}
    />
  ) : (
    <Editor
      height="100%"
      language={isHTML ? 'html' : 'xml'}
      value={originalContent}
      theme={prefersDarkMode ? 'vs-dark' : 'vs'}
      {...(editorProps as EditorProps)}
      options={{ ...monacoOptions, ...editorProps.options }}
    />
  );
}

export default MonacoWrapper;
