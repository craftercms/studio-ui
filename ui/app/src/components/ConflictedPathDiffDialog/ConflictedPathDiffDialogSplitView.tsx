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

export interface SplitViewProps {
  diff: FileDiff;
  className?: string;
}

export function ConflictedPathDiffDialogSplitView(props: SplitViewProps) {
  const { diff, className } = props;
  const ref = useRef();

  useEffect(() => {
    if (diff) {
      withMonaco((monaco) => {
        const studioVersion = monaco.editor.createModel(diff.studioVersion, 'text/plain');
        const remoteVersion = monaco.editor.createModel(diff.remoteVersion, 'text/plain');
        const diffEditor = monaco.editor.createDiffEditor(ref.current, {
          scrollbar: {
            alwaysConsumeMouseWheel: false
          },
          readOnly: true
        });
        diffEditor.setModel({
          original: studioVersion,
          modified: remoteVersion
        });
      });
    }
  }, [diff]);

  return <div ref={ref} className={className} />;
}

export default ConflictedPathDiffDialogSplitView;
