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
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  shortcuts: {
    id: 'words.shortcuts',
    defaultMessage: 'Shortcuts'
  },
  toggleEditMode: {
    id: 'shortcuts.toggleEditMode',
    defaultMessage: 'Edit Mode ON/OFF'
  },
  toggleMoveMode: {
    id: 'shortcuts.toggleMoveMode',
    defaultMessage: 'Move Mode ON/OFF'
  },
  disableICE: {
    id: 'shortcuts.disableICE',
    defaultMessage: 'Disable ICE while held down (to click through)'
  },
  showShortcuts: {
    id: 'shortcuts.showShortcuts',
    defaultMessage: 'Show keyboard shortcuts'
  },
  editModePadding: {
    id: 'shortcuts.editModePadding',
    defaultMessage: 'Toggle edit mode padding'
  }
});

export const previewKeyboardShortcuts: KeyboardShortcutsCategory[] = [
  {
    label: messages.shortcuts,
    shortcuts: [
      {
        label: messages.toggleEditMode,
        shortcut: 'e'
      },
      {
        label: messages.toggleMoveMode,
        shortcut: 'm'
      },
      {
        label: messages.disableICE,
        shortcut: 'z'
      },
      {
        label: messages.editModePadding,
        shortcut: 'p'
      },
      {
        label: messages.showShortcuts,
        shortcut: '?'
      }
    ]
  }
];
