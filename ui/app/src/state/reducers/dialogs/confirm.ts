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

import { createAction, createReducer } from '@reduxjs/toolkit';
import { ConfirmDialogStateProps } from '../../../components/UserControl/ConfirmDialog';
import StandardAction from '../../../models/StandardAction';
import GlobalState from '../../../models/GlobalState';

export const showConfirmDialog = createAction<Partial<ConfirmDialogStateProps>>(
  'SHOW_CONFIRM_DIALOG'
);

export const closeConfirmDialog = createAction<StandardAction>('CLOSE_CONFIRM_DIALOG');

export default createReducer<GlobalState['dialogs']['confirm']>(
  { open: false },
  {
    [showConfirmDialog.type]: (state, { payload }) => ({
      // By default, if no callback is specified, assume an ok button.
      // To not have a "Ok" button, action creator must be called with onOk: null.
      // This allows easily sending information dialogs with a ok button.
      onOk: closeConfirmDialog(),
      ...payload,
      open: true
    }),
    // Leaving/carrying the onClose as otherwise, it would never get executed since,
    // the callback would be gone by the time the dialog animation is done (react would have
    // already updated the props. Every time the dialog is opened, the onClose is cleansed anyway.
    [closeConfirmDialog.type]: (state) => ({ open: false, onClose: state.onClose })
  }
);
