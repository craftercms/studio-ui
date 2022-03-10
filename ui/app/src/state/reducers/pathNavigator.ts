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
import { PathNavigatorStateProps } from '../../components/PathNavigator';
import LookupTable from '../../models/LookupTable';
import { getIndividualPaths, withoutIndex } from '../../utils/path';
import {
  pathNavigatorChangeLimit,
  pathNavigatorChangePage,
  pathNavigatorClearChecked,
  pathNavigatorConditionallySetPath,
  pathNavigatorConditionallySetPathComplete,
  pathNavigatorConditionallySetPathFailed,
  pathNavigatorFetchParentItems,
  pathNavigatorFetchParentItemsComplete,
  pathNavigatorFetchPath,
  pathNavigatorFetchPathComplete,
  pathNavigatorFetchPathFailed,
  pathNavigatorInit,
  pathNavigatorItemChecked,
  pathNavigatorItemUnchecked,
  pathNavigatorRefresh,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath,
  pathNavigatorSetKeyword,
  pathNavigatorSetLocaleCode,
  pathNavigatorUpdate
} from '../actions/pathNavigator';
import { changeSite } from './sites';
import { fetchSiteUiConfig } from '../actions/configuration';

const reducer = createReducer<LookupTable<PathNavigatorStateProps>>(
  {},
  {
    [pathNavigatorInit.type]: (
      state,
      { payload: { id, path, currentPath, locale = 'en', collapsed = true, limit, keyword, offset, excludes } }
    ) => {
      return {
        ...state,
        [id]: {
          rootPath: path,
          currentPath: currentPath ?? path,
          localeCode: locale,
          keyword: keyword ?? '',
          isSelectMode: false,
          hasClipboard: false,
          levelDescriptor: null,
          itemsInPath: null,
          breadcrumb: [],
          selectedItems: [],
          limit,
          offset: offset ?? 0,
          total: 0,
          collapsed,
          isFetching: null,
          error: null,
          excludes
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
          currentPath: path,
          error: null
        }
      };
    },
    [pathNavigatorConditionallySetPath.type]: (state, { payload }) => ({
      ...state,
      [payload.id]: { ...state[payload.id], isFetching: true, error: null }
    }),
    [pathNavigatorConditionallySetPathComplete.type]: (state, { payload: { id, path, parent, children } }) => {
      if (parent.childrenCount > 0) {
        return {
          ...state,
          [id]: {
            ...state[id],
            currentPath: path,
            offset: 0,
            breadcrumb: getIndividualPaths(withoutIndex(path), withoutIndex(state[id].rootPath)),
            itemsInPath: children.map((item) => item.path),
            levelDescriptor: children.levelDescriptor?.path,
            total: children.total,
            isFetching: false,
            error: null
          }
        };
      } else {
        return {
          ...state,
          [id]: {
            ...state[id],
            isFetching: false,
            error: null
          }
        };
      }
    },
    [pathNavigatorConditionallySetPathFailed.type]: (state, { payload }) => ({
      ...state,
      [payload.id]: { ...state[payload.id], isFetching: false, error: payload.error }
    }),
    [pathNavigatorFetchPath.type]: (state, { payload }) => ({
      ...state,
      [payload.id]: { ...state[payload.id], isFetching: true, error: null }
    }),
    [pathNavigatorFetchPathComplete.type]: (state, { payload: { id, children, parent } }) => {
      const path = parent?.path ?? state[id].currentPath;
      return {
        ...state,
        [id]: {
          ...state[id],
          currentPath: path,
          breadcrumb: getIndividualPaths(withoutIndex(path), withoutIndex(state[id].rootPath)),
          itemsInPath: children.length === 0 ? [] : children.map((item) => item.path),
          levelDescriptor: children.levelDescriptor?.path,
          total: children.total,
          offset: children.offset,
          limit: children.limit,
          isFetching: false,
          error: null
        }
      };
    },
    [pathNavigatorFetchPathFailed.type]: (state, { payload: { id, error } }) => ({
      ...state,
      [id]: { ...state[id], isFetching: false, error: error }
    }),
    [pathNavigatorFetchParentItems.type]: (state, { payload: { id, path } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          currentPath: path,
          error: null
        }
      };
    },
    [pathNavigatorFetchParentItemsComplete.type]: (state, { payload: { id, children } }) => {
      const { currentPath, rootPath } = state[id];
      return {
        ...state,
        [id]: {
          ...state[id],
          itemsInPath: children.map((item) => item.path),
          levelDescriptor: children.levelDescriptor?.path ?? null,
          breadcrumb: getIndividualPaths(withoutIndex(currentPath), withoutIndex(rootPath)),
          limit: children.limit,
          total: children.total,
          offset: children.offset
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
    [pathNavigatorSetKeyword.type]: (state, { payload: { id, keyword } }) =>
      keyword === state.keyword
        ? state
        : {
            ...state,
            [id]: {
              ...state[id],
              keyword,
              isFetching: true
            }
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
    [pathNavigatorRefresh.type]: (state, { payload: { id } }) => ({
      ...state,
      [id]: { ...state[id], isFetching: true }
    }),
    [pathNavigatorChangePage.type]: (state, { payload: { id } }) => ({
      ...state,
      [id]: { ...state[id], isFetching: true }
    }),
    [pathNavigatorChangeLimit.type]: (state, { payload: { id, limit } }) => ({
      ...state,
      [id]: { ...state[id], limit, isFetching: true }
    }),
    [changeSite.type]: () => ({}),
    [fetchSiteUiConfig.type]: () => ({})
  }
);

export default reducer;
