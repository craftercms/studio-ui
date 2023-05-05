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

import GlobalState from '../../models/GlobalState';
import { createReducer } from '@reduxjs/toolkit';
import { changeSite } from '../actions/sites';
import {
  blockGlobalMenuNavigation,
  fetchGlobalMenu,
  fetchGlobalMenuComplete,
  fetchGlobalMenuFailed,
  unblockGlobalMenuNavigation
} from '../actions/system';

const initialState: GlobalState['globalNavigation'] = {
  error: null,
  items: null,
  isFetching: false,
  blockNavigation: false
};

// @ts-ignore - TODO: Typing system is complaining about something to be determined.
const reducer = createReducer<GlobalState['globalNavigation']>(initialState, {
  [changeSite.type]: (state) => ({ ...initialState, ...state }),
  [fetchGlobalMenu.type]: (state) => ({ ...state, isFetching: true }),
  [fetchGlobalMenuComplete.type]: (state, { payload }) => ({
    ...state,
    error: null,
    items: payload,
    isFetching: false
  }),
  [fetchGlobalMenuFailed.type]: (state, { payload }) => ({
    ...state,
    error: payload,
    items: state.items,
    isFetching: false
  }),
  [blockGlobalMenuNavigation.type]: (state) => ({
    ...state,
    blockNavigation: true
  }),
  [unblockGlobalMenuNavigation.type]: (state) => ({
    ...state,
    blockNavigation: false
  })
});

export default reducer;
