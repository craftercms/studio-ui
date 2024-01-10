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
import { getIndividualPaths, getParentPath, withoutIndex } from '../../utils/path';
import {
  pathNavigatorBulkFetchPathComplete,
  pathNavigatorBulkFetchPathFailed,
  pathNavigatorBulkRefresh,
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
  pathNavigatorUpdate,
  PathNavInitPayload,
  pathNavRootPathMissing
} from '../actions/pathNavigator';
import { changeSite } from '../actions/sites';
import { fetchSiteUiConfig } from '../actions/configuration';
import { contentEvent, deleteContentEvent, moveContentEvent, MoveContentEventPayload } from '../actions/system';
import SocketEvent from '../../models/SocketEvent';
import StandardAction from '../../models/StandardAction';

const updatePath = (state, payload) => {
  const { id, parent, children } = payload;
  if (
    // If it's not the first page, and the fetched data has no children, stay on the previous page.
    !(children.offset >= children.limit && children.length === 0)
  ) {
    const chunk = state[id];
    const path = parent?.path ?? state[id].currentPath;
    chunk.currentPath = path;
    chunk.breadcrumb = getIndividualPaths(withoutIndex(path), withoutIndex(state[id].rootPath));
    chunk.itemsInPath = children.length === 0 ? [] : children.map((item) => item.path);
    chunk.levelDescriptor = children.levelDescriptor?.path;
    chunk.total = children.total;
    chunk.offset = children.offset;
    chunk.limit = children.limit;
    chunk.isFetching = false;
    chunk.error = null;
  }
};

const reducer = createReducer<LookupTable<PathNavigatorStateProps>>(
  {},
  {
    [pathNavigatorInit.type]: (state, action: StandardAction<PathNavInitPayload>) => {
      const {
        id,
        rootPath,
        currentPath = rootPath,
        locale = 'en_US',
        collapsed = true,
        limit = 10,
        keyword = '',
        offset = 0,
        excludes
      } = action.payload;
      state[id] = {
        id,
        rootPath,
        currentPath: currentPath,
        localeCode: locale,
        keyword: keyword,
        isSelectMode: false,
        hasClipboard: false,
        levelDescriptor: null,
        itemsInPath: null,
        breadcrumb: [],
        selectedItems: [],
        limit,
        offset,
        total: 0,
        collapsed,
        isFetching: true,
        error: null,
        excludes,
        isRootPathMissing: false
      };
    },
    [pathNavigatorSetLocaleCode.type]: (state, { payload: { id, locale } }) => {
      state[id].localeCode = locale;
    },
    [pathNavigatorSetCurrentPath.type]: (state, { payload: { id, path } }) => {
      state[id].keyword = '';
      state[id].currentPath = path;
      state[id].error = null;
    },
    [pathNavigatorConditionallySetPath.type]: (state, { payload }) => {
      state[payload.id].isFetching = true;
      state[payload.id].error = null;
    },
    [pathNavigatorConditionallySetPathComplete.type]: (state, { payload: { id, path, parent, children } }) => {
      const chunk = state[id];
      chunk.isFetching = false;
      chunk.error = null;
      if (parent.childrenCount > 0) {
        chunk.currentPath = path;
        chunk.offset = 0;
        chunk.breadcrumb = getIndividualPaths(withoutIndex(path), withoutIndex(state[id].rootPath));
        chunk.itemsInPath = children.map((item) => item.path);
        chunk.levelDescriptor = children.levelDescriptor?.path;
        chunk.total = children.total;
      }
    },
    [pathNavigatorConditionallySetPathFailed.type]: (state, { payload }) => {
      state[payload.id].isFetching = false;
      state[payload.id].error = payload.error;
    },
    [pathNavigatorFetchPath.type]: (state, { payload }) => {
      state[payload.id].isFetching = true;
      state[payload.id].error = null;
    },
    [pathNavigatorFetchPathComplete.type]: (state, { payload: { id, children, parent } }) => {
      updatePath(state, { id, parent, children });
    },
    [pathNavigatorBulkFetchPathComplete.type]: (state, { payload: { paths } }) => {
      paths.forEach((path) => {
        updatePath(state, path);
      });
    },
    [pathNavigatorFetchPathFailed.type]: (state, { payload: { id, error } }) => {
      state[id].isFetching = false;
      state[id].error = error;
    },
    [pathNavigatorBulkFetchPathFailed.type]: (state, { payload: { ids, error } }) => {
      ids.forEach((id) => {
        state[id].isFetching = false;
        state[id].error = error;
      });
    },
    [pathNavigatorFetchParentItems.type]: (state, { payload: { id, path } }) => {
      state[id].isFetching = true;
      state[id].currentPath = path;
      state[id].error = null;
    },
    [pathNavigatorFetchParentItemsComplete.type]: (state, { payload: { id, children } }) => {
      const chunk = state[id];
      const { currentPath, rootPath } = chunk;
      chunk.itemsInPath = children.map((item) => item.path);
      chunk.levelDescriptor = children.levelDescriptor?.path ?? null;
      chunk.breadcrumb = getIndividualPaths(withoutIndex(currentPath), withoutIndex(rootPath));
      chunk.limit = children.limit;
      chunk.total = children.total;
      chunk.offset = children.offset;
      chunk.isFetching = false;
    },
    [pathNavigatorSetCollapsed.type]: (state, { payload: { id, collapsed } }) => {
      state[id].collapsed = collapsed;
    },
    [pathNavigatorSetKeyword.type]: (state, { payload: { id, keyword } }) => {
      if (keyword !== state.keyword) {
        state[id].keyword = keyword;
        state[id].isFetching = true;
      }
    },
    [pathNavigatorItemChecked.type]: (state, { payload: { id, item } }) => {
      state[id].itemsInPath.push(item.path);
    },
    [pathNavigatorItemUnchecked.type]: (state, { payload: { id, item } }) => {
      const chunk = state[id];
      chunk.selectedItems.splice(chunk.selectedItems.indexOf(item.path), 1);
    },
    [pathNavigatorClearChecked.type]: (state, { payload: { id } }) => {
      state[id].selectedItems = [];
    },
    [pathNavigatorUpdate.type]: (state, { payload }) => {
      Object.assign(state[payload.id], payload);
    },
    [pathNavigatorRefresh.type]: (state, { payload: { id } }) => {
      state[id].isFetching = true;
    },
    [pathNavigatorBulkRefresh.type]: (state, { payload: { ids } }) => {
      ids.forEach((id) => {
        state[id].isFetching = true;
      });
    },
    [pathNavigatorChangePage.type]: (state, { payload: { id } }) => {
      state[id].isFetching = true;
    },
    [pathNavigatorChangeLimit.type]: (state, { payload: { id, limit } }) => {
      state[id].limit = limit;
      state[id].isFetching = true;
    },
    [changeSite.type]: () => ({}),
    [fetchSiteUiConfig.type]: () => ({}),
    [pathNavRootPathMissing.type]: (state, { payload: { id } }) => {
      state[id].isRootPathMissing = true;
      state[id].isFetching = false;
    },
    [contentEvent.type]: (state, { payload: { targetPath } }: StandardAction<SocketEvent>) => {
      Object.values(state).forEach((navigator) => {
        if (navigator.isRootPathMissing && targetPath === navigator.rootPath) {
          navigator.isRootPathMissing = false;
        }
      });
    },
    [moveContentEvent.type]: (state, action: StandardAction<MoveContentEventPayload>) => {
      const {
        payload: { targetPath, sourcePath }
      } = action;
      Object.values(state).forEach((navigator) => {
        if (sourcePath === navigator.rootPath) {
          navigator.isRootPathMissing = true;
        } else if (navigator.isRootPathMissing && targetPath === navigator.rootPath) {
          navigator.isRootPathMissing = false;
        }
      });
    },
    [deleteContentEvent.type]: (state, { payload: { targetPath } }: StandardAction<SocketEvent>) => {
      Object.values(state).forEach((navigator) => {
        const parentPath = getParentPath(targetPath);
        if (targetPath === navigator.rootPath || navigator.rootPath.startsWith(targetPath)) {
          navigator.isRootPathMissing = true;
        } else if (parentPath === navigator.currentPath) {
          if (!navigator.excludes?.includes(targetPath)) {
            navigator.total = navigator.total - 1;
          }
          navigator.itemsInPath = navigator.itemsInPath.filter((path) => path !== targetPath);
          navigator.selectedItems = navigator.selectedItems.filter((path) => path !== targetPath);
        } else if (navigator.levelDescriptor === targetPath) {
          navigator.levelDescriptor = null;
        }
      });
    }
  }
);

export default reducer;
