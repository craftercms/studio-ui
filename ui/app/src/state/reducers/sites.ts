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
import { GlobalState } from '../../models/GlobalState';
import { StandardAction } from '../../models/StandardAction';
import { Site } from '../../models/Site';
import { createLookupTable, reversePluckProps } from '../../utils/object';
import { getSiteCookie } from '../../utils/auth';
import { storeInitialized } from '../actions/system';

const CHANGE_SITE = 'CHANGE_SITE';

export function changeSite(nextSite: string, nextUrl: string = '/'): StandardAction {
  return {
    type: CHANGE_SITE,
    payload: { nextSite, nextUrl }
  };
}

changeSite.type = CHANGE_SITE;

export const fetchSites = /*#__PURE__*/ createAction('FETCH_SITES');
export const fetchSitesComplete = /*#__PURE__*/ createAction<Site[]>('FETCH_SITES_COMPLETE');
export const fetchSitesFailed = /*#__PURE__*/ createAction('FETCH_SITES_FAILED');
export const popSite = /*#__PURE__*/ createAction<{ siteId: string }>('POP_SITE');

export const initialState: GlobalState['sites'] = {
  byId: {},
  active: getSiteCookie(),
  isFetching: false
};

const reducer = createReducer<GlobalState['sites']>(initialState, {
  [storeInitialized.type]: (state, { payload }) => ({ ...state, byId: createLookupTable(payload.sites) }),
  [CHANGE_SITE]: (state, { payload }) =>
    payload.nextSite === state.active
      ? state
      : {
          ...state,
          active: payload.nextSite
        },
  [fetchSites.type]: (state, action) => ({
    ...state,
    isFetching: true
  }),
  [fetchSitesComplete.type]: (state, { payload }) => ({
    ...state,
    byId: createLookupTable(payload),
    isFetching: false
  }),
  [fetchSitesFailed.type]: (state, action) => ({
    ...state,
    isFetching: false
  }),
  [popSite.type]: (state, { payload }) =>
    !payload?.site
      ? state
      : {
          ...state,
          byId: reversePluckProps(state.byId, payload.site)
        }
});

export default reducer;
