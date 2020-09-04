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
import { GetChildrenResponse } from '../../models/GetChildrenResponse';
import { WidgetState } from '../../components/Navigation/PathNavigator/Widget';
import LookupTable from '../../models/LookupTable';
import { itemsFromPath, withIndex, withoutIndex } from '../../utils/path';
import { createLookupTable, nou } from '../../utils/object';
import {
  pathNavigatorClearChecked,
  pathNavigatorFetchParentItems,
  pathNavigatorFetchParentItemsComplete,
  pathNavigatorFetchPathComplete,
  pathNavigatorInit,
  pathNavigatorItemChecked,
  pathNavigatorItemUnchecked,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath,
  pathNavigatorSetKeyword,
  pathNavigatorSetLocaleCode
} from '../actions/pathNavigator';

const reducer = createReducer<LookupTable<WidgetState>>(
  {},
  {
    [pathNavigatorInit.type]: (state, { payload: { id, path, locale, collapsed = false } }) => {
      return {
        ...state,
        [id]: {
          rootPath: path,
          currentPath: path,
          localeCode: locale,
          keyword: '',
          isSelectMode: false,
          hasClipboard: false,
          itemsInPath: null,
          items: {},
          breadcrumb: [],
          selectedItems: [],
          leafs: [],
          limit: 10,
          offset: 0,
          count: 0,
          collapsed
        }
      };
    },
    [pathNavigatorSetCurrentPath.type]: (state, { payload: { id, path } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          keyword: '',
          currentPath: path
        }
      };
    },
    [pathNavigatorFetchPathComplete.type]: (state, { payload: { id, response } }) => {
      const path = state[id].currentPath;
      // Check and handle if the item has no children
      if (
        response.length === 0 &&
        // If it is the root path, we want to show the empty state,
        // vs child paths, want to show the previous path and inform
        // that there aren't any items at that path
        withoutIndex(path) !== withoutIndex(state[id].rootPath)
      ) {
        let pieces = path.split('/').slice(0);
        pieces.pop();
        if (path.includes('index.xml')) {
          pieces.pop();
        }
        let nextPath = pieces.join('/');
        if (nou(state[id].items[nextPath])) {
          nextPath = withIndex(nextPath);
        }
        return {
          ...state,
          [id]: {
            ...state[id],
            // Revert path to previous (parent) path
            currentPath: nextPath,
            leafs: state[id].leafs.concat(path)
          }
        };
      } else {
        const nextItems = {
          ...state[id].items,
          [response.parent.id]: response.parent,
          ...createLookupTable(response)
        };
        const widgetState = {
          ...state[id],
          breadcrumb: itemsFromPath(path, state[id].rootPath, nextItems),
          itemsInPath: response.map((item) => item.id),
          items: nextItems,
          count: response.length
        };
        return {
          ...state,
          [id]: widgetState
        };
      }
    },
    [pathNavigatorFetchParentItems.type]: (state, { payload: { id, path } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          keyword: '',
          currentPath: path
        }
      };
    },
    [pathNavigatorFetchParentItemsComplete.type]: (state, { payload: { id, response } }) => {
      const { currentPath, rootPath } = state[id];
      let nextItems = {};
      let items = [];

      response.forEach((resp: GetChildrenResponse, i: number) => {
        if (i === response.length - 1) {
          items = resp.map((item) => item.id);
        }
        nextItems = {
          ...nextItems, ...createLookupTable(resp),
          [resp.parent.id]: resp.parent
        };
      });

      return {
        ...state,
        [id]: {
          ...state[id],
          items: nextItems,
          itemsInPath: items,
          breadcrumb: [...itemsFromPath(currentPath, rootPath, nextItems)]
        }
      };
    },
    [pathNavigatorSetCollapsed.type]: (state, { payload: { id, collapsed } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          collapsed
        }
      };
    },
    [pathNavigatorSetKeyword.type]: (state, { payload: { id, keyword } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          keyword
        }
      };
    },
    [pathNavigatorItemChecked.type]: (state, { payload: { id, item } }) => {
      let selectedItems = [...state[id].selectedItems];
      selectedItems.push(item.path);
      return {
        ...state,
        [id]: {
          ...state[id],
          selectedItems
        }
      };
    },
    [pathNavigatorItemUnchecked.type]: (state, { payload: { id, item } }) => {
      let checked = [...state[id].selectedItems];
      checked.splice(checked.indexOf(item.path), 1);
      return {
        ...state,
        [id]: {
          ...state[id],
          selectedItems: checked
        }
      };
    },
    [pathNavigatorClearChecked.type]: (state, { payload: { id } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          selectedItems: []
        }
      };
    },
    [pathNavigatorSetLocaleCode.type]: (state) => state
  }
);

export default reducer;
