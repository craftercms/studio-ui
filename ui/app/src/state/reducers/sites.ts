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
import { createLookupTable } from '../../utils/object';

const CHANGE_SITE = 'CHANGE_SITE';

export function changeSite(nextSite: string, nextUrl: string = '/'): StandardAction {
  return {
    type: CHANGE_SITE,
    payload: { nextSite, nextUrl }
  };
}

changeSite.type = CHANGE_SITE;

export const fetchSites = createAction('FETCH_SITES');
export const fetchSitesComplete = createAction<Site[]>('FETCH_SITES_COMPLETE');
export const fetchSitesFailed = createAction('FETCH_SITES_FAILED');

const reducer = createReducer<GlobalState['sites']>(
  { byId: {}, active: null, isFetching: false },
  {
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
    })
  }
);

export default reducer;
