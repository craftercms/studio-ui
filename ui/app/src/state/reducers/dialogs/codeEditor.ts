/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import {
  closeCodeEditorDialog,
  codeEditorDialogClosed,
  showCodeEditorDialog,
  updateCodeEditorDialog
} from '../../actions/dialogs';
import { LegacyCodeEditorDialogStateProps } from '../../../components/Dialogs/LegacyCodeEditorDialog';

const initialState: LegacyCodeEditorDialogStateProps = {
  open: false,
  inProgress: true
};

export default createReducer<GlobalState['dialogs']['codeEditor']>(initialState, {
  [showCodeEditorDialog.type]: (state, { payload }) => {
    return state.open
      ? state
      : {
          ...state,
          onClose: closeCodeEditorDialog(),
          onClosed: codeEditorDialogClosed(),
          onDismiss: closeCodeEditorDialog(),
          ...payload,
          open: true
        };
  },
  [updateCodeEditorDialog.type]: (state, { payload }) => ({
    ...state,
    ...payload
  }),
  [closeCodeEditorDialog.type]: (state) => ({
    ...state,
    open: false
  }),
  [codeEditorDialogClosed.type]: () => initialState
});
