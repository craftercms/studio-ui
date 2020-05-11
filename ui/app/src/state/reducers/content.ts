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

import { combineReducers, createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../models/GlobalState';
import {
  fetchQuickCreateList,
  fetchQuickCreateListComplete,
  fetchQuickCreateListFailed
} from '../actions/content';
import QuickCreateItem from '../../models/content/QuickCreateItem';
import StandardAction from '../../models/StandardAction';
import { AjaxError } from 'rxjs/ajax';

type ContentState = GlobalState['content'];
type QuickCreateState = GlobalState['content']['quickCreate'];

const initialState: ContentState = {
  quickCreate: {
    error: null,
    isFetching: false,
    items: null
  }
};

const quickCreate = createReducer<QuickCreateState>(initialState.quickCreate, {
  [fetchQuickCreateList.type]: (state) => ({ ...state, isFetching: true }),
  [fetchQuickCreateListComplete.type]: (state, { payload }: StandardAction<QuickCreateItem[]>) => ({
    ...state,
    items: payload,
    isFetching: false
  }),
  [fetchQuickCreateListFailed.type]: (state, error: StandardAction<AjaxError>) => ({
    ...state,
    isFetching: false,
    error: error.payload.response
  })
});

export default combineReducers({
  quickCreate
});
