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
import { RenameAssetStateProps } from '../../../components/RenameAssetDialog';
import GlobalState from '../../../models/GlobalState';
import {
  closeRenameAssetDialog,
  fetchRenameAssetDependantsComplete,
  renameAssetDialogClosed,
  showRenameAssetDialog,
  updateRenameAssetDialog
} from '../../actions/dialogs';

const initialState: RenameAssetStateProps = {
  open: false,
  isSubmitting: null,
  isMinimized: null,
  hasPendingChanges: null,
  path: null,
  type: null,
  dependantItems: []
};

export default createReducer<GlobalState['dialogs']['renameAsset']>(initialState, {
  [showRenameAssetDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeRenameAssetDialog(),
    onClosed: renameAssetDialogClosed(),
    onRenamed: closeRenameAssetDialog(),
    ...payload,
    open: true
  }),
  [closeRenameAssetDialog.type]: (state) => ({
    ...state,
    open: false
  }),
  [updateRenameAssetDialog.type]: (state, { payload }) => ({
    ...state,
    ...payload
  }),
  [renameAssetDialogClosed.type]: () => initialState,
  [fetchRenameAssetDependantsComplete.type]: (state, { payload }) => ({
    ...state,
    dependantItems: payload.dependants
  })
});
