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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../models/GlobalState';
import {
  clearClipboard,
  completeDetailedItem,
  fetchDetailedItem,
  fetchDetailedItemComplete,
  fetchDetailedItems,
  fetchDetailedItemsComplete,
  fetchQuickCreateList,
  fetchQuickCreateListComplete,
  fetchQuickCreateListFailed,
  fetchSandboxItem,
  fetchSandboxItemComplete,
  reloadDetailedItem,
  restoreClipboard,
  setClipboard,
  updateItemsByPath
} from '../actions/content';
import QuickCreateItem from '../../models/content/QuickCreateItem';
import StandardAction from '../../models/StandardAction';
import { AjaxError } from 'rxjs/ajax';
import {
  pathNavigatorConditionallySetPathComplete,
  pathNavigatorFetchParentItemsComplete,
  pathNavigatorFetchPathComplete
} from '../actions/pathNavigator';
import { parseSandBoxItemToDetailedItem } from '../../utils/content';
import { createLookupTable, reversePluckProps } from '../../utils/object';
import { DetailedItem, SandboxItem } from '../../models/Item';
import { changeSite } from './sites';
import {
  pathNavigatorTreeFetchPathChildrenComplete,
  pathNavigatorTreeFetchPathPageComplete,
  pathNavigatorTreeFetchPathsChildrenComplete,
  pathNavigatorTreeRestoreComplete
} from '../actions/pathNavigatorTree';
import { GetChildrenResponse } from '../../models/GetChildrenResponse';
import LookupTable from '../../models/LookupTable';
import { STATE_LOCKED_MASK } from '../../utils/constants';
import { lockContentEvent } from '../actions/system';

type ContentState = GlobalState['content'];

const initialState: ContentState = {
  quickCreate: {
    error: null,
    isFetching: false,
    items: null
  },
  itemsByPath: {},
  clipboard: null,
  itemsBeingFetchedByPath: {}
};

const updateItemLockState = (state: ContentState, { path, username, locked }) => {
  if (
    !state.itemsByPath[path] ||
    (locked && state.itemsByPath[path].stateMap.locked) ||
    (!locked && !state.itemsByPath[path].stateMap.locked)
  ) {
    return state;
  }
  return {
    ...state,
    itemsByPath: {
      ...state.itemsByPath,
      [path]: {
        ...state.itemsByPath[path],
        lockOwner: locked ? username : null,
        state: locked
          ? state.itemsByPath[path].state + STATE_LOCKED_MASK
          : state.itemsByPath[path].state - STATE_LOCKED_MASK,
        stateMap: { ...state.itemsByPath[path].stateMap, locked }
      }
    }
  };
};

const updateItemByPath = (state: ContentState, { payload: { parent, children } }) => {
  const nextByPath = {
    ...state.itemsByPath,
    ...createLookupTable(parseSandBoxItemToDetailedItem(children as SandboxItem[], state.itemsByPath), 'path')
  };
  if (children.levelDescriptor) {
    nextByPath[children.levelDescriptor.path] = parseSandBoxItemToDetailedItem(
      children.levelDescriptor,
      state.itemsByPath[children.levelDescriptor.path]
    );
  }
  if (parent) {
    nextByPath[parent.path] = parent;
  }
  return {
    ...state,
    itemsByPath: nextByPath
  };
};

const updateItemsBeingFetchedByPath = (state: ContentState, { payload: { path } }) => {
  return {
    ...state,
    itemsBeingFetchedByPath: {
      ...state.itemsBeingFetchedByPath,
      [path]: true
    }
  };
};

const reducer = createReducer<ContentState>(initialState, {
  [fetchQuickCreateList.type]: (state) => ({
    ...state,
    quickCreate: {
      ...state.quickCreate,
      isFetching: true
    }
  }),
  [fetchQuickCreateListComplete.type]: (state, { payload }: StandardAction<QuickCreateItem[]>) => ({
    ...state,
    quickCreate: {
      ...state.quickCreate,
      items: payload,
      isFetching: false
    }
  }),
  [fetchQuickCreateListFailed.type]: (state, error: StandardAction<AjaxError>) => ({
    ...state,
    quickCreate: {
      ...state.quickCreate,
      isFetching: false,
      error: error.payload.response
    }
  }),
  [fetchDetailedItem.type]: updateItemsBeingFetchedByPath,
  [reloadDetailedItem.type]: updateItemsBeingFetchedByPath,
  [completeDetailedItem.type]: updateItemsBeingFetchedByPath,
  [fetchSandboxItem.type]: updateItemsBeingFetchedByPath,
  [fetchDetailedItemComplete.type]: (state, { payload }) => ({
    ...state,
    itemsByPath: {
      ...state.itemsByPath,
      [payload.path]: payload
    },
    itemsBeingFetchedByPath: {
      ...reversePluckProps(state.itemsBeingFetchedByPath, payload.path)
    }
  }),
  [fetchDetailedItems.type]: (state, { payload }) => {
    const itemsFetchedByPath = {};
    payload.paths.forEach((path) => {
      itemsFetchedByPath[path] = true;
    });
    return {
      ...state,
      itemsBeingFetchedByPath: {
        ...state.itemsBeingFetchedByPath,
        ...itemsFetchedByPath
      }
    };
  },
  [fetchDetailedItemsComplete.type]: (state, { payload: items }) => {
    const nextByPath = {};
    items.forEach((item) => {
      nextByPath[item.path] = item;
    });

    return {
      ...state,
      itemsByPath: {
        ...state.itemsByPath,
        ...nextByPath
      },
      itemsBeingFetchedByPath: {
        ...reversePluckProps(state.itemsBeingFetchedByPath, ...items.map((item) => item.path))
      }
    };
  },
  [fetchSandboxItemComplete.type]: (state, { payload: { item } }) => ({
    ...state,
    itemsByPath: {
      ...state.itemsByPath,
      [item.path]: parseSandBoxItemToDetailedItem(item, state.itemsByPath[item.path])
    },
    itemsBeingFetchedByPath: {
      ...reversePluckProps(state.itemsBeingFetchedByPath, item.path)
    }
  }),
  [restoreClipboard.type]: (state, { payload }) => ({
    ...state,
    clipboard: payload
  }),
  [setClipboard.type]: (state, { payload }) => ({
    ...state,
    clipboard: payload
  }),
  [clearClipboard.type]: (state) => ({
    ...state,
    clipboard: null
  }),
  [pathNavigatorConditionallySetPathComplete.type]: updateItemByPath,
  [pathNavigatorFetchPathComplete.type]: updateItemByPath,
  [pathNavigatorFetchParentItemsComplete.type]: (
    state,
    { payload: { items, children } }: { payload: { items: DetailedItem[]; children: GetChildrenResponse } }
  ) => {
    return {
      ...state,
      itemsByPath: {
        ...state.itemsByPath,
        ...createLookupTable(parseSandBoxItemToDetailedItem(children, state.itemsByPath), 'path'),
        ...(children.levelDescriptor && {
          [children.levelDescriptor.path]: parseSandBoxItemToDetailedItem(
            children.levelDescriptor,
            state.itemsByPath[children.levelDescriptor.path]
          )
        }),
        ...createLookupTable(
          items.reduce((items, item) => {
            if (state.itemsByPath[item.path]?.live) {
              item.live = state.itemsByPath[item.path].live;
              item.staging = state.itemsByPath[item.path].staging;
            }
            return items;
          }, items),
          'path'
        )
      }
    };
  },
  [pathNavigatorTreeFetchPathChildrenComplete.type]: updateItemByPath,
  [pathNavigatorTreeFetchPathPageComplete.type]: updateItemByPath,
  [pathNavigatorTreeRestoreComplete.type]: (
    state,
    { payload: { data, items } }: { payload: { data: LookupTable<GetChildrenResponse>; items: DetailedItem[] } }
  ) => {
    let nextByPath = {};
    Object.values(data).forEach((children) => {
      Object.assign(
        nextByPath,
        createLookupTable(parseSandBoxItemToDetailedItem(children as SandboxItem[], state.itemsByPath), 'path')
      );
      if (children.levelDescriptor) {
        nextByPath[children.levelDescriptor.path] = parseSandBoxItemToDetailedItem(
          children.levelDescriptor,
          state.itemsByPath[children.levelDescriptor.path]
        );
      }
    });
    items.forEach((item) => {
      nextByPath[item.path] = item;
    });
    return { ...state, itemsByPath: { ...state.itemsByPath, ...nextByPath } };
  },
  [pathNavigatorTreeFetchPathsChildrenComplete.type]: (
    state,
    { payload: { data } }: { payload: { data: LookupTable<GetChildrenResponse> } }
  ) => {
    let nextByPath = {};
    Object.values(data).forEach((children) => {
      Object.assign(
        nextByPath,
        createLookupTable(parseSandBoxItemToDetailedItem(children as SandboxItem[], state.itemsByPath), 'path')
      );
      if (children.levelDescriptor) {
        nextByPath[children.levelDescriptor.path] = parseSandBoxItemToDetailedItem(
          children.levelDescriptor,
          state.itemsByPath[children.levelDescriptor.path]
        );
      }
    });
    return { ...state, itemsByPath: { ...state.itemsByPath, ...nextByPath } };
  },
  [updateItemsByPath.type]: (state, { payload }) => {
    return updateItemByPath(state, { payload: { parent: null, children: payload.items } });
  },
  [changeSite.type]: () => initialState,
  [lockContentEvent.type]: (state, { payload }) =>
    updateItemLockState(state, {
      path: payload.targetPath,
      username: payload.user.username,
      locked: payload.locked
    })
});

export default reducer;
