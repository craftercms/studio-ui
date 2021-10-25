/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { KeyboardShortcutsCategory } from '../components/KeyboardShortcutsDialog';

const previewKeyboardShortcuts: KeyboardShortcutsCategory[] = [
  {
    label: {
      id: 'words.shortcuts',
      defaultMessage: 'Shortcuts'
    },
    shortcuts: [
      {
        label: {
          id: 'shortcuts.toggleEditMode',
          defaultMessage: 'Edit Mode ON/OFF'
        },
        shortcut: 'e'
      },
      {
        label: {
          id: 'shortcuts.toggleModeMode',
          defaultMessage: 'Move Mode ON/OFF'
        },
        shortcut: 'm'
      },
      {
        label: {
          id: 'shortcuts.disableICE',
          defaultMessage: 'Disable ICE while held down (to click through)'
        },
        shortcut: 'z'
      },
      {
        label: {
          id: 'shortcuts.showShortcuts',
          defaultMessage: 'Show keyboard shortcuts'
        },
        shortcut: '?'
      }
    ]
  }
];

export default previewKeyboardShortcuts;
