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
  fetchSandboxItems,
  fetchSandboxItemsComplete,
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
import { SandboxItem } from '../../models/Item';
import { changeSite } from '../actions/sites';
import {
  pathNavigatorTreeFetchPathChildrenComplete,
  pathNavigatorTreeFetchPathPageComplete,
  pathNavigatorTreeRestoreComplete,
  PathNavigatorTreeRestoreCompletePayload
} from '../actions/pathNavigatorTree';
import { STATE_LOCKED_MASK } from '../../utils/constants';
import { deleteContentEvent, lockContentEvent, moveContentEvent, MoveContentEventPayload } from '../actions/system';
import SocketEventBase from '../../models/SocketEvent';

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

const updateItemByPath = (state: ContentState, { payload }) => {
  const { parent, children } = payload;
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
  state.itemsBeingFetchedByPath[path] = true;
};

const updateItemsBeingFetchedByPaths = (state, { payload: { paths } }) => {
  paths.forEach((path) => {
    state.itemsBeingFetchedByPath[path] = true;
  });
};

const reducer = createReducer<ContentState>(initialState, (builder) => {
  builder
    .addCase(fetchQuickCreateList, (state) => ({
      ...state,
      quickCreate: {
        ...state.quickCreate,
        isFetching: true
      }
    }))
    .addCase(fetchQuickCreateListComplete, (state, { payload }: StandardAction<QuickCreateItem[]>) => ({
      ...state,
      quickCreate: {
        ...state.quickCreate,
        isFetching: true
      }
    }))
    .addCase(fetchQuickCreateListFailed, (state, error: StandardAction<AjaxError>) => ({
      ...state,
      quickCreate: {
        ...state.quickCreate,
        isFetching: false,
        error: error.payload.response
      }
    }))
    .addCase(fetchDetailedItem, updateItemsBeingFetchedByPath)
    .addCase(reloadDetailedItem, updateItemsBeingFetchedByPath)
    .addCase(completeDetailedItem, updateItemsBeingFetchedByPath)
    .addCase(fetchSandboxItem, updateItemsBeingFetchedByPath)
    .addCase(fetchSandboxItems, updateItemsBeingFetchedByPaths)
    .addCase(fetchSandboxItemsComplete, (state, { payload: { items } }) => {
      items.forEach((item) => {
        const path = item.path;
        state.itemsByPath[path] = parseSandBoxItemToDetailedItem(item, state.itemsByPath[item.path]);
        delete state.itemsBeingFetchedByPath[path];
      });
    })
    .addCase(fetchDetailedItemComplete, (state, { payload }) => ({
      ...state,
      itemsByPath: {
        ...state.itemsByPath,
        [payload.path]: payload
      },
      itemsBeingFetchedByPath: {
        ...reversePluckProps(state.itemsBeingFetchedByPath, payload.path)
      }
    }))
    .addCase(fetchDetailedItems, updateItemsBeingFetchedByPaths)
    .addCase(fetchDetailedItemsComplete, (state, { payload: { items } }) => {
      items.forEach((item) => {
        const path = item.path;
        state.itemsByPath[path] = item;
        delete state.itemsBeingFetchedByPath[path];
      });
    })
    .addCase(fetchSandboxItemComplete, (state, { payload: { item } }) => {
      const path = item.path;
      state.itemsByPath[path] = parseSandBoxItemToDetailedItem(item, state.itemsByPath[item.path]);
      state.itemsBeingFetchedByPath[path] = false;
    })
    .addCase(restoreClipboard, (state, { payload }) => ({
      ...state,
      clipboard: payload
    }))
    .addCase(setClipboard, (state, { payload }) => ({
      ...state,
      clipboard: payload
    }))
    .addCase(clearClipboard, (state) => ({
      ...state,
      clipboard: null
    }))
    .addCase(pathNavigatorConditionallySetPathComplete, updateItemByPath)
    .addCase(pathNavigatorFetchPathComplete, updateItemByPath)
    .addCase(pathNavigatorFetchParentItemsComplete, (state, { payload: { items, children } }) => {
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
    })
    .addCase(pathNavigatorTreeFetchPathChildrenComplete, updateItemByPath)
    .addCase(pathNavigatorTreeFetchPathPageComplete, updateItemByPath)
    .addCase(
      pathNavigatorTreeRestoreComplete,
      (state, action: { payload: PathNavigatorTreeRestoreCompletePayload }) => {
        const {
          payload: { children, items }
        } = action;
        let nextByPath = {};
        Object.values(children).forEach((children) => {
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
      }
    )
    .addCase(updateItemsByPath, (state, { payload }) => {
      return updateItemByPath(state, { payload: { parent: null, children: payload.items } });
    })
    .addCase(changeSite, () => initialState)
    .addCase(lockContentEvent, (state, { payload }) =>
      updateItemLockState(state, {
        path: payload.targetPath,
        username: payload.user.username,
        locked: payload.locked
      })
    )
    .addCase(deleteContentEvent, (state, { payload: { targetPath } }: StandardAction<SocketEventBase>) => {
      delete state.itemsByPath[targetPath];
      delete state.itemsBeingFetchedByPath[targetPath];
    })
    .addCase(moveContentEvent, (state, { payload: { sourcePath } }: StandardAction<MoveContentEventPayload>) => {
      delete state.itemsByPath[sourcePath];
      delete state.itemsBeingFetchedByPath[sourcePath];
    });
});

export default reducer;
