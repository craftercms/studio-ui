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

import GlobalState from '../../models/GlobalState';
import { createAction, createReducer } from '@reduxjs/toolkit';
import { AjaxError } from 'rxjs/ajax';
import { VersionsResponse, VersionsStateProps } from '../../models/Version';
import { createLookupTable } from '../../utils/object';

interface HistoryConfigProps {
  path: string;
  environment?: string;
  module?: string;
  config?: boolean;
}

export const fetchItemVersions = createAction<HistoryConfigProps>('FETCH_ITEM_VERSIONS');

export const fetchItemVersionsComplete = createAction<VersionsResponse>('FETCH_ITEM_VERSIONS_COMPLETE');

export const fetchItemVersionsFailed = createAction<AjaxError>('FETCH_ITEM_VERSIONS_FAILED');

export const versionsChangePage = createAction<number>('VERSIONS_CHANGE_PAGE');

export const compareVersion = createAction<string>('COMPARE_VERSIONS');

export const resetVersionsState = createAction('RESET_VERSIONS_STATE');

export const compareBothVersions = createAction<string[]>('COMPARE_BOTH_VERSIONS');

export const compareBothVersionsComplete = createAction<any>('COMPARE_BOTH_VERSIONS_COMPLETE');

export const compareBothVersionsFailed = createAction<any>('COMPARE_BOTH_VERSIONS_FAILED');

export const revertToPrevious = createAction<any>('REVERT_TO_PREVIOUS');

const initialState: VersionsStateProps = {
  byId: null,
  path: null,
  error: null,
  isFetching: null,
  current: null,
  versions: null,
  allVersions: null,
  count: 0,
  page: 0,
  limit: 10,
  selected: [],
  compareVersionsBranch: {
    compareVersions: null,
    isFetching: null,
    error: null
  }
};

const reducer = createReducer<GlobalState['versions']>(initialState, {
  [fetchItemVersions.type]: (state, { payload }) => ({
    ...state,
    ...payload,
    isFetching: true
  }),
  [fetchItemVersionsComplete.type]: (state, { payload: { versions } }) => ({
    ...state,
    byId: createLookupTable(versions, 'versionNumber'),
    count: versions.length,
    current: versions[0].versionNumber,
    allVersions: versions,
    versions: versions.slice(state.page * state.limit, (state.page + 1) * state.limit),
    isFetching: false,
    error: null
  }),
  [fetchItemVersionsFailed.type]: (state, { payload }) => ({
    ...state,
    error: payload.response,
    isFetching: false
  }),
  [versionsChangePage.type]: (state, { payload }) => ({
    ...state,
    page: payload,
    versions: state.allVersions.slice(payload * state.limit, (payload + 1) * state.limit)
    //isFetching: true
  }),
  [compareVersion.type]: (state, { payload }) => ({
    ...state,
    selected: payload ? [payload] : []
  }),
  [compareBothVersions.type]: (state, { payload }) => ({
    ...state,
    selected: payload,
    compareVersionsBranch: {
      ...state.compareVersionsBranch,
      isFetching: true
    }
  }),
  [compareBothVersionsComplete.type]: (state, { payload }) => ({
    ...state,
    compareVersionsBranch: {
      ...state.compareVersionsBranch,
      compareVersions: payload,
      isFetching: false
    }
  }),
  [compareBothVersionsFailed.type]: (state, { payload }) => ({
    ...state,
    compareVersionsBranch: {
      ...state.compareVersionsBranch,
      error: payload,
      isFetching: false
    }
  }),
  [resetVersionsState.type]: () => initialState
});

export default reducer;
