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

import { createAction, createReducer } from '@reduxjs/toolkit';
import { SandboxItem } from '../../models/Item';
import { GetChildrenResponse } from '../../models/GetChildrenResponse';
import { WidgetState } from '../../components/Navigation/PathNavigator/Widget';
import LookupTable from '../../models/LookupTable';
import { itemsFromPath, withIndex, withoutIndex } from '../../utils/path';
import { createLookupTable, nou } from '../../utils/object';

type PayloadWithId<P> = P & { id: string };

export const pathNavigatorInit = createAction<PayloadWithId<{ path: string; locale: string }>>('PATH_NAVIGATOR_INIT');

export const pathNavigatorUpdate = createAction<PayloadWithId<{ state: WidgetState }>>('PATH_NAVIGATOR_UPDATE');

export const pathNavigatorSetLocaleCode = createAction<PayloadWithId<{ locale: string }>>('PATH_NAVIGATOR_INIT_SET_LOCALE_CODE');

export const pathNavigatorSetCurrentPath = createAction<PayloadWithId<{ path: string }>>('PATH_NAVIGATOR_INIT_SET_CURRENT_PATH');

export const pathNavigatorItemChecked = createAction<PayloadWithId<{ item: SandboxItem }>>('PATH_NAVIGATOR_INIT_ITEM_CHECKED');

export const pathNavigatorItemUnchecked = createAction<PayloadWithId<{ item: SandboxItem }>>('PATH_NAVIGATOR_INIT_ITEM_UNCHECKED');

export const pathNavigatorClearChecked = createAction<{ id: string }>('PATH_NAVIGATOR_INIT_CLEAR_CHECKED');

export const pathNavigatorFetchPath = createAction<PayloadWithId<{ path: string }>>('PATH_NAVIGATOR_INIT_FETCH_PATH');

export const pathNavigatorFetchPathComplete = createAction<PayloadWithId<{ response: GetChildrenResponse }>>('PATH_NAVIGATOR_INIT_FETCH_PATH_COMPLETE');

export const pathNavigatorFetchPathFailed = createAction('PATH_NAVIGATOR_INIT_FETCH_PATH_FAILED');

export const pathNavigatorSetKeyword = createAction<PayloadWithId<{ keyword: string }>>('PATH_NAVIGATOR_INIT_SET_KEYWORD');

const reducer = createReducer<LookupTable<WidgetState>>(
  {},
  {
    [pathNavigatorInit.type]: (state, { payload: { id, path, locale } }) => {
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
          count: 0
        }
      };
    },
    [pathNavigatorUpdate.type]: (state, { payload: { id, state: updatedState } }) => {
      return {
        ...state,
        [id]: updatedState
      };
    },
    [pathNavigatorFetchPath.type]: (state) => state,
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
        localStorage.setItem(`craftercms.pathNavigator.${id}`, JSON.stringify(widgetState));
        return {
          ...state,
          [id]: widgetState
        };
      }
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
    [pathNavigatorClearChecked.type]: (state, { payload: { id, item } }) => {
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
