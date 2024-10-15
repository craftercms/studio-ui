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

import { DiffViewComponentBaseProps } from '../utils';
import { DiffEditorProps } from '@monaco-editor/react';
import { fromString } from '../../../utils/xml';
import { getContentFileNameFromPath } from '../../../utils/content';
import TextDiffView from './TextDiffView';

export interface FileNameDiffViewProps extends Pick<DiffViewComponentBaseProps, 'aXml' | 'bXml'> {
  editorProps?: DiffEditorProps;
}

export function FileNameDiffView(props: FileNameDiffViewProps) {
  const { aXml, bXml, editorProps } = props;
  const pathA = fromString(aXml).querySelector('file-name').textContent;
  const pathB = fromString(bXml).querySelector('file-name').textContent;
  const fileNameA = getContentFileNameFromPath(pathA);
  const fileNameB = getContentFileNameFromPath(pathB);

  return <TextDiffView aXml={fileNameA} bXml={fileNameB} editorProps={editorProps} />;
}

export default FileNameDiffView;
