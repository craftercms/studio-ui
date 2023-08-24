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
import { createReducer } from '@reduxjs/toolkit';
import { VersionsStateProps } from '../../models/Version';
import { createLookupTable } from '../../utils/object';
import {
  compareBothVersions,
  compareBothVersionsComplete,
  compareBothVersionsFailed,
  compareToPreviousVersion,
  compareVersion,
  fetchItemVersions,
  fetchItemVersionsComplete,
  fetchItemVersionsFailed,
  resetVersionsState,
  revertContent,
  revertContentComplete,
  revertContentFailed,
  revertToPreviousVersion,
  versionsChangeItem,
  versionsChangeLimit,
  versionsChangePage
} from '../actions/versions';

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
  [fetchItemVersionsComplete.type]: (state, { payload: items }) => ({
    ...state,
    byId: createLookupTable(items, 'versionNumber'),
    count: items.length,
    current: items.length ? items[0].versionNumber : null,
    allVersions: items,
    versions: items.slice(state.page * state.limit, (state.page + 1) * state.limit),
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
  [versionsChangeLimit.type]: (state, { payload: { limit = 10 } }) => ({
    ...state,
    limit,
    page: 0,
    versions: state.allVersions.slice(0, limit)
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
    ...state,
    isFetching: false
  }),
  [revertContentFailed.type]: (state, { payload }) => ({
    ...state,
    error: payload.response,
    isFetching: false
  }),
  [resetVersionsState.type]: () => initialState
});

export default reducer;
