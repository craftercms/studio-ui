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

import { defineMessages } from 'react-intl';

export const translations = defineMessages({
  title: {
    id: 'codeEditor.title',
    defaultMessage: 'Code Editor'
  },
  save: {
    id: 'words.save',
    defaultMessage: 'Save'
  },
  saveAndClose: {
    id: 'codeEditor.saveAndClose',
    defaultMessage: 'Save & Close'
  },
  saveAndMinimize: {
    id: 'codeEditor.saveAndMinimize',
    defaultMessage: 'Save & Minimize'
  },
  saved: {
    id: 'codeEditor.saved',
    defaultMessage: 'Item saved successfully'
  },
  pendingChanges: {
    id: 'codeEditor.pendingChangesConfirmation',
    defaultMessage: 'Close without saving changes?'
  }
});

export default translations;
