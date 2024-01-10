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
import { PathNavigatorTreeStateProps } from '../../components/PathNavigatorTree';
import LookupTable from '../../models/LookupTable';
import {
  pathNavigatorTreeBulkFetchPathChildrenComplete,
  pathNavigatorTreeBulkRestoreComplete,
  pathNavigatorTreeCollapsePath,
  pathNavigatorTreeExpandPath,
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeFetchPathChildrenComplete,
  pathNavigatorTreeFetchPathPage,
  pathNavigatorTreeFetchPathPageComplete,
  pathNavigatorTreeInit,
  pathNavigatorTreeRestore,
  pathNavigatorTreeRestoreComplete,
  PathNavigatorTreeRestoreCompletePayload,
  pathNavigatorTreeRootMissing,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleCollapsed,
  pathNavigatorTreeUpdate
} from '../actions/pathNavigatorTree';
import { changeSite } from '../actions/sites';
import { fetchSiteUiConfig } from '../actions/configuration';
import { reversePluckProps } from '../../utils/object';
import { SocketEventBase, StandardAction } from '../../models';
import { fetchSandboxItemComplete, FetchSandboxItemCompletePayload } from '../actions/content';
import { getIndividualPaths, getParentPath, withIndex, withoutIndex } from '../../utils/path';
import { deleteContentEvent, moveContentEvent, MoveContentEventPayload } from '../actions/system';
import { createPresenceTable } from '../../utils/array';

const updatePath = (state, payload) => {
  const { id, parentPath, children, options } = payload;
  const chunk = state[id];
  chunk.totalByPath[parentPath] = children.total;
  chunk.childrenByParentPath[parentPath] = [];
  children.forEach((item) => {
    chunk.childrenByParentPath[parentPath].push(item.path);
    chunk.totalByPath[item.path] = item.childrenCount;
  });
  if (children.levelDescriptor) {
    chunk.childrenByParentPath[parentPath].push(children.levelDescriptor.path);
    chunk.totalByPath[children.levelDescriptor.path] = 0;
  }
  // If the expanded node has no children and is not filtered, it's a
  // leaf node and there's no point keeping it in `expanded`
  if (children.length === 0 && !options?.keyword) {
    chunk.expanded = chunk.expanded.filter((path) => path !== parentPath);
  }
};

const restoreTree = (state, payload) => {
  const { id, children, items, expanded } = payload;
  const chunk = state[id];
  chunk.childrenByParentPath = {};
  chunk.totalByPath = {};
  chunk.expanded = expanded;
  const childrenByParentPath = chunk.childrenByParentPath;
  const totalByPath = chunk.totalByPath;
  const offsetByPath = chunk.offsetByPath;
  items.forEach((item) => {
    totalByPath[item.path] = item.childrenCount;
  });
  Object.keys(children).forEach((parentPath) => {
    const childrenOfPath = children[parentPath];
    if (childrenOfPath.length || childrenOfPath.levelDescriptor) {
      childrenByParentPath[parentPath] = [];
      if (childrenOfPath.levelDescriptor) {
        childrenByParentPath[parentPath].push(childrenOfPath.levelDescriptor.path);
        totalByPath[childrenOfPath.levelDescriptor.path] = 0;
      }
      childrenOfPath.forEach((child) => {
        childrenByParentPath[parentPath].push(child.path);
        totalByPath[child.path] = child.childrenCount;
      });
    }
    // Should we account here for the level descriptor (LD)? if there's a LD, add 1 to the total?
    totalByPath[parentPath] = childrenOfPath.total;
    offsetByPath[parentPath] = offsetByPath[parentPath] ?? 0;
    // If the expanded node is filtered or has children it means, it's not a leaf,
    // and we should keep it in 'expanded'.
    // if (chunk.keywordByPath[parentPath] || childrenByParentPath[parentPath].length) {
    //   chunk.expanded.push(parentPath);
    // }
  });
};

export function contentAndDeleteEventForEachApplicableTree(
  state: LookupTable<PathNavigatorTreeStateProps>,
  targetPath: string,
  callbackFn: (tree: PathNavigatorTreeStateProps, targetPath: string, parentPathOfTargetPath: string) => void
): void {
  const parentPathOfTargetPath = getParentPath(targetPath);
  Object.values(state).forEach((tree) => {
    if (
      tree.rootPath === targetPath ||
      tree.rootPath === withIndex(targetPath) ||
      targetPath in tree.totalByPath ||
      withIndex(targetPath) in tree.totalByPath ||
      parentPathOfTargetPath in tree.totalByPath ||
      withIndex(parentPathOfTargetPath) in tree.totalByPath
    ) {
      callbackFn(tree, targetPath, parentPathOfTargetPath);
    }
  });
}

const expandPath = (state: LookupTable<PathNavigatorTreeStateProps>, { payload: { id, path } }) => {
  const chunk = state[id];
  if (path.startsWith(withoutIndex(chunk.rootPath)) && !chunk.expanded.includes(path)) {
    const paths = getIndividualPaths(path, chunk.rootPath);
    const expandedPathLookup = createPresenceTable(chunk.expanded);
    paths.forEach((path) => {
      !expandedPathLookup[path] && !expandedPathLookup[`${path}/index.xml`] && chunk.expanded.push(path);
    });
  }
};

export function deleteItemFromState(tree: PathNavigatorTreeStateProps, targetPath: string): void {
  let parentPath = getParentPath(targetPath);
  let totalByPath = tree.totalByPath;
  // path in totalByPath may be a page, and its path has index.xml
  parentPath = totalByPath[parentPath] ? parentPath : withIndex(parentPath);
  let childrenByParentPath = tree.childrenByParentPath;

  // Remove deleted item from the parent path's children
  childrenByParentPath[parentPath] = childrenByParentPath[parentPath].filter((childPath) => targetPath !== childPath);

  // Discount deleted item from parent path child count
  totalByPath[parentPath] = totalByPath[parentPath] - 1;

  // TODO: Remove.
  if (totalByPath[parentPath] < 0) {
    debugger;
  }

  // Remove item
  delete totalByPath[targetPath];
  delete tree.keywordByPath[targetPath];
  delete tree.offsetByPath[targetPath];
  // Remove children of the item
  delete childrenByParentPath[targetPath];
  // Remove item from expanded. Parent too if pertinent.
  tree.expanded = tree.expanded.filter(
    // If the parent is left without children, remove from expanded too.
    totalByPath[parentPath] === 0
      ? (expandedPath) => expandedPath !== targetPath || expandedPath !== parentPath
      : (expandedPath) => expandedPath !== targetPath
  );
}

const reducer = createReducer<LookupTable<PathNavigatorTreeStateProps>>(
  {},
  {
    // region pathNavigatorTreeInit
    [pathNavigatorTreeInit.type]: (state, action) => {
      const {
        payload: {
          id,
          rootPath,
          collapsed = true,
          limit,
          expanded = [],
          keywordByPath = {},
          excludes = null,
          systemTypes = null,
          sortStrategy = null,
          order = null
        }
      } = action;
      state[id] = {
        id,
        rootPath,
        collapsed,
        limit,
        expanded,
        childrenByParentPath: {},
        offsetByPath: {},
        keywordByPath,
        totalByPath: {},
        excludes,
        error: null,
        isRootPathMissing: false,
        systemTypes,
        sortStrategy,
        order
      };
    },
    // endregion
    [pathNavigatorTreeExpandPath.type]: expandPath,
    [pathNavigatorTreeCollapsePath.type]: (state, { payload: { id, path } }) => {
      state[id].expanded = state[id].expanded.filter((expanded) => !expanded.startsWith(path));
      state[id].offsetByPath = {
        ...state[id].offsetByPath,
        [path]: 0
      };
      state[id].childrenByParentPath = {
        ...state[id].childrenByParentPath,
        [path]: state[id].childrenByParentPath[path].splice(0, state[id].limit)
      };
    },
    [pathNavigatorTreeToggleCollapsed.type]: (state, { payload: { id, collapsed } }) => {
      state[id].collapsed = collapsed;
    },
    [pathNavigatorTreeSetKeyword.type]: (state, { payload: { id, path, keyword } }) => {
      state[id].keywordByPath[path] = keyword;
    },
    [pathNavigatorTreeFetchPathChildren.type]: (state, action) => {
      const { expand = true } = action.payload;
      expand && expandPath(state, action);
    },
    [pathNavigatorTreeFetchPathChildrenComplete.type]: (state, { payload: { id, parentPath, children, options } }) => {
      updatePath(state, { id, parentPath, children, options });
    },
    [pathNavigatorTreeBulkFetchPathChildrenComplete.type]: (state, { payload: { paths } }) => {
      paths.forEach((path) => {
        updatePath(state, path);
      });
    },
    [pathNavigatorTreeFetchPathPage.type]: (state, { payload: { id, path } }) => {
      state[id].offsetByPath[path] = state[id].offsetByPath[path]
        ? state[id].offsetByPath[path] + state[id].limit
        : state[id].limit;
    },
    [pathNavigatorTreeFetchPathPageComplete.type]: (state, { payload: { id, parentPath, children, options } }) => {
      const chunk = state[id];
      chunk.totalByPath[parentPath] = children.total;
      if (children.levelDescriptor) {
        chunk.totalByPath[children.levelDescriptor.path] = 0;
      }
      children.forEach((item) => {
        chunk.childrenByParentPath[parentPath].push(item.path);
        chunk.totalByPath[item.path] = item.childrenCount;
      });
    },
    [pathNavigatorTreeUpdate.type]: (state, { payload }) => {
      return {
        ...state,
        [payload.id]: {
          ...state[payload.id],
          ...reversePluckProps(payload, 'id')
        }
      };
    },
    [pathNavigatorTreeRestore.type]: (state, { payload: { id } }) => {
      state[id].isRootPathMissing = false;
    },
    // region pathNavigatorTreeRestoreComplete
    // Assumption: this reducer is a reset. Not suitable for partial updates.
    [pathNavigatorTreeRestoreComplete.type]: (
      state,
      { payload }: { payload: PathNavigatorTreeRestoreCompletePayload }
    ) => {
      restoreTree(state, payload);
    },
    // endregion
    // region pathNavigatorTreeBulkRestoreComplete
    [pathNavigatorTreeBulkRestoreComplete.type]: (state, { payload: { trees } }) => {
      trees.forEach((tree) => {
        restoreTree(state, tree);
      });
    },
    // endregion
    [changeSite.type]: () => ({}),
    [fetchSiteUiConfig.type]: () => ({}),
    // region fetchSandboxItemComplete
    [fetchSandboxItemComplete.type]: (
      state,
      { payload: { item } }: StandardAction<FetchSandboxItemCompletePayload>
    ) => {
      const path = item.path;
      Object.values(state).forEach((tree) => {
        if (path in tree.totalByPath) {
          tree.totalByPath[path] = item.childrenCount;
        }
      });
    },
    // endregion
    [pathNavigatorTreeRootMissing.type]: (state, { payload: { id } }) => {
      state[id].isRootPathMissing = true;
    },
    // region deleteContentEvent
    [deleteContentEvent.type]: (
      state: LookupTable<PathNavigatorTreeStateProps>,
      { payload: { targetPath } }: StandardAction<SocketEventBase>
    ) => {
      contentAndDeleteEventForEachApplicableTree(state, targetPath, (tree, targetPath, parentPathOfTargetPath) => {
        if (targetPath === tree.rootPath) {
          tree.isRootPathMissing = true;
        } else if (parentPathOfTargetPath in tree.totalByPath) {
          deleteItemFromState(tree, targetPath);
        }
      });
    },
    // endregion
    [moveContentEvent.type]: (state, { payload: { sourcePath } }: StandardAction<MoveContentEventPayload>) => {
      Object.values(state).forEach((tree) => {
        if (tree.rootPath === sourcePath) {
          tree.isRootPathMissing = true;
        } else if (sourcePath in tree.totalByPath) {
          deleteItemFromState(tree, sourcePath);
        }
      });
    }
  }
);

export default reducer;
