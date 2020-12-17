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
import { createReducer } from '@reduxjs/toolkit';
import { fetchSiteUiConfig, fetchSiteUiConfigComplete, fetchSiteUiConfigFailed } from '../actions/configuration';

const initialState: GlobalState['uiConfig'] = {
  error: null,
  isFetching: null,
  currentSite: null,
  preview: {
    toolsPanel: {
      widgets: null
    }
  },
  globalNav: {
    sections: []
  }
};

const reducer = createReducer<GlobalState['uiConfig']>(initialState, {
  [fetchSiteUiConfig.type]: (state, { payload: { site } }) => ({
    ...state,
    isFetching: true,
    currentSite: site
  }),
  [fetchSiteUiConfigComplete.type]: (state, { payload }) => ({
    ...state,
    isFetching: false,
    ...payload
  }),
  [fetchSiteUiConfigFailed.type]: (state, { payload }) => ({
    ...state,
    error: payload,
    isFetching: false,
    currentSite: null
  })
});

export default reducer;
