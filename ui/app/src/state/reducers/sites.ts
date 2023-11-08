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
import { GlobalState } from '../../models/GlobalState';
import { createLookupTable, reversePluckProps } from '../../utils/object';
import { storeInitialized } from '../actions/system';
import { changeSite, fetchSites, fetchSitesComplete, fetchSitesFailed, popSite } from '../actions/sites';

export const initialState: GlobalState['sites'] = {
  byId: {},
  active: null,
  isFetching: false
};

const reducer = createReducer<GlobalState['sites']>(initialState, (builder) => {
  builder
    .addCase(storeInitialized, (state, { payload }) => ({
      ...state,
      byId: createLookupTable(payload.sites),
      active: payload.activeSiteId
    }))
    .addCase(changeSite, (state, { payload }) =>
      payload.nextSite === state.active
        ? state
        : {
            ...state,
            active: payload.nextSite
          }
    )
    .addCase(fetchSites, (state, action) => ({
      ...state,
      isFetching: true
    }))
    .addCase(fetchSitesComplete, (state, { payload }) => ({
      ...state,
      byId: createLookupTable(payload),
      isFetching: false
    }))
    .addCase(fetchSitesFailed, (state, action) => ({
      ...state,
      isFetching: false
    }))
    .addCase(popSite, (state, { payload }) =>
      !payload?.siteId
        ? state
        : {
            ...state,
            byId: reversePluckProps(state.byId, payload.siteId)
          }
    );
});

export default reducer;
