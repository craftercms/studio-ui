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
import { Compare, HistoryDialogStateProps } from '../../../modules/Content/History/HistoryDialog';
import { VersionsResponse } from '../../../models/version';
import { AjaxError } from 'rxjs/ajax';
import { createEntityState, createLookupTable } from '../../../utils/object';

interface HistoryConfigProps {
  path: string;
  environment?: string;
  module?: string;
  config?: boolean;
}

export const showHistoryDialog = createAction<Partial<HistoryDialogStateProps> & HistoryConfigProps>(
  'SHOW_HISTORY_DIALOG'
);

export const closeHistoryDialog = createAction<StandardAction>('CLOSE_HISTORY_DIALOG');

export const fetchItemVersions = createAction<StandardAction>('FETCH_ITEM_VERSIONS');

export const fetchItemVersionsComplete = createAction<VersionsResponse>('FETCH_ITEM_VERSIONS_COMPLETE');

export const fetchItemVersionsFailed = createAction<AjaxError>('FETCH_ITEM_VERSIONS_FAILED');

export const compareHistories = createAction<Compare>('COMPARE_HISTORIES');

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
  module: null,
  compare: {
    a: null,
    b: null
  },
  order: null,
  ...createEntityState()
};

export default createReducer<GlobalState['dialogs']['history']>(
  initialState,
  {
    [showHistoryDialog.type]: (state, { payload }) => ({
      ...state,
      onDismiss: closeHistoryDialog(),
      ...payload,
      open: true,
      isFetching: true
    }),
    [closeHistoryDialog.type]: (state) => ({
      ...initialState,
      onClose: state.onClose
    }),
    [fetchItemVersions.type]: (state) => ({
      ...state,
      isFetching: true
    }),
    [fetchItemVersionsComplete.type]: (state, { payload }) => ({
      ...state,
      byId: createLookupTable(payload.versions, 'versionNumber'),
      current: payload.versions[0].versionNumber,
      order: payload.versions.map(version => version.versionNumber),
      item: payload.item,
      isFetching: false
    }),
    [fetchItemVersionsFailed.type]: (state, { payload }) => ({
      ...state,
      error: payload.response,
      isFetching: false
    }),
    [compareHistories.type]: (state, { payload }) => ({
      ...state,
      compare: { ...state.compare, ...payload }
    }),
    [historyDialogChangePage.type]: (state, { payload }) => ({
      ...state,
      page: payload
    }),
    [revertContent.type]: (state, { payload }) => ({
      ...state,
      isFetching: true
    }),
    [revertContentComplete.type]: (state, { payload }) => ({
      ...state,
      isFetching: false
    }),
    [revertContentFailed.type]: (state, { payload }) => ({
      ...state,
      error: payload.response,
      isFetching: false
    })
  }
);
