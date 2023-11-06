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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import { closeEditDialog, editDialogClosed, showEditDialog, updateEditConfig } from '../../actions/dialogs';
import { nnou } from '../../../utils/object';
import { LegacyFormDialogStateProps } from '../../../components/LegacyFormDialog/utils';
import { changeSite } from '../../actions/sites';

const initialState: LegacyFormDialogStateProps = {
  open: false,
  isMinimized: null,
  path: null,
  site: null,
  authoringBase: null,
  inProgress: true,
  isSubmitting: false
};

export default createReducer<GlobalState['dialogs']['edit']>(initialState, (builder) => {
  builder
    .addCase(showEditDialog, (state, { payload }) => {
      // Should the dialog be opened already, 1. we don't need to reopen 2. if it's opened with a different form, we
      // don't want to override and possibly lose form edits that are unsaved. Currently, the epic validates and shows
      // a message to the user stating to please close the other form before opening a new one.
      return state.open || nnou(state.path)
        ? state
        : {
            ...state,
            onClose: closeEditDialog(),
            onClosed: editDialogClosed(),
            onMinimize: updateEditConfig({ isMinimized: true }),
            onMaximize: updateEditConfig({ isMinimized: false }),
            ...payload,
            open: true
          };
    })
    .addCase(updateEditConfig, (state, { payload }) => ({
      ...state,
      ...payload
    }))
    .addCase(closeEditDialog, (state) => ({
      ...state,
      open: false
    }))
    .addCase(editDialogClosed, () => initialState)
    .addCase(changeSite, () => initialState);
});
