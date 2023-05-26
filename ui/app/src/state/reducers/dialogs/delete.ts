/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License version 3 as published by
 *  the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import {
  closeDeleteDialog,
  deleteDialogClosed,
  fetchDeleteDependencies,
  fetchDeleteDependenciesComplete,
  fetchDeleteDependenciesFailed,
  showDeleteDialog,
  updateDeleteDialog
} from '../../actions/dialogs';
import { DeleteDialogStateProps } from '../../../components/DeleteDialog/utils';

const initialState: DeleteDialogStateProps = {
  open: false,
  isSubmitting: null,
  isMinimized: null,
  hasPendingChanges: null,
  items: null,
  isFetching: false,
  childItems: null,
  dependentItems: null,
  error: null
};

export default createReducer<GlobalState['dialogs']['delete']>(initialState, (builder) => {
  builder
    .addCase(showDeleteDialog, (state, { payload }) => ({
      ...state,
      onClose: closeDeleteDialog(),
      onClosed: deleteDialogClosed(),
      ...(payload as Partial<DeleteDialogStateProps>),
      open: true
    }))
    .addCase(updateDeleteDialog, (state, { payload }) => ({
      ...state,
      ...(payload as Partial<DeleteDialogStateProps>)
    }))
    .addCase(closeDeleteDialog, (state) => ({ ...state, open: false }))
    .addCase(deleteDialogClosed, () => initialState)
    .addCase(fetchDeleteDependencies, (state) => ({
      ...state,
      isFetching: true
    }))
    .addCase(fetchDeleteDependenciesComplete, (state, { payload }) => ({
      ...state,
      isFetching: false,
      ...payload
    }))
    .addCase(fetchDeleteDependenciesFailed, (state, { payload }) => ({
      ...state,
      isFetching: false,
      error: payload.response
    }));
});
