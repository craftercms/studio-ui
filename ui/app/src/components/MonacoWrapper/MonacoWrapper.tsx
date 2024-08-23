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
  contentB: string;
  isHTML?: boolean;
  sxs?: PartialSxRecord<'root' | 'editor'>;
}

export function MonacoWrapper(props: MonacoWrapperProps) {
  const { contentA, contentB, isHTML = false, sxs } = props;
  const ref = useRef();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [cleanText, setCleanText] = useState(false);
  const originalContent = useMemo(() => (cleanText ? removeTags(contentA ?? '') : contentA), [cleanText, contentA]);
  const modifiedContent = useMemo(() => (cleanText ? removeTags(contentB ?? '') : contentB), [cleanText, contentB]);
  const [diffEditor, setDiffEditor] = useState(null);

  useEffect(() => {
    if (ref.current) {
      withMonaco((monaco) => {
        setDiffEditor(
          monaco.editor.createDiffEditor(ref.current, {
            scrollbar: {
              alwaysConsumeMouseWheel: false
            },
            readOnly: true
          })
        );
      });
    }
  }, []);

  useEffect(() => {
    if (diffEditor) {
      withMonaco((monaco) => {
        const originalModel = monaco.editor.createModel(originalContent, 'html');
        const modifiedModel = monaco.editor.createModel(modifiedContent, 'html');
        monaco.editor.setTheme(prefersDarkMode ? 'vs-dark' : 'vs');
        diffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
      });
    }
  }, [diffEditor, originalContent, modifiedContent, prefersDarkMode]);

  return (
    <Box sx={sxs?.root}>
      {isHTML && (
        <Button variant="outlined" onClick={() => setCleanText(!cleanText)}>
          {cleanText ? (
            <FormattedMessage defaultMessage="Show HTML" />
          ) : (
            <FormattedMessage defaultMessage="Show text" />
          )}
        </Button>
      )}
      <Box
        ref={ref}
        sx={{
          width: '100%',
          height: '150px',
          '&.unChanged': {
            height: 'auto'
          },
          ...sxs?.editor
        }}
      />
    </Box>
  );
}

export default MonacoWrapper;
