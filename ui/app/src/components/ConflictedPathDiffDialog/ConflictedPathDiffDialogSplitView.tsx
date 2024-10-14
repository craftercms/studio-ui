/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useRef } from 'react';
import { FileDiff } from '../../models/Repository';
import { withMonaco } from '../../utils/system';
import useMediaQuery from '@mui/material/useMediaQuery';

export interface SplitViewProps {
  diff: FileDiff;
  className?: string;
}

export function ConflictedPathDiffDialogSplitView(props: SplitViewProps) {
  const { diff, className } = props;
  const ref = useRef();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const diffEditorRef = useRef(null);
  useEffect(() => {
    if (diff) {
      withMonaco((monaco) => {
        const studioVersion = monaco.editor.createModel(diff.studioVersion, 'text/plain');
        const remoteVersion = monaco.editor.createModel(diff.remoteVersion, 'text/plain');
        monaco.editor.setTheme(prefersDarkMode ? 'vs-dark' : 'vs');
        // Only create diff editor if it doesn't exist yet.
        // This is to avoid creating a new diff editor on every update.
        if (!diffEditorRef.current) {
          diffEditorRef.current = monaco.editor.createDiffEditor(ref.current, {
            scrollbar: {
              alwaysConsumeMouseWheel: false
            },
            readOnly: true,
            // Monaco editor has a breakpoint for split view, we had to decrease it for the split view to show in current dialog
            renderSideBySideInlineBreakpoint: 300
          });
        }
        diffEditorRef.current.setModel({
          original: studioVersion,
          modified: remoteVersion
        });
      });
    }
  }, [diff, prefersDarkMode]);

  return <div ref={ref} className={className} />;
}

export default ConflictedPathDiffDialogSplitView;
