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
  pathNavigatorTreesBackgroundRefresh,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleCollapsed,
  pathNavigatorTreeUpdate
} from '../actions/pathNavigatorTree';
import {
  checkPathExistence,
  fetchChildrenByPath,
  fetchChildrenByPaths,
  fetchItemsByPath
} from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import { removeStoredPathNavigatorTree, setStoredPathNavigatorTree } from '../../utils/state';
import { forkJoin, Observable, of } from 'rxjs';
import { createPresenceTable } from '../../utils/array';
import {
  getFileExtension,
  getIndividualPaths,
  getParentPath,
  getRootPath,
  withIndex,
  withoutIndex
} from '../../utils/path';
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
  ...pluckProps(chunk, true, 'limit', 'excludes', 'systemTypes', 'sortStrategy', 'order'),
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
          map(([items, children]) => {
            let updatedExpanded = expanded;
            if (items.missingItems.length) {
              // remove items.missingItems from expanded
              updatedExpanded = expanded.filter((expandedPath) => !items.missingItems.includes(expandedPath));
              const uuid = state.sites.byId[state.sites.active].uuid;
              setStoredPathNavigatorTree(uuid, state.user.username, id, {
                expanded: updatedExpanded,
                collapsed: state.pathNavigatorTree[id].collapsed,
                keywordByPath: state.pathNavigatorTree[id].keywordByPath
              });
            }
            return pathNavigatorTreeRestoreComplete({ id, expanded: updatedExpanded, collapsed, items, children });
          }),
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
  // region pathNavigatorTreesBackgroundRefresh
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreesBackgroundRefresh.type),
      withLatestFrom(state$),
      mergeMap(([{ payload }, state]) => {
        const { ids } = payload;
        const expandedTreesIds = ids.filter((id) => !state.pathNavigatorTree[id].collapsed);
        let paths = [];
        let optionsByPath = {};

        // For each tree, get the paths of the expanded nodes that will be retrieved, and the options for the children
        // that will be fetched
        expandedTreesIds.forEach((id) => {
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
        return forkJoin([
          fetchItemsByPath(state.sites.active, paths, { castAsDetailedItem: true }),
          fetchChildrenByPaths(state.sites.active, optionsByPath)
        ]).pipe(
          map(([items, children]) => {
            const actions = [];

            expandedTreesIds.forEach((id) => {
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
              // Add the restoreComplete action to the batch of actions, containing the filtered items and children
              // for the current tree.
              actions.push(
                pathNavigatorTreeRestoreComplete({
                  id,
                  expanded: updatedExpanded,
                  collapsed: state.pathNavigatorTree[id].collapsed,
                  items: items.filter((item) =>
                    item.path.startsWith(withoutIndex(state.pathNavigatorTree[id].rootPath))
                  ),
                  children: treeChildrenByPath
                })
              );
            });
            return batchActions(actions);
          }),
          catchAjaxError((error) => {
            const actions = [];
            expandedTreesIds.forEach((id) => {
              actions.push(pathNavigatorTreeRestoreFailed({ error, id }));
            });
            return batchActions(actions);
          })
        );
      })
    ),
  // endregion
  // region pathNavigatorFetchPathChildren
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeFetchPathChildren.type),
      withLatestFrom(state$),
      mergeMap(([{ payload }, state]) => {
        const { id, path, options } = payload;
        const chunk = state.pathNavigatorTree[id];
        const finalOptions = createGetChildrenOptions(chunk, options);
        return fetchChildrenByPath(state.sites.active, path, {
          ...finalOptions,
          ...(chunk.offsetByPath[path]
            ? {
                limit: chunk.limit + chunk.offsetByPath[path]
              }
            : {})
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
        // Content Event Cases:
        // a. New file/folder: fetch parent
        // b. File/folder updated (with no `sortStrategy` or `order` configurations set up): fetch item
        contentAndDeleteEventForEachApplicableTree(
          state.pathNavigatorTree,
          action.payload.targetPath,
          (tree, targetPath, parentPathOfTargetPath) => {
            const id = tree.id;
            const rootPath = tree.rootPath;
            const extension = getFileExtension(targetPath);
            const isFile = extension === '';
            const parentPath = isFile ? parentPathOfTargetPath : getParentPath(targetPath);
            const sortingOptionsSet = Boolean(tree.sortStrategy || tree.order);
            if (
              // If the path corresponds to the root and the root didn't exist, root now exists
              tree.isRootPathMissing &&
              (targetPath === rootPath || withIndex(targetPath) === rootPath)
            ) {
              actions.push(pathNavigatorTreeRefresh({ id }));
            } else if (
              // If an entry for the path exists, assume it's an update to an existing item.
              // If sorting options are set, the parent path needs to be updated for the sort order to be correct.
              (targetPath in tree.totalByPath || withIndex(targetPath) in tree.totalByPath) &&
              !sortingOptionsSet
            ) {
              // Reloading the item done by content epics
              // actions.push(fetchSandboxItem({ path }));
            } else if (
              // If an entry for the folder exists, fetch
              parentPath in tree.totalByPath ||
              withIndex(parentPath) in tree.totalByPath
            ) {
              const pathToUpdate = parentPath in tree.totalByPath ? parentPath : withIndex(parentPath);
              // Show the new child
              pathToUpdate in tree.childrenByParentPath &&
                actions.push(pathNavigatorTreeFetchPathChildren({ id, path: pathToUpdate, expand: false }));
              // Update child count done by content epics.
              // fetchSandboxItem({ path: parentPath })
            }
          }
        );
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
        Object.values(state.pathNavigatorTree).forEach((tree) => {
          const id = tree.id;
          if (
            // The missing path got created.
            tree.isRootPathMissing &&
            tree.rootPath === targetPath
          ) {
            actions.push(pathNavigatorTreeRefresh({ id }));
          } else {
            [parentPathOfTargetPath, parentPathOfSourcePath].forEach((path) => {
              if (
                // If in totalByPath is an item that has been loaded and must update...
                // path in totalByPath may be a page, and its path has index.xml, so it needs to be validated too.
                path in tree.totalByPath ||
                withIndex(path) in tree.totalByPath
              ) {
                // Get correct path to fetch (may include index.xml)
                const fetchPath = path in tree.totalByPath ? path : withIndex(path);
                // If its children are loaded, then re-fetch to get the new
                tree.childrenByParentPath[fetchPath] &&
                  actions.push(
                    pathNavigatorTreeFetchPathChildren({
                      id: id,
                      path: fetchPath,
                      expand: false
                    })
                  );
                // Re-fetching the item done by content epics.
                // fetchSandboxItem({ path: path })
              }
            });
          }
        });
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
      mergeMap(([, state]) => {
        const actions = [];
        Object.values(state.pathNavigatorTree).forEach((tree) => {
          if (['/templates', '/scripts', '/static-assets'].includes(getRootPath(tree.rootPath))) {
            actions.push(pathNavigatorTreeBackgroundRefresh({ id: tree.id }));
          }
        });
        return actions;
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
      mergeMap(([, state]) => {
        return of(pathNavigatorTreesBackgroundRefresh({ ids: Object.keys(state.pathNavigatorTree) }));
      })
    )
  // endregion
] as CrafterCMSEpic[];
