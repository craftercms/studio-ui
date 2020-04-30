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
import { createLookupTable, nou } from '../../utils/object';
import { LookupTable } from '../../models/LookupTable';
import { itemsFromPath, withIndex, withoutIndex } from '../../utils/path';

interface ConsumerPayload {
  id: string;
  path: string;
  rootPath?: string;
  preFetch?: boolean;
}

export const addItemConsumer = createAction<ConsumerPayload>('ADD_ITEM_CONSUMER');

export const removeItemConsumer = createAction<string>('REMOVE_ITEM_CONSUMER');

export const fetchChildrenByPath = createAction<ConsumerPayload>('FETCH_CHILDREN_BY_PATH');

export const fetchChildrenByPathComplete = createAction<{
  id: string;
  childrenResponse: GetChildrenResponse;
}>('FETCH_CHILDREN_BY_PATH_COMPLETE');
export const fetchChildrenByPathFailed = createAction<any>('FETCH_CHILDREN_BY_PATH_FAILED');

const initialState: ItemsStateProps = {
  consumers: {}
};

const reducer = createReducer<GlobalState['items']>(initialState, {
  [addItemConsumer.type]: (state, { payload }) => ({
    ...state,
    consumers: {
      ...state.consumers,
      [payload.id]: {
        rootPath: payload.rootPath,
        path: payload.path,
        selectedItem: payload.path,
        leafs: [],
        items: []
      }
    }
  }),
  [removeItemConsumer.type]: (state, { payload }) => ({
    ...state,
    consumers: {
      ...state.consumers,
      [payload.id]: null
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
    const { path, rootPath, leafs, byId } = consumer;

    // Check and handle if the item has no children
    if (
      payload.childrenResponse.length === 0 &&
      // If it is the root path, we want to show the empty state,
      // vs child paths, want to show the previous path and inform
      // that there aren't any items at that path
      withoutIndex(path) !== withoutIndex(rootPath)
    ) {
      let pieces = path.split('/').slice(0);
      pieces.pop();
      if (path.includes('index.xml')) {
        pieces.pop();
      }
      let nextPath = pieces.join('/');
      if (nou(byId[nextPath])) {
        nextPath = withIndex(nextPath);
      }
      return {
        ...state,
        consumers: {
          ...state.consumers,
          [payload.id]: {
            ...consumer,
            // Revert path to previous (parent) path
            path: nextPath,
            leafs: leafs.concat(path),
            isFetching: false
          }
        }
      };
    } else {
      const byId: LookupTable<SandboxItem> = { ...consumer.byId, ...createLookupTable(payload.childrenResponse) };

      const nextItems = {
        ...byId,
        [payload.childrenResponse.parent.id]: payload.childrenResponse.parent
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
            breadcrumb: itemsFromPath(path, rootPath, nextItems)
          }
        }
      };
    }
  }
});

export default reducer;
