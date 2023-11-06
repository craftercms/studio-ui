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
  fetchRenameAssetDependants,
  fetchRenameAssetDependantsFailed,
  renameAssetDialogClosed,
  showRenameAssetDialog,
  updateRenameAssetDialog
} from '../../actions/dialogs';

const initialState: RenameAssetStateProps = {
  error: undefined,
  open: false,
  isSubmitting: null,
  isMinimized: null,
  hasPendingChanges: null,
  path: null,
  type: null,
  dependantItems: null,
  fetchingDependantItems: false
};

export default createReducer<GlobalState['dialogs']['renameAsset']>(initialState, (builder) => {
  builder
    .addCase(showRenameAssetDialog, (state, { payload }) => ({
      ...state,
      onClose: closeRenameAssetDialog(),
      onClosed: renameAssetDialogClosed(),
      onRenamed: closeRenameAssetDialog(),
      // Omitting error property from payload because of a ts error showing up.
      ...(payload as Partial<Omit<RenameAssetStateProps, 'error'>>),
      open: true
    }))
    .addCase(closeRenameAssetDialog, (state) => ({
      ...state,
      open: false
    }))
    .addCase(updateRenameAssetDialog, (state, { payload }) => ({
      ...state,
      // Omitting error property from payload because of a ts error showing up.
      ...(payload as Partial<Omit<RenameAssetStateProps, 'error'>>)
    }))
    .addCase(renameAssetDialogClosed, () => initialState)
    .addCase(fetchRenameAssetDependants, (state) => ({
      ...state,
      fetchingDependantItems: true
    }))
    .addCase(fetchRenameAssetDependantsComplete, (state, { payload }) => ({
      ...state,
      dependantItems: payload.dependants,
      fetchingDependantItems: false
    }))
    .addCase(fetchRenameAssetDependantsFailed, (state, { payload }) => ({
      ...state,
      fetchingDependantItems: false,
      error: payload
    }));
});
