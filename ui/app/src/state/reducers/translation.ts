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
  FETCH_SUPPORTED_LOCALES,
  FETCH_SUPPORTED_LOCALES_COMPLETE,
  FETCH_SUPPORTED_LOCALES_FAILED
} from '../actions/translation';

export const initialState = {
  supportedLocales: {
    error: null,
    isFetching: false,
    localeCodes: [],
    defaultLocaleCode: null
  }
};

const reducer = createReducer<GlobalState['translation']>(
  initialState,
  {
    [FETCH_SUPPORTED_LOCALES]: (state) => ({
      ...state,
      supportedLocales: {
        ...state.supportedLocales,
        isFetching: true
      }
    }),
    [FETCH_SUPPORTED_LOCALES_COMPLETE]: (state, { payload }) => {
      console.log('fetch supported locales complete', payload);
      return ({
        ...state,
        supportedLocales: {
          ...state.supportedLocales,
          isFetching: false,
          localeCodes: payload.localeCodes,
          defaultLocaleCode: payload.defaultLocaleCode
        }
      });
    },
    [FETCH_SUPPORTED_LOCALES_FAILED]: (state) => ({
      ...state,
      supportedLocales: {
        ...state.supportedLocales,
        isFetching: false
      }
    })
  }
);

export default reducer;
