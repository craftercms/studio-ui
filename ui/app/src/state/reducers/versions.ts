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
import { createEntityState, createLookupTable } from '../../utils/object';
import { createAction, createReducer } from '@reduxjs/toolkit';
//import { FETCH_CONTENT_TYPES, FETCH_CONTENT_TYPES_COMPLETE, FETCH_CONTENT_TYPES_FAILED } from '../actions/preview';
import ContentType from '../../models/ContentType';
import { changeSite } from './sites';
import { LegacyVersion, VersionsResponse } from '../../models/version';
import { AjaxError } from 'rxjs/ajax';

interface HistoryConfigProps {
  path: string;
  environment?: string;
  module?: string;
  config?: boolean;
}

export const fetchItemVersions = createAction<HistoryConfigProps>('FETCH_ITEM_VERSIONS');

export const fetchItemVersionsComplete = createAction<VersionsResponse>('FETCH_ITEM_VERSIONS_COMPLETE');

export const fetchItemVersionsFailed = createAction<AjaxError>('FETCH_ITEM_VERSIONS_FAILED');

const initialState = {
  //byId: null,
  error: null,
  isFetching: null,
  versions: null
}


const reducer = createReducer<GlobalState['versions']>(initialState, {
  [fetchItemVersions.type]: (state) => ({
    ...state,
    isFetching: true
  }),
  [fetchItemVersionsComplete.type]: (state, { payload: { versions } }) => ({
    ...state,
    //byId: createLookupTable<LegacyVersion>(versions, 'versionNumber'),
    versions: versions,
    isFetching: false,
    error: null
  }),
  [fetchItemVersionsFailed.type]: (state, { payload }) => ({
    ...state,
    error: payload.response,
    isFetching: false
  })
});

export default reducer;
