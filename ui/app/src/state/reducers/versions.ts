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

import GlobalState from '../../models/GlobalState';
import { createAction, createReducer } from '@reduxjs/toolkit';
import { AjaxError, AjaxResponse } from 'rxjs/ajax';
import { FetchContentVersion, VersionsResponse, VersionsStateProps } from '../../models/Version';
import { createLookupTable } from '../../utils/object';
import { DetailedItem } from '../../models/Item';

interface HistoryConfigProps {
  item: Partial<DetailedItem>;
  rootPath?: string;
  environment?: string;
  module?: string;
  isConfig?: boolean;
}

export const fetchItemVersions = /*#__PURE__*/ createAction<HistoryConfigProps>('FETCH_ITEM_VERSIONS');

export const fetchItemVersionsComplete = /*#__PURE__*/ createAction<VersionsResponse>('FETCH_ITEM_VERSIONS_COMPLETE');

export const fetchItemVersionsFailed = /*#__PURE__*/ createAction<AjaxError>('FETCH_ITEM_VERSIONS_FAILED');

export const versionsChangePage = /*#__PURE__*/ createAction<{ page: number }>('VERSIONS_CHANGE_PAGE');

export const versionsChangeItem = /*#__PURE__*/ createAction<{ item: DetailedItem }>('VERSIONS_CHANGE_ITEM');

export const compareVersion = /*#__PURE__*/ createAction<{ id: string }>('COMPARE_VERSIONS');

export const compareToPreviousVersion = /*#__PURE__*/ createAction<{ id: string }>('COMPARE_TO_PREVIOUS_VERSION');

export const resetVersionsState = /*#__PURE__*/ createAction('RESET_VERSIONS_STATE');

export const compareBothVersions = /*#__PURE__*/ createAction<{ versions: string[] }>('COMPARE_BOTH_VERSIONS');

export const compareBothVersionsComplete = /*#__PURE__*/ createAction<any>('COMPARE_BOTH_VERSIONS_COMPLETE');

export const compareBothVersionsFailed = /*#__PURE__*/ createAction<any>('COMPARE_BOTH_VERSIONS_FAILED');

export const revertContent = /*#__PURE__*/ createAction<FetchContentVersion>('REVERT_CONTENT');

export const revertContentComplete = /*#__PURE__*/ createAction<{ path: string }>('REVERT_CONTENT_COMPLETE');

export const revertContentFailed = /*#__PURE__*/ createAction<AjaxResponse<unknown>>('REVERT_CONTENT_FAILED');

export const revertToPreviousVersion = /*#__PURE__*/ createAction<{ id: string }>('REVERT_TO_PREVIOUS_VERSION');

const initialState: VersionsStateProps = {
  byId: null,
  item: null,
  rootPath: '/site/website',
  error: null,
  isFetching: null,
  current: null,
  versions: null,
  allVersions: null,
  count: 0,
  page: 0,
  limit: 10,
  selected: [],
  previous: null,
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
    current: versions.length ? versions[0].versionNumber : null,
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
    page: payload.page,
    versions: state.allVersions.slice(payload.page * state.limit, (payload.page + 1) * state.limit)
  }),
  [versionsChangeItem.type]: (state, { payload }) => ({
    ...state,
    item: payload.item
  }),
  [compareVersion.type]: (state, { payload }) => ({
    ...state,
    selected: payload ? [payload.id] : []
  }),
  [compareToPreviousVersion.type]: (state, { payload }) => {
    let i = state.allVersions.findIndex((version) => version.versionNumber === payload.id);
    let previous = state.allVersions?.[i + 1].versionNumber;
    return {
      ...state,
      selected: [payload.id, previous]
    };
  },
  [compareBothVersions.type]: (state, { payload }) => ({
    ...state,
    selected: payload.versions,
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
  [revertToPreviousVersion.type]: (state, { payload }) => {
    let i = state.allVersions.findIndex((version) => version.versionNumber === payload.id);
    let previous = state.allVersions?.[i + 1].versionNumber;
    return {
      ...state,
      previous: previous,
      isFetching: true
    };
  },
  [revertContent.type]: (state) => ({
    ...state,
    isFetching: true
  }),
  [revertContentComplete.type]: (state) => ({
    ...state
  }),
  [revertContentFailed.type]: (state, { payload }) => ({
    ...state,
    error: payload.response,
    isFetching: false
  }),
  [resetVersionsState.type]: () => initialState
});

export default reducer;
