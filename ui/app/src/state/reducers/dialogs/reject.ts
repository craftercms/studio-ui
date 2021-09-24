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
import { closeRejectDialog, rejectDialogClosed, showRejectDialog, updateRejectDialog } from '../../actions/dialogs';
import { RejectDialogStateProps } from '../../../components/RejectDialog/utils';

const initialState: RejectDialogStateProps = {
  open: false,
  isSubmitting: null,
  isMinimized: null,
  hasPendingChanges: null
};

export default createReducer<GlobalState['dialogs']['reject']>(initialState, {
  [showRejectDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeRejectDialog(),
    onClosed: rejectDialogClosed(),
    onDismiss: closeRejectDialog(),
    ...payload,
    open: true
  }),
  [updateRejectDialog.type]: (state, { payload }) => ({ ...state, ...payload }),
  [closeRejectDialog.type]: (state) => ({ ...state, open: false }),
  [rejectDialogClosed.type]: () => ({ open: false })
});
