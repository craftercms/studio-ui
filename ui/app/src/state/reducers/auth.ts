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
import { sessionTimeout } from '../actions/user';
import {
  authTokenRefreshedFromAnotherTab,
  login,
  loginFailed,
  logoutComplete,
  refreshAuthToken,
  refreshAuthTokenComplete,
  refreshAuthTokenFailed
} from '../actions/auth';
import { storeInitialized } from '../actions/system';

export const initialState: GlobalState['auth'] = {
  error: null,
  active: false,
  expiresAt: null,
  isFetching: false
};

const refreshAuthTokenReducer = (state, { payload }) => ({
  ...state,
  active: true,
  isFetching: false,
  expiresAt: fromExpiresAtString(payload.expiresAt)
});

const reducer = createReducer<GlobalState['auth']>(initialState, {
  [storeInitialized.type]: (state, { payload }) => ({
    ...state,
    expiresAt: fromExpiresAtString(payload.auth.expiresAt)
  }),
  [refreshAuthToken.type]: (state) => ({
    ...state,
    isFetching: true
  }),
  [refreshAuthTokenComplete.type]: refreshAuthTokenReducer,
  [authTokenRefreshedFromAnotherTab.type]: refreshAuthTokenReducer,
  [refreshAuthTokenFailed.type]: (state) => ({
    ...state,
    active: false,
    isFetching: false
  }),
  [sessionTimeout.type]: () => initialState,
  [login.type]: (state) => ({ ...state, isFetching: true }),
  [loginFailed.type]: (state, action) => ({
    ...state,
    isFetching: false,
    error:
      action.payload.status === 401
        ? {
            code: 6004,
            message: 'Incorrect password',
            remedialAction: 'Please use correct password'
          }
        : {
            code: 1000,
            message: 'Internal System Failure',
            remedialAction: 'Please try again momentarily or contact support'
          }
  }),
  [logoutComplete.type]: () => initialState
});

function fromExpiresAtString(expiresAt: string) {
  return new Date(expiresAt).getTime();
}

export default reducer;
