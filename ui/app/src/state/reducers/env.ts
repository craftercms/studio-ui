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

import { createReducer } from '@reduxjs/toolkit';
import { GlobalState } from '../../models/GlobalState';
import {
  fetchSystemInformation,
  fetchSystemInformationComplete,
  fetchSystemInformationFailed
} from '../actions/env';

const systemInformationInitialState = {
  isFetching: false,
  error: null,
  version: null
};

const initialState: GlobalState['env'] = ((origin: string) => ({
  AUTHORING_BASE: `${origin}/studio`,
  GUEST_BASE: origin,
  PREVIEW_LANDING_BASE: `/studio/preview-landing`,
  SITE_COOKIE: 'crafterSite',
  XSRF_CONFIG_ARGUMENT: '_csrf',
  XSRF_CONFIG_HEADER: 'X-XSRF-TOKEN',
  SYSTEM_INFORMATION: systemInformationInitialState
}))(
  process.env.NODE_ENV === 'production'
    ? window.location.origin
    : window.location.origin.replace(
      process.env.REACT_APP_DEV_SERVER_PORT ?? '3000',
      '8080'
    )
);

const reducer = createReducer<GlobalState['env']>(
  initialState,
  {
    [fetchSystemInformation.type]: (state) => ({
      ...state,
      SYSTEM_INFORMATION: {
        ...state.SYSTEM_INFORMATION,
        isFetching: true
      }
    }),
    [fetchSystemInformationComplete.type]: (state, action) => ({
      ...state,
      SYSTEM_INFORMATION: {
        ...state.SYSTEM_INFORMATION,
        isFetching: false,
        version: action.payload
      }
    }),
    [fetchSystemInformationFailed.type]: (state, action) => ({
      ...state,
      SYSTEM_INFORMATION: {
        ...state.SYSTEM_INFORMATION,
        isFetching: false,
        error: action.payload
      }
    })
  }
);
export default reducer;
