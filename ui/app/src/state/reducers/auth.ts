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
import { SESSION_TIMEOUT } from '../actions/user';
import {
  LOG_IN,
  LOG_IN_COMPLETE,
  LOG_IN_FAILED,
  LOG_OUT_COMPLETE,
  refreshAuthTokenComplete,
  VALIDATE_SESSION,
  VALIDATE_SESSION_COMPLETE,
  VALIDATE_SESSION_FAILED
} from '../actions/auth';

export const initialState: GlobalState['auth'] = {
  error: null,
  active: false,
  expiresAt: null,
  isFetching: false
};

// TODO: Update actions for JWT
const reducer = createReducer<GlobalState['auth']>(initialState, {
  [refreshAuthTokenComplete.type]: (state, { payload }) => ({
    ...state,
    expiresAt: new Date(payload.expiresAt).getTime()
  }),
  [VALIDATE_SESSION]: (state) => ({ ...state, isFetching: true }),
  [VALIDATE_SESSION_COMPLETE]: (state, { payload: active }) => ({ ...state, isFetching: false, active }),
  [VALIDATE_SESSION_FAILED]: (state) => ({ ...state, isFetching: false }),
  [SESSION_TIMEOUT]: () => initialState,
  [LOG_IN]: (state) => ({ ...state, isFetching: true }),
  [LOG_IN_COMPLETE]: () => ({ active: true, error: null, isFetching: true, expiresAt: null }),
  [LOG_IN_FAILED]: (state, action) => ({
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
  [LOG_OUT_COMPLETE]: () => initialState
});

export default reducer;
