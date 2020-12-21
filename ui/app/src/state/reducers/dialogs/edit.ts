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
import { closeEditDialog, editDialogClosed, showEditDialog, updateEditConfig } from '../../actions/dialogs';
import { LegacyFormDialogStateProps } from '../../../components/Dialogs/LegacyFormDialog';

const initialState: LegacyFormDialogStateProps = {
  open: false,
  inProgress: true
};

export default createReducer<GlobalState['dialogs']['edit']>(initialState, {
  [showEditDialog.type]: (state, { payload }) => {
    return state.open
      ? state
      : {
          ...state,
          onClose: closeEditDialog(),
          onClosed: editDialogClosed(),
          onDismiss: closeEditDialog(),
          ...payload,
          open: true
        };
  },
  [updateEditConfig.type]: (state, { payload }) => ({
    ...state,
    ...payload
  }),
  [closeEditDialog.type]: (state) => ({
    ...state,
    open: false
  }),
  [editDialogClosed.type]: () => initialState
});
