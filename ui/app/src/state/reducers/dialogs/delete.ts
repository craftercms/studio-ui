/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
  dependentItems: null
};

export default createReducer<GlobalState['dialogs']['delete']>(initialState, {
  [showDeleteDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeDeleteDialog(),
    onClosed: deleteDialogClosed(),
    ...payload,
    open: true
  }),
  [updateDeleteDialog.type]: (state, { payload }) => ({
    ...state,
    ...payload
  }),
  [closeDeleteDialog.type]: (state) => ({ ...state, open: false }),
  [deleteDialogClosed.type]: () => initialState,
  [fetchDeleteDependencies.type]: (state) => ({
    ...state,
    isFetching: true
  }),
  [fetchDeleteDependenciesComplete.type]: (state, { payload }) => ({
    ...state,
    isFetching: false,
    ...payload
  })
});
