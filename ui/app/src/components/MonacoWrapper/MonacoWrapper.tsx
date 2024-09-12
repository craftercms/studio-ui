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

import { PartialSxRecord } from '../../models';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { removeTags } from '../CompareVersionsDialog';
import { withMonaco } from '../../utils/system';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';

interface MonacoWrapperProps {
  contentA: string;
  contentB?: string;
  isHTML?: boolean;
  isDiff?: boolean;
  cleanText?: boolean;
  sxs?: PartialSxRecord<'root' | 'editor'>;
}

export function MonacoWrapper(props: MonacoWrapperProps) {
  const { contentA, contentB, isHTML = false, cleanText, sxs, isDiff = false } = props;
  const diffRef = useRef(null);
  diffRef.current = isDiff;
  const ref = useRef();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const originalContent = useMemo(() => (cleanText ? removeTags(contentA ?? '') : contentA), [cleanText, contentA]);
  const modifiedContent = useMemo(() => (cleanText ? removeTags(contentB ?? '') : contentB), [cleanText, contentB]);
  const [diffEditor, setDiffEditor] = useState(null);

  useEffect(() => {
    if (ref.current) {
      withMonaco((monaco) => {
        if (diffRef.current) {
          setDiffEditor(
            monaco.editor.createDiffEditor(ref.current, {
              readOnly: true,
              automaticLayout: true
            })
          );
        } else {
          setDiffEditor(
            monaco.editor.create(ref.current, {
              readOnly: true,
              automaticLayout: true
            })
          );
        }
      });
    }
  }, []);

  useEffect(() => {
    if (diffEditor) {
      withMonaco((monaco) => {
        monaco.editor.setTheme(prefersDarkMode ? 'vs-dark' : 'vs');
        if (diffRef.current) {
          const originalModel = monaco.editor.createModel(originalContent, 'html');
          const modifiedModel = monaco.editor.createModel(modifiedContent, 'html');
          diffEditor.setModel({
            original: originalModel,
            modified: modifiedModel
          });
        } else {
          const model = monaco.editor.createModel(originalContent, isHTML ? 'html' : 'xml');
          diffEditor.setModel(model);
        }
      });
    }
  }, [diffEditor, originalContent, modifiedContent, prefersDarkMode, isHTML]);

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: '100%',
        ...sxs?.editor,
        '&.unChanged': {
          height: 'auto'
        }
      }}
    />
  );
}

export default MonacoWrapper;
