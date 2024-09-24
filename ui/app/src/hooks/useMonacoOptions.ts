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

import useSpreadState from './useSpreadState';
import { DiffEditorProps } from '@monaco-editor/react';

export const useMonacoOptions = () => {
  const [options, setOptions] = useSpreadState<DiffEditorProps['options']>({
    ignoreTrimWhitespace: false,
    renderSideBySide: true,
    diffWordWrap: 'off', // for diff editor
    wordWrap: 'on' // for regular editor
  });
  const toggleIgnoreTrimWhitespace = () => setOptions({ ignoreTrimWhitespace: !options.ignoreTrimWhitespace });
  const toggleRenderSideBySide = () => setOptions({ renderSideBySide: !options.renderSideBySide });
  const toggleDiffWordWrap = () => setOptions({ diffWordWrap: options.diffWordWrap === 'on' ? 'off' : 'on' });
  const toggleWordWrap = () => setOptions({ wordWrap: options.wordWrap === 'on' ? 'off' : 'on' });

  return {
    options,
    toggleIgnoreTrimWhitespace,
    toggleRenderSideBySide,
    toggleDiffWordWrap,
    toggleWordWrap
  };
};

export default useMonacoOptions;
