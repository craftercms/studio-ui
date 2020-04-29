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
import { ItemsStateProps, SandboxItem } from '../../models/Item';
import { createLookupTable } from '../../utils/object';
import { LookupTable } from '../../models/LookupTable';
import { itemsFromPath } from '../../utils/path';

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
        ...state.consumers[payload.id],
        path: payload.path,
        isFetching: true
      }
    }
  }),
  [fetchChildrenByPathComplete.type]: (state, { payload }) => {
    const consumer = state.consumers[payload.id];
    const byId: LookupTable<SandboxItem> =  { ...consumer.byId, ...createLookupTable(payload.childrenResponse)};

    const nextItems = {
      ...byId,
      [payload.childrenResponse.parent.id]: payload.childrenResponse.parent,
    };

    return {
      ...state,
      consumers: {
        ...state.consumers,
        [payload.id]: {
          ...consumer,
          byId: nextItems,
          items: payload.childrenResponse.map((item) => item.id),
          isFetching: false,
          breadcrumb: itemsFromPath(consumer.path, consumer.rootPath, nextItems)
        }
      }
    };
  }
});

export default reducer;
