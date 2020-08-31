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

import { GlobalState } from '../../models/GlobalState';
import { combineReducers, createReducer } from '@reduxjs/toolkit';
import {
  fetchSidebarConfig,
  fetchSidebarConfigComplete,
  fetchSidebarConfigFailed
} from '../actions/configuration';

const initialState: GlobalState['configuration'] = {
  sidebar: {
    error: null,
    isFetching: false,
    items: null
  }
};

const sidebar = createReducer<GlobalState['configuration']['sidebar']>(initialState.sidebar, {
  [fetchSidebarConfig.type]: (state) => ({
    ...state,
    isFetching: true,
    error: null
  }),
  [fetchSidebarConfigComplete.type]: (state, { payload }) => ({
    ...state,
    isFetching: false,
    error: null,
    items: payload
  }),
  [fetchSidebarConfigFailed.type]: (state, { payload }) => ({
    ...state,
    isFetching: false,
    error: payload
  })
});

const reducer = combineReducers({ sidebar });

export default reducer;
