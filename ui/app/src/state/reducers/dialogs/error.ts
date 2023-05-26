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

import { createAction, createReducer } from '@reduxjs/toolkit';
import StandardAction from '../../../models/StandardAction';
import GlobalState from '../../../models/GlobalState';
import { ErrorDialogStateProps } from '../../../components/ErrorDialog/ErrorDialog';

export const showErrorDialog = /*#__PURE__*/ createAction<Partial<ErrorDialogStateProps>>('SHOW_ERROR_DIALOG');

export const closeErrorDialog = /*#__PURE__*/ createAction<StandardAction>('CLOSE_ERROR_DIALOG');
export const errorDialogClosed = /*#__PURE__*/ createAction<StandardAction>('ERROR_DIALOG_CLOSED');

const initialState: ErrorDialogStateProps = {
  open: false,
  error: null
};

export default createReducer<GlobalState['dialogs']['error']>(initialState, (builder) => {
  builder
    .addCase(showErrorDialog, (state, { payload }) => ({
      onClose: closeErrorDialog(),
      onClosed: errorDialogClosed(),
      onDismiss: closeErrorDialog(),
      ...(payload as Partial<ErrorDialogStateProps>),
      open: true
    }))
    .addCase(closeErrorDialog, (state) => ({ ...state, open: false }))
    .addCase(errorDialogClosed, (state) => initialState);
});
