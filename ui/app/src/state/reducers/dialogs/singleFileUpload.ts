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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import {
  closeSingleFileUploadDialog,
  showSingleFileUploadDialog,
  singleFileUploadDialogClosed,
  updateSingleFileUploadDialog
} from '../../actions/dialogs';
import { SingleFileUploadDialogStateProps } from '../../../components/SingleFileUploadDialog';

const initialState: SingleFileUploadDialogStateProps = {
  open: false,
  path: null,
  site: null,
  isSubmitting: null,
  isMinimized: null,
  hasPendingChanges: null
};

export default createReducer<GlobalState['dialogs']['singleFileUpload']>(initialState, {
  [showSingleFileUploadDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeSingleFileUploadDialog(),
    onClosed: singleFileUploadDialogClosed(),
    ...payload,
    open: true
  }),
  [closeSingleFileUploadDialog.type]: (state) => ({
    ...state,
    open: false
  }),
  [updateSingleFileUploadDialog.type]: (state, { payload }) => ({
    ...state,
    ...payload
  }),
  [singleFileUploadDialogClosed.type]: () => initialState
});
