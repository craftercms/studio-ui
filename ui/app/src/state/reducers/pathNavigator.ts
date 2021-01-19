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
import { PathNavigatorStateProps } from '../../components/Navigation/PathNavigator/PathNavigator';
import LookupTable from '../../models/LookupTable';
import { getIndividualPaths, withoutIndex } from '../../utils/path';
import {
  pathNavigatorClearChecked,
  pathNavigatorConditionallySetPathComplete,
  pathNavigatorFetchParentItems,
  pathNavigatorFetchParentItemsComplete,
  pathNavigatorFetchPathComplete,
  pathNavigatorInit,
  pathNavigatorItemChecked,
  pathNavigatorItemUnchecked,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath,
  pathNavigatorSetKeyword,
  pathNavigatorSetLocaleCode,
  pathNavigatorUpdate
} from '../actions/pathNavigator';
import { changeSite } from './sites';

const reducer = createReducer<LookupTable<PathNavigatorStateProps>>(
  {},
  {
    [pathNavigatorInit.type]: (state, { payload: { id, path, locale = 'en', collapsed = false } }) => {
      return {
        ...state,
        [id]: {
          rootPath: path,
          currentPath: path,
          localeCode: locale,
          keyword: '',
          isSelectMode: false,
          hasClipboard: false,
          levelDescriptor: null,
          itemsInPath: null,
          breadcrumb: [],
          selectedItems: [],
          leaves: [],
          limit: 10,
          offset: 0,
          count: 0,
          collapsed
        }
      };
    },
    [pathNavigatorSetLocaleCode.type]: (state, { payload: { id, locale } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          localeCode: locale
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
    [pathNavigatorConditionallySetPathComplete.type]: (state, { payload: { id, path, response } }) => {
      if (response.length > 0) {
        return {
          ...state,
          [id]: {
            ...state[id],
            currentPath: path,
            breadcrumb: getIndividualPaths(withoutIndex(path), state[id].rootPath),
            itemsInPath: response.map((item) => item.id),
            levelDescriptor: response.levelDescriptor?.path,
            count: response.length
          }
        };
      } else {
        return {
          ...state,
          [id]: {
            ...state[id],
            leaves: state[id].leaves.concat(path)
          }
        };
      }
    },
    [pathNavigatorFetchPathComplete.type]: (state, { payload: { id, response } }) => {
      const path = state[id].currentPath;
      return {
        ...state,
        [id]: {
          ...state[id],
          breadcrumb: getIndividualPaths(withoutIndex(path), state[id].rootPath),
          itemsInPath: response.length === 0 ? [] : response.map((item) => item.id),
          levelDescriptor: response.levelDescriptor?.path,
          count: response.length,
          leaves: response.length === 0 ? state[id].leaves.concat(path) : state[id].leaves
        }
      };
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
      let itemsInPath = [];
      let levelDescriptor = null;

      response.forEach((resp: GetChildrenResponse, i: number) => {
        if (i === response.length - 1) {
          itemsInPath = resp.map((item) => item.id);
          if (resp.levelDescriptor) {
            levelDescriptor = resp.levelDescriptor.path;
          }
        }
      });

      return {
        ...state,
        [id]: {
          ...state[id],
          itemsInPath,
          levelDescriptor,
          breadcrumb: getIndividualPaths(withoutIndex(currentPath), rootPath)
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
    [pathNavigatorUpdate.type]: (state, { payload }) => ({
      ...state,
      [payload.id]: { ...state[payload.id], ...payload }
    }),
    [changeSite.type]: () => ({})
  }
);

export default reducer;
