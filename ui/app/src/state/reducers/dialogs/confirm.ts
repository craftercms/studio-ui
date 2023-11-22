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
import { closeConfirmDialog, confirmDialogClosed, showConfirmDialog } from '../../actions/dialogs';
import { ConfirmDialogStateProps } from '../../../components';

export default createReducer<GlobalState['dialogs']['confirm']>({ open: false }, (builder) => {
  builder
    .addCase(showConfirmDialog, (state, { payload }) => ({
      // By default, if no callback is specified, assume an ok button.
      // To not have a "Ok" button, action creator must be called with onOk: null.
      // This allows easily sending information dialogs with a ok button.
      onClose: closeConfirmDialog(),
      onClosed: confirmDialogClosed(),
      onOk: closeConfirmDialog(),
      ...(payload as Partial<ConfirmDialogStateProps>),
      open: true
    }))
    .addCase(closeConfirmDialog, (state) => ({ ...state, open: false }))
    .addCase(confirmDialogClosed, () => ({ open: false }));
});
