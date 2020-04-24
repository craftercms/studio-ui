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

import { createAction, createReducer } from '@reduxjs/toolkit';
import StandardAction from '../../../models/StandardAction';
import GlobalState from '../../../models/GlobalState';
import { HistoryDialogStateProps } from '../../../modules/Content/History/HistoryDialog';
import { AjaxError } from 'rxjs/ajax';
import { closeViewVersionDialog, showViewVersionDialog } from './viewVersion';

interface HistoryConfigProps {
  path: string;
  environment?: string;
  module?: string;
  config?: boolean;
}

export const showHistoryDialog = createAction<HistoryDialogStateProps>('SHOW_HISTORY_DIALOG');

export const closeHistoryDialog = createAction<StandardAction>('CLOSE_HISTORY_DIALOG');

export const historyDialogChangePage = createAction<number>('HISTORY_DIALOG_CHANGE_PAGE');

export const revertContent = createAction<string>('REVERT_CONTENT');

export const revertContentComplete = createAction<Boolean>('REVERT_CONTENT_COMPLETE');

export const revertContentFailed = createAction<AjaxError>('REVERT_CONTENT_FAILED');

const initialState = {
  open: false,
  item: null,
  current: null,
  rowsPerPage: 10,
  page: 0,
  path: null,
  config: null,
  environment: null,
  error: null,
  isFetching: null,
  versions: null
};

export default createReducer<GlobalState['dialogs']['history']>(
  initialState,
  {
    [showHistoryDialog.type]: (state, { payload }) => ({
      ...state,
      onDismiss: closeHistoryDialog(),
      ...payload,
      open: true
    }),
    [closeHistoryDialog.type]: (state) => ({
      ...initialState,
      onClose: state.onClose
    }),
    [historyDialogChangePage.type]: (state, { payload }) => ({
      ...state,
      page: payload
    }),
    [revertContent.type]: (state) => ({
      ...state,
      isFetching: true
    }),
    [revertContentComplete.type]: (state) => ({
      ...state,
      isFetching: false
    }),
    [revertContentFailed.type]: (state, { payload }) => ({
      ...state,
      error: payload.response,
      isFetching: false
    }),
    [closeViewVersionDialog.type]: () => initialState,
    [showViewVersionDialog.type]: (state) => ({
      ...state,
      open: false
    })
  }
);
