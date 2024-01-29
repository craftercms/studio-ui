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

import { ofType } from 'redux-observable';
import { filter, ignoreElements, map, mergeMap, switchMap, tap, throttleTime, withLatestFrom } from 'rxjs/operators';
import { CrafterCMSEpic } from '../store';
import {
  pathNavigatorTreeBackgroundRefresh,
  pathNavigatorTreeBulkFetchPathChildren,
  pathNavigatorTreeBulkFetchPathChildrenComplete,
  pathNavigatorTreeBulkFetchPathChildrenFailed,
  pathNavigatorTreeBulkRefresh,
  pathNavigatorTreeBulkRestoreComplete,
  pathNavigatorTreeBulkRestoreFailed,
  pathNavigatorTreeCollapsePath,
  pathNavigatorTreeExpandPath,
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeFetchPathChildrenComplete,
  pathNavigatorTreeFetchPathChildrenFailed,
  pathNavigatorTreeFetchPathPage,
  pathNavigatorTreeFetchPathPageComplete,
  pathNavigatorTreeFetchPathPageFailed,
  pathNavigatorTreeInit,
  pathNavigatorTreeRefresh,
  pathNavigatorTreeRestore,
  pathNavigatorTreeRestoreComplete,
  pathNavigatorTreeRestoreFailed,
  pathNavigatorTreeRootMissing,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleCollapsed,
  pathNavigatorTreeUpdate,
  PathNavTreeBulkFetchPathChildrenPayload,
  PathNavTreeFetchPathChildrenPayload
} from '../actions/pathNavigatorTree';
import {
  checkPathExistence,
  fetchChildrenByPath,
  fetchChildrenByPaths,
  fetchItemsByPath
} from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import { removeStoredPathNavigatorTree, setStoredPathNavigatorTree } from '../../utils/state';
import { forkJoin, NEVER, Observable } from 'rxjs';
import { createPresenceTable } from '../../utils/array';
import { getFileExtension, getIndividualPaths, getParentPath, getRootPath, withoutIndex } from '../../utils/path';
import { batchActions } from '../actions/misc';
import {
  contentEvent,
  deleteContentEvent,
  moveContentEvent,
  MoveContentEventPayload,
  pluginInstalled,
  publishEvent,
  workflowEvent
} from '../actions/system';
import StandardAction from '../../models/StandardAction';
import { GetChildrenOptions, MarketplacePlugin, SocketEventBase } from '../../models';
import { contentAndDeleteEventForEachApplicableTree } from '../reducers/pathNavigatorTree';
import { PathNavigatorTreeStateProps } from '../../components';
import { pluckProps } from '../../utils/object';

const createGetChildrenOptions: (
  chunk: PathNavigatorTreeStateProps,
  optionOverrides?: Partial<GetChildrenOptions>
) => Partial<GetChildrenOptions> = (chunk, optionOverrides) => ({
  ...pluckProps(chunk, true, 'limit', 'excludes', 'systemTypes'),
  ...optionOverrides
});

export default [
  // region pathNavigatorTreeInit, pathNavigatorTreeRefresh, pathNavigatorTreeBackgroundRefresh
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeInit.type, pathNavigatorTreeRefresh.type, pathNavigatorTreeBackgroundRefresh.type),
      withLatestFrom(state$),
      filter(
        ([{ type, payload }, state]) =>
          type === pathNavigatorTreeInit.type ||
          // For pathNavigatorTreeRefresh (e.g. path is missing, refresh is pressed on the navigator
          // or socket refresh, fetch again to check if the path was created in the background).
          state.pathNavigatorTree[payload.id].isRootPathMissing
      ),
      mergeMap(([{ payload }, state]) =>
        checkPathExistence(state.sites.active, state.pathNavigatorTree[payload.id].rootPath).pipe(
          map((exists) =>
            exists ? pathNavigatorTreeRestore({ id: payload.id }) : pathNavigatorTreeRootMissing({ id: payload.id })
          )
        )
      )
    ),
  // endregion
  // region pathNavigatorTreeRestore, pathNavigatorTreeRefresh, pathNavigatorTreeBackgroundRefresh
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeRestore.type, pathNavigatorTreeRefresh.type, pathNavigatorTreeBackgroundRefresh.type),
      withLatestFrom(state$),
      filter(([{ payload }, state]) => !state.pathNavigatorTree[payload.id].isRootPathMissing),
      mergeMap(([{ payload }, state]) => {
        let chunk = state.pathNavigatorTree[payload.id];
        let {
          id,
          path = chunk.rootPath,
          expanded = chunk.expanded,
          collapsed = chunk.collapsed,
          keywordByPath = chunk.keywordByPath,
          offsetByPath = chunk.offsetByPath,
          limit = chunk.limit
        } = payload;
        let paths = [];
        expanded.forEach((expandedPath) => {
          getIndividualPaths(expandedPath, path).forEach((parentPath) => {
            if (!paths.includes(parentPath)) {
              paths.push(parentPath);
            }
          });
        });
        // When initializing — unless there's a stored state — need to manually push the root,
        // so it gets loaded and pushed on to the state.
        if (paths.length === 0) {
          paths.push(state.pathNavigatorTree[id].rootPath);
        }
        return forkJoin([
          fetchItemsByPath(state.sites.active, paths, { castAsDetailedItem: true }),
          fetchChildrenByPaths(
            state.sites.active,
            createPresenceTable(expanded, (value) => ({
              ...(keywordByPath[value] ? { keyword: keywordByPath[value] } : {}),
              ...(offsetByPath[value] ? { limit: limit + offsetByPath[value] } : {})
            })),
            createGetChildrenOptions(chunk, pluckProps(payload, true, 'limit', 'excludes'))
          )
        ]).pipe(
          map(([items, children]) => pathNavigatorTreeRestoreComplete({ id, expanded, collapsed, items, children })),
          catchAjaxError((error) => {
            if (error.status === 404) {
              const uuid = state.sites.byId[state.sites.active].uuid;
              setStoredPathNavigatorTree(uuid, state.user.username, id, {
                expanded: state.pathNavigatorTree[id].expanded,
                collapsed: state.pathNavigatorTree[id].collapsed,
                keywordByPath: state.pathNavigatorTree[id].keywordByPath
              });
              return batchActions([pathNavigatorTreeUpdate({ id, expanded: [] }), pathNavigatorTreeRefresh({ id })]);
            } else {
              return pathNavigatorTreeRestoreFailed({ error, id });
            }
          })
        );
      })
    ),
  // endregion
  // region pathNavigatorTreeBulkBackgroundRefresh
  (action$, state$) =>
    // TODO: There's no special handling for background vs visible. Should there be?
    action$.pipe(
      ofType(pathNavigatorTreeBulkRefresh.type),
      withLatestFrom(state$),
      mergeMap(([{ payload }, state]) => {
        const { requests } = payload;
        let paths = [];
        let optionsByPath = {};

        // For each tree, get the paths of the expanded nodes that will be retrieved, and the options for the children
        // that will be fetched
        requests.forEach(({ id }) => {
          const chunk = state.pathNavigatorTree[id];
          const { expanded, keywordByPath, offsetByPath, limit } = chunk;
          expanded.forEach((expandedPath) => {
            getIndividualPaths(expandedPath, chunk.rootPath).forEach((parentPath) => {
              if (!paths.includes(parentPath)) {
                paths.push(parentPath);
              }
            });
          });
          if (!expanded.length) {
            paths.push(chunk.rootPath);
          }
          optionsByPath = {
            ...optionsByPath,
            ...createPresenceTable(expanded, (value) => ({
              ...(keywordByPath[value] ? { keyword: keywordByPath[value] } : {}),
              ...(offsetByPath[value] ? { limit: limit + offsetByPath[value] } : {}),
              ...createGetChildrenOptions(chunk, pluckProps(payload, true, 'limit', 'excludes'))
            }))
          };
        });
        return requests.length
          ? forkJoin([
              fetchItemsByPath(state.sites.active, paths, { castAsDetailedItem: true }),
              fetchChildrenByPaths(state.sites.active, optionsByPath)
            ]).pipe(
              map(([items, children]) => {
                const trees = [];
                requests.forEach(({ id }) => {
                  let updatedExpanded = state.pathNavigatorTree[id].expanded;
                  if (items.missingItems.length) {
                    updatedExpanded = state.pathNavigatorTree[id].expanded.filter(
                      (expandedPath) => !items.missingItems.includes(expandedPath)
                    );
                    const uuid = state.sites.byId[state.sites.active].uuid;
                    setStoredPathNavigatorTree(uuid, state.user.username, id, {
                      expanded: updatedExpanded,
                      collapsed: state.pathNavigatorTree[id].collapsed,
                      keywordByPath: state.pathNavigatorTree[id].keywordByPath
                    });
                  }

                  // Filter children, only keep those that are children of the rootPath of the current tree
                  const treeChildrenByPath = {};
                  Object.entries(children).forEach(([parentPath, children]) => {
                    if (parentPath.startsWith(withoutIndex(state.pathNavigatorTree[id].rootPath))) {
                      treeChildrenByPath[parentPath] = children;
                    }
                  });
                  // Add the restored tree, containing the filtered items and children for the current tree.
                  trees.push({
                    id,
                    expanded: updatedExpanded,
                    collapsed: state.pathNavigatorTree[id].collapsed,
                    items: items.filter((item) =>
                      item.path.startsWith(withoutIndex(state.pathNavigatorTree[id].rootPath))
                    ),
                    children: treeChildrenByPath
                  });
                });
                return pathNavigatorTreeBulkRestoreComplete({ trees });
              }),
              catchAjaxError((error) =>
                pathNavigatorTreeBulkRestoreFailed({ ids: requests.map(({ id }) => id), error })
              )
            )
          : NEVER;
      })
    ),
  // endregion
  // region pathNavigatorFetchPathChildren
  (action$: Observable<StandardAction<PathNavTreeFetchPathChildrenPayload>>, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeFetchPathChildren.type),
      withLatestFrom(state$),
      mergeMap(([{ payload }, state]) => {
        const { id, path, options } = payload;
        const chunk = state.pathNavigatorTree[id];
        const finalOptions = createGetChildrenOptions(chunk, options);
        return fetchChildrenByPath(state.sites.active, path, {
          ...finalOptions,
          ...(chunk.offsetByPath[path] && {
            limit: chunk.limit + chunk.offsetByPath[path]
          })
        }).pipe(
          map((children) =>
            pathNavigatorTreeFetchPathChildrenComplete({
              id,
              children,
              parentPath: path,
              options: finalOptions
            })
          ),
          catchAjaxError((error) => pathNavigatorTreeFetchPathChildrenFailed({ error, id }))
        );
      })
    ),
  // endregion
  // region pathNavigatorTreeBulkFetchPathChildren
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeBulkFetchPathChildren.type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        const { requests } = action.payload;
        const optionsByPath = {};
        requests.forEach((request) => {
          const chunk = state.pathNavigatorTree[request.id];
          optionsByPath[request.path] = {
            ...createGetChildrenOptions(chunk, request.options),
            ...(chunk.offsetByPath[request.path] && {
              limit: chunk.limit + chunk.offsetByPath[request.path]
            })
          };
        });
        return fetchChildrenByPaths(state.sites.active, optionsByPath).pipe(
          map((children) => {
            const paths = [];
            requests.forEach((item) => {
              paths.push({
                id: item.id,
                children: children[item.path],
                parentPath: item.path,
                options: optionsByPath[item.path]
              });
            });
            return pathNavigatorTreeBulkFetchPathChildrenComplete({ paths });
          }),
          catchAjaxError((error) =>
            pathNavigatorTreeBulkFetchPathChildrenFailed({ ids: requests.map((item) => item.id), error })
          )
        );
      })
    ),
  // endregion
  // region pathNavigatorTreeSetKeyword
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeSetKeyword.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        const { id, path, keyword } = payload;
        const chunk = state.pathNavigatorTree[id];
        const options = createGetChildrenOptions(chunk, { keyword });
        return fetchChildrenByPath(state.sites.active, path, options).pipe(
          map((children) => pathNavigatorTreeFetchPathChildrenComplete({ id, parentPath: path, children, options })),
          catchAjaxError((error) => pathNavigatorTreeFetchPathChildrenFailed({ error, id }))
        );
      })
    ),
  // endregion
  // region pathNavigatorTreeFetchPathPage
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeFetchPathPage.type),
      withLatestFrom(state$),
      mergeMap(([{ payload }, state]) => {
        const { id, path } = payload;
        const chunk = state.pathNavigatorTree[id];
        const keyword = state.pathNavigatorTree[id].keywordByPath[path];
        const offset = state.pathNavigatorTree[id].offsetByPath[path];
        return fetchChildrenByPath(
          state.sites.active,
          path,
          createGetChildrenOptions(chunk, {
            keyword: keyword,
            offset: offset
          })
        ).pipe(
          map((children) =>
            pathNavigatorTreeFetchPathPageComplete({
              id,
              parentPath: path,
              children,
              options: { keyword, offset }
            })
          ),
          catchAjaxError((error) => pathNavigatorTreeFetchPathPageFailed({ error, id }))
        );
      })
    ),
  // endregion
  // region Local storage setting
  (action$, state$) =>
    action$.pipe(
      ofType(
        pathNavigatorTreeCollapsePath.type,
        pathNavigatorTreeExpandPath.type,
        pathNavigatorTreeFetchPathChildrenComplete.type,
        pathNavigatorTreeFetchPathPageComplete.type,
        pathNavigatorTreeToggleCollapsed.type
      ),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        const { id } = payload;
        const { expanded, collapsed, keywordByPath } = state.pathNavigatorTree[id];
        const uuid = state.sites.byId[state.sites.active].uuid;
        setStoredPathNavigatorTree(uuid, state.user.username, id, {
          expanded,
          collapsed,
          keywordByPath
        });
      }),
      ignoreElements()
    ),
  // endregion
  // region contentEvent
  (action$: Observable<StandardAction<SocketEventBase>>, state$) =>
    action$.pipe(
      ofType(contentEvent.type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        const actions = [];
        const refreshRequests = [];
        const idsToRefreshChildrenOnly: PathNavTreeBulkFetchPathChildrenPayload['requests'] = [];
        // Content Event Cases:
        // a. New file/folder: fetch parent
        // b. File/folder updated: fetch item
        contentAndDeleteEventForEachApplicableTree(
          state.pathNavigatorTree,
          action.payload.targetPath,
          (tree, targetPath, parentPathOfTargetPath) => {
            const id = tree.id;
            const rootPath = tree.rootPath;
            const extension = getFileExtension(targetPath);
            const isFile = extension === '';
            const parentPath = isFile ? parentPathOfTargetPath : getParentPath(targetPath);
            if (
              // If the path corresponds to the root and the root didn't exist, root now exists
              tree.isRootPathMissing &&
              targetPath === rootPath
            ) {
              refreshRequests.push({ id });
            } else if (
              // If an entry for the path exists, assume it's an update to an existing item
              targetPath in tree.totalByPath
            ) {
              // Reloading the item done by content epics
              // actions.push(fetchSandboxItem({ path }));
            } else if (
              // If an entry for the folder exists, fetch
              parentPath in tree.totalByPath
            ) {
              // Show/fetch the new child(ren)
              parentPath in tree.childrenByParentPath &&
                idsToRefreshChildrenOnly.push({ id, path: parentPath, expand: false });
              // Update child count done by content epics.
              // fetchSandboxItem({ path: parentPath })
            }
          }
        );
        refreshRequests.length && actions.push(pathNavigatorTreeBulkRefresh({ requests: refreshRequests }));
        idsToRefreshChildrenOnly.length &&
          actions.push(pathNavigatorTreeBulkFetchPathChildren({ requests: idsToRefreshChildrenOnly }));
        return actions;
      })
    ),
  // endregion
  // region deleteContentEvent
  (action$, state$) =>
    action$.pipe(
      ofType(deleteContentEvent.type),
      withLatestFrom(state$),
      tap(([, state]) => {
        Object.values(state.pathNavigatorTree).forEach((tree) => {
          tree.isRootPathMissing &&
            removeStoredPathNavigatorTree(state.sites.byId[state.sites.active].uuid, state.user.username, tree.id);
        });
      }),
      ignoreElements()
    ),
  // endregion
  // region moveContentEvent
  (action$: Observable<StandardAction<MoveContentEventPayload>>, state$) =>
    action$.pipe(
      ofType(moveContentEvent.type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        const actions = [];
        const targetPath = action.payload.targetPath;
        const sourcePath = action.payload.sourcePath;
        const parentPathOfTargetPath = getParentPath(targetPath);
        const parentPathOfSourcePath = getParentPath(sourcePath);
        const refreshRequests = [];
        const idsToRefreshChildrenOnly: PathNavTreeBulkFetchPathChildrenPayload['requests'] = [];
        Object.values(state.pathNavigatorTree).forEach((tree) => {
          const id = tree.id;
          if (
            // The missing path got created.
            tree.isRootPathMissing &&
            tree.rootPath === targetPath
          ) {
            refreshRequests.push({ id });
          } else {
            [parentPathOfTargetPath, parentPathOfSourcePath].forEach((path) => {
              if (
                // If in totalByPath is an item that has been loaded and must update...
                path in tree.totalByPath
              ) {
                // If its children are loaded, then re-fetch to get the new
                if (tree.childrenByParentPath[path]) {
                  idsToRefreshChildrenOnly.push({ id, path, expand: false });
                }
                // Re-fetching the item done by content epics.
                // fetchSandboxItem({ path: path })
              }
            });
          }
        });
        refreshRequests.length && actions.push(pathNavigatorTreeBulkRefresh({ requests: refreshRequests }));
        idsToRefreshChildrenOnly.length &&
          actions.push(pathNavigatorTreeBulkFetchPathChildren({ requests: idsToRefreshChildrenOnly }));
        return actions;
      })
    ),
  // endregion
  // region pluginInstalled
  // Can't be smart about this one given the level of information the event provides.
  (action$: Observable<StandardAction<MarketplacePlugin>>, state$) =>
    action$.pipe(
      ofType(pluginInstalled.type),
      throttleTime(500),
      withLatestFrom(state$),
      switchMap(([, state]) => {
        const requests = [];
        Object.values(state.pathNavigatorTree).forEach((tree) => {
          if (['/templates', '/scripts', '/static-assets'].includes(getRootPath(tree.rootPath))) {
            requests.push({ id: tree.id, backgroundRefresh: true });
          }
        });
        return requests.length ? [pathNavigatorTreeBulkRefresh({ requests })] : NEVER;
      })
    ),
  // endregion
  // region workflowEvent, publishEvent
  // Can't be smart about these given the level of information the events provide.
  (action$, state$) =>
    action$.pipe(
      ofType(workflowEvent.type, publishEvent.type),
      throttleTime(500),
      withLatestFrom(state$),
      map(([, state]) =>
        pathNavigatorTreeBulkRefresh({
          requests: Object.keys(state.pathNavigatorTree).map((id) => ({ id, backgroundRefresh: true }))
        })
      )
    )
  // endregion
] as CrafterCMSEpic[];
