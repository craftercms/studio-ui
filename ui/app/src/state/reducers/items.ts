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

interface consumer {
  id: string;
  path: string;
}

export const addItemConsumer = createAction<consumer>('ADD_ITEM_CONSUMER');

export const removeItemConsumer = createAction<string>('REMOVE_ITEM_CONSUMER');

export const fetchChildrenByPath = createAction<consumer>('FETCH_CHILDREN_BY_PATH');
export const fetchChildrenByPathComplete = createAction<{
  id: string;
  childrenResponse: GetChildrenResponse;
}>('FETCH_CHILDREN_BY_PATH_COMPLETE');
export const fetchChildrenByPathFailed = createAction<any>('FETCH_CHILDREN_BY_PATH_FAILED');

const initialState: ItemsStateProps = {
  consumers: null
};

const reducer = createReducer<GlobalState['items']>(initialState, {
  [addItemConsumer.type]: (state, { payload }) => ({
    ...state,
    consumers: {
      ...state.consumers,
      [payload.id]: {
        rootPath: payload.path
      }
    }
  }),
  [fetchChildrenByPath.type]: (state, { payload }) => ({
    ...state,
    consumers: {
      ...state.consumers,
      [payload.id]: {
        path: payload.path,
        isFetching: true
      }
    }
  }),
  [fetchChildrenByPathComplete.type]: (state, { payload }) => ({
    ...state,
    consumers: {
      ...state.consumers,
      [payload.id]: {
        byId: { ...state.consumers[payload.id].byId, ...createLookupTable(payload) },
        items: payload.map((item) => item.id),
        isFetching: false
      }
    }
  })
});

export default reducer;
