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

import GlobalState from '../../models/GlobalState';
import { createAction, createReducer } from '@reduxjs/toolkit';
import { GetChildrenResponse } from '../../models/GetChildrenResponse';
import { ItemsStateProps } from '../../models/Item';
import { createLookupTable } from '../../utils/object';

export const fetchPath = createAction<string>('FETCH_PATH');
export const fetchPathComplete = createAction<GetChildrenResponse>('FETCH_PATH_COMPLETE');
export const fetchPathFailed = createAction<any>('FETCH_PATH_COMPLETE_FAILED');

const initialState: ItemsStateProps = {
  byId: null,
  isFetching: null,
  error: null,
  items: null,
  path: 'site/website'
};

const reducer = createReducer<GlobalState['items']>(
  initialState,
  {
    [fetchPath.type]: (state, { payload }) => ({
      ...state,
      ...payload,
      isFetching: true
    }),
    [fetchPathComplete.type]: (state, { payload }) => ({
      ...state,
      byId: {...state.byId, ...createLookupTable(payload)},
      items: payload.map(item => item.id),
      isFetching: false
    })
  }
);

export default reducer;
