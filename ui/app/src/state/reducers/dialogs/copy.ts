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
import { closeCopyDialog, copyDialogClosed, showCopyDialog, updateCopyDialog } from '../../actions/dialogs';
import { CopyDialogStateProps } from '../../../components/CopyDialog/utils';

const initialState: CopyDialogStateProps = {
  hasPendingChanges: false,
  isMinimized: false,
  isSubmitting: false,
  site: null,
  open: false,
  item: null
};

export default createReducer<GlobalState['dialogs']['copy']>(initialState, {
  [showCopyDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeCopyDialog(),
    onClosed: copyDialogClosed(),
    onOk: closeCopyDialog(),
    ...payload,
    open: true
  }),
  [closeCopyDialog.type]: (state) => ({
    ...state,
    open: false
  }),
  [updateCopyDialog.type]: (state, { payload }) => ({
    ...state,
    ...payload
  }),
  [copyDialogClosed.type]: () => initialState
});
