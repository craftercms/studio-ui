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

const reducer = createReducer<GlobalState['versions']>(initialState, (builder) => {
  builder
    .addCase(fetchItemVersions, (state, { payload }) => ({
      ...state,
      ...(payload as Partial<VersionsStateProps>),
      isFetching: true
    }))
    .addCase(fetchItemVersionsComplete, (state, { payload: { versions } }) => ({
      ...state,
      byId: createLookupTable(versions, 'versionNumber'),
      count: versions.length,
      current: versions.length ? versions[0].versionNumber : null,
      allVersions: versions,
      versions: versions.slice(state.page * state.limit, (state.page + 1) * state.limit),
      isFetching: false,
      error: null
    }))
    .addCase(fetchItemVersionsFailed, (state, { payload }) => ({
      ...state,
      error: payload.response,
      isFetching: false
    }))
    .addCase(versionsChangePage, (state, { payload }) => ({
      ...state,
      page: payload.page,
      versions: state.allVersions.slice(payload.page * state.limit, (payload.page + 1) * state.limit)
    }))
    .addCase(versionsChangeLimit, (state, { payload: { limit = 10 } }) => ({
      ...state,
      limit,
      page: 0,
      versions: state.allVersions.slice(0, limit)
    }))
    .addCase(versionsChangeItem, (state, { payload }) => ({
      ...state,
      item: payload.item
    }))
    .addCase(compareVersion, (state, { payload }) => ({
      ...state,
      selected: payload ? [payload.id] : []
    }))
    .addCase(compareToPreviousVersion, (state, { payload }) => {
      let i = state.allVersions.findIndex((version) => version.versionNumber === payload.id);
      let previous = state.allVersions?.[i + 1].versionNumber;
      return {
        ...state,
        selected: [payload.id, previous]
      };
    })
    .addCase(compareBothVersions, (state, { payload }) => ({
      ...state,
      selected: payload.versions,
      compareVersionsBranch: {
        ...state.compareVersionsBranch,
        isFetching: true
      }
    }))
    .addCase(compareBothVersionsComplete, (state, { payload }) => ({
      ...state,
      compareVersionsBranch: {
        ...state.compareVersionsBranch,
        compareVersions: payload,
        isFetching: false
      }
    }))
    .addCase(compareBothVersionsFailed, (state, { payload }) => ({
      ...state,
      compareVersionsBranch: {
        ...state.compareVersionsBranch,
        error: payload,
        isFetching: false
      }
    }))
    .addCase(revertToPreviousVersion, (state, { payload }) => {
      let i = state.allVersions.findIndex((version) => version.versionNumber === payload.id);
      let previous = state.allVersions?.[i + 1].versionNumber;
      return {
        ...state,
        previous: previous,
        isFetching: true
      };
    })
    .addCase(revertContent, (state, { payload }) => ({
      ...state,
      isFetching: true
    }))
    .addCase(revertContentComplete, (state) => ({
      ...state,
      isFetching: false
    }))
    .addCase(revertContentFailed, (state, { payload }) => ({
      ...state,
      error: payload.response,
      isFetching: false
    }))
    .addCase(resetVersionsState, () => initialState);
});

export default reducer;
