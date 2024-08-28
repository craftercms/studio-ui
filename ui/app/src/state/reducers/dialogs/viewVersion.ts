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
import {
  closeViewVersionDialog,
  fetchContentVersion,
  fetchContentVersionComplete,
  fetchContentVersionFailed,
  showHistoryDialog,
  showViewVersionDialog,
  viewVersionDialogClosed
} from '../../actions/dialogs';
import { ViewVersionDialogStateProps } from '../../../components/ViewVersionDialog/utils';

const initialState: ViewVersionDialogStateProps = {
  open: false,
  isSubmitting: null,
  isMinimized: null,
  hasPendingChanges: null,
  isFetching: null,
  error: null,
  version: null,
  showXml: false
};

export default createReducer<GlobalState['dialogs']['viewVersion']>(initialState, (builder) => {
  builder
    .addCase(showViewVersionDialog, (state, { payload }) => ({
      ...state,
      onClose: closeViewVersionDialog(),
      onClosed: viewVersionDialogClosed(),
      ...(payload as Partial<ViewVersionDialogStateProps>),
      open: true
    }))
    .addCase(closeViewVersionDialog, (state) => ({
      ...state,
      open: false
    }))
    .addCase(viewVersionDialogClosed, () => initialState)
    .addCase(fetchContentVersion, (state) => ({
      ...state,
      isFetching: true
    }))
    .addCase(fetchContentVersionComplete, (state, { payload }) => ({
      ...state,
      isFetching: false,
      version: payload
    }))
    .addCase(fetchContentVersionFailed, (state) => ({
      ...state,
      isFetching: false
    }))
    .addCase(showHistoryDialog, (state) => ({
      ...state,
      open: false
    }));
});
