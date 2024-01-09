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
import { ignoreElements, map, mergeMap, tap, throttleTime, withLatestFrom } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import {
  checkPathExistence,
  fetchChildrenByPath,
  fetchChildrenByPaths,
  fetchItemsByPath,
  fetchItemWithChildrenByPath
} from '../../services/content';
import { getIndividualPaths, getParentPath, getRootPath, withIndex, withoutIndex } from '../../utils/path';
import { forkJoin, Observable, of } from 'rxjs';
import {
  pathNavigatorBackgroundRefresh,
  pathNavigatorChangeLimit,
  pathNavigatorChangePage,
  pathNavigatorConditionallySetPath,
  pathNavigatorConditionallySetPathComplete,
  pathNavigatorConditionallySetPathFailed,
  pathNavigatorFetchParentItems,
  pathNavigatorFetchParentItemsComplete,
  pathNavigatorFetchPath,
  pathNavigatorFetchPathComplete,
  pathNavigatorFetchPathFailed,
  pathNavigatorInit,
  pathNavigatorRefresh,
  pathNavigatorBulkBackgroundRefresh,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath,
  pathNavigatorSetKeyword,
  PathNavInitPayload,
  pathNavRootPathMissing,
  pathNavigatorBulkRefresh
} from '../actions/pathNavigator';
import { setStoredPathNavigator } from '../../utils/state';
import { CrafterCMSEpic } from '../store';
import { showErrorDialog } from '../reducers/dialogs/error';
import { AjaxError } from 'rxjs/ajax';
import StandardAction from '../../models/StandardAction';
import SocketEvent from '../../models/SocketEvent';
import {
  contentEvent,
  deleteContentEvent,
  moveContentEvent,
  MoveContentEventPayload,
  pluginInstalled,
  publishEvent,
  workflowEvent
} from '../actions/system';
import { batchActions } from '../actions/misc';

export default [
  // region pathNavigatorInit
  (action$: Observable<StandardAction<PathNavInitPayload>>, state$) =>
    action$.pipe(
      ofType(pathNavigatorInit.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            payload: { id, excludes, rootPath, limit, sortStrategy, order }
          },
          state
        ]) =>
          checkPathExistence(state.sites.active, rootPath).pipe(
            map((exists) =>
              exists
                ? pathNavigatorFetchParentItems({
                    id,
                    path: state.pathNavigator[id].currentPath,
                    offset: state.pathNavigator[id].offset,
                    keyword: state.pathNavigator[id].keyword,
                    excludes,
                    limit,
                    sortStrategy,
                    order
                  })
                : pathNavRootPathMissing({ id })
            )
          )
      )
    ),
  // endregion
  // region pathNavigatorRefresh
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorRefresh.type, pathNavigatorBackgroundRefresh.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            type,
            payload: { id }
          },
          state
        ]) =>
          fetchItemWithChildrenByPath(state.sites.active, state.pathNavigator[id].currentPath, {
            keyword: state.pathNavigator[id].keyword,
            limit: state.pathNavigator[id].limit,
            offset: state.pathNavigator[id].offset,
            excludes: state.pathNavigator[id].excludes,
            sortStrategy: state.pathNavigator[id].sortStrategy,
            order: state.pathNavigator[id].order
          }).pipe(
            map(({ item, children }) => pathNavigatorFetchPathComplete({ id, parent: item, children })),
            catchAjaxError((error: AjaxError) => {
              if (error.status === 404 && state.pathNavigator[id].rootPath !== state.pathNavigator[id].currentPath) {
                return pathNavigatorConditionallySetPath({ id, path: state.pathNavigator[id].rootPath });
              } else {
                return pathNavigatorFetchPathFailed({ error, id });
              }
            })
          )
      )
    ),
  // endregion
  // region pathNavigatorBulkBackgroundRefresh
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorBulkBackgroundRefresh.type, pathNavigatorBulkRefresh.type),
      withLatestFrom(state$),
      mergeMap(([{ payload }, state]) => {
        const { ids } = payload;
        let paths = [];
        let optionsByPath = {};

        ids.forEach((id) => {
          const chunk = state.pathNavigator[id];
          const { currentPath, keyword, limit, offset, excludes, sortStrategy, order } = chunk;
          paths.push(currentPath);
          optionsByPath[currentPath] = {
            keyword,
            limit,
            offset,
            excludes,
            sortStrategy,
            order
          };
        });

        return forkJoin([
          fetchItemsByPath(state.sites.active, paths, { castAsDetailedItem: true }),
          fetchChildrenByPaths(state.sites.active, optionsByPath)
        ]).pipe(
          map(([items, children]) => {
            const actions = [];
            ids.forEach((id) => {
              actions.push(
                pathNavigatorFetchPathComplete({
                  id,
                  parent: items.find((item) => item.path.startsWith(withoutIndex(state.pathNavigator[id].currentPath))),
                  children: children[state.pathNavigator[id].currentPath]
                })
              );
            });
            return batchActions(actions);
          }),
          catchAjaxError((error) => {
            const actions = [];
            ids.forEach((id) => {
              actions.push(pathNavigatorFetchPathFailed({ error, id }));
            });
            return batchActions(actions);
          })
        );
      })
    ),
  // endregion
  // region pathNavigatorFetchPath
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorFetchPath.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            type,
            payload: { id, path, keyword }
          },
          state
        ]) =>
          fetchItemWithChildrenByPath(state.sites.active, path, {
            excludes: state.pathNavigator[id].excludes,
            limit: state.pathNavigator[id].limit,
            sortStrategy: state.pathNavigator[id].sortStrategy,
            order: state.pathNavigator[id].order,
            ...(keyword && { keyword })
          }).pipe(
            map(({ item, children }) => pathNavigatorFetchPathComplete({ id, parent: item, children })),
            catchAjaxError(
              (error) => pathNavigatorFetchPathFailed({ id, error }),
              (error) => showErrorDialog({ error: error.response ?? error })
            )
          )
      )
    ),
  // endregion
  // region pathNavigatorConditionallySetPath
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorConditionallySetPath.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            payload: { id, path, keyword }
          },
          state
        ]) =>
          fetchItemWithChildrenByPath(state.sites.active, path, {
            excludes: state.pathNavigator[id].excludes,
            limit: state.pathNavigator[id].limit,
            sortStrategy: state.pathNavigator[id].sortStrategy,
            order: state.pathNavigator[id].order,
            ...(keyword && { keyword })
          }).pipe(
            map(({ item, children }) =>
              pathNavigatorConditionallySetPathComplete({ id, path, parent: item, children })
            ),
            catchAjaxError(
              (error) => pathNavigatorConditionallySetPathFailed({ id, error }),
              (error) => showErrorDialog({ error: error.response ?? error })
            )
          )
      )
    ),
  // endregion
  // region pathNavigatorSetCurrentPath
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorSetCurrentPath.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            payload: { id, path }
          },
          state
        ]) =>
          fetchItemWithChildrenByPath(state.sites.active, path, {
            sortStrategy: state.pathNavigator[id].sortStrategy,
            order: state.pathNavigator[id].order
          }).pipe(
            map(({ item, children }) => pathNavigatorFetchPathComplete({ id, parent: item, children })),
            catchAjaxError((error) => pathNavigatorFetchPathFailed({ error, id }))
          )
      )
    ),
  // endregion
  // region pathNavigatorSetKeyword
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorSetKeyword.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            type,
            payload: { id, keyword }
          },
          state
        ]) =>
          fetchChildrenByPath(state.sites.active, state.pathNavigator[id].currentPath, {
            keyword,
            limit: state.pathNavigator[id].limit,
            sortStrategy: state.pathNavigator[id].sortStrategy,
            order: state.pathNavigator[id].order
          }).pipe(
            map((children) =>
              pathNavigatorFetchPathComplete({
                id,
                parent: state.content.itemsByPath[state.pathNavigator[id].currentPath],
                children
              })
            ),
            catchAjaxError((error) => pathNavigatorFetchPathFailed({ error, id }))
          )
      )
    ),
  // endregion
  // region pathNavigatorChangePage
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorChangePage.type, pathNavigatorChangeLimit.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            type,
            payload: { id, offset }
          },
          state
        ]) =>
          fetchChildrenByPath(state.sites.active, state.pathNavigator[id].currentPath, {
            limit: state.pathNavigator[id].limit,
            sortStrategy: state.pathNavigator[id].sortStrategy,
            order: state.pathNavigator[id].order,
            ...(Boolean(state.pathNavigator[id].keyword) && { keyword: state.pathNavigator[id].keyword }),
            offset
          }).pipe(
            map((children) => pathNavigatorFetchPathComplete({ id, children })),
            catchAjaxError((error) => pathNavigatorFetchPathFailed({ error, id }))
          )
      )
    ),
  // endregion
  // region pathNavigatorFetchParentItems
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorFetchParentItems.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            type,
            payload: { id, path, excludes, limit, offset, keyword, sortStrategy, order }
          },
          state
        ]) => {
          const site = state.sites.active;
          const parentsPath = getIndividualPaths(path, state.pathNavigator[id].rootPath);
          if (parentsPath.length > 1) {
            return forkJoin([
              fetchItemsByPath(site, parentsPath, { castAsDetailedItem: true }),
              fetchChildrenByPath(site, path, {
                excludes,
                limit,
                offset,
                keyword,
                sortStrategy,
                order
              })
            ]).pipe(
              map(([items, children]) => pathNavigatorFetchParentItemsComplete({ id, items, children })),
              catchAjaxError((error: AjaxError) => {
                if (error.status === 404) {
                  return pathNavigatorConditionallySetPath({ id, path: getRootPath(path) });
                } else {
                  return pathNavigatorFetchPathFailed({ error, id });
                }
              })
            );
          } else {
            return fetchItemWithChildrenByPath(site, path, {
              excludes,
              limit,
              offset,
              keyword,
              sortStrategy: state.pathNavigator[id].sortStrategy,
              order: state.pathNavigator[id].order
            }).pipe(
              map(({ item, children }) => pathNavigatorFetchPathComplete({ id, parent: item, children })),
              catchAjaxError((error) => pathNavigatorFetchPathFailed({ error, id }))
            );
          }
        }
      )
    ),
  // endregion
  // region pathNavigatorFetchPathComplete, pathNavigatorConditionallySetPathComplete, pathNavigatorSetCollapsed
  (action$, state$) =>
    action$.pipe(
      ofType(
        pathNavigatorFetchPathComplete.type,
        pathNavigatorConditionallySetPathComplete.type,
        pathNavigatorSetCollapsed.type,
        pathNavigatorChangeLimit.type
      ),
      withLatestFrom(state$),
      tap(
        ([
          {
            type,
            payload: { id, parent }
          },
          state
        ]) => {
          if (type !== pathNavigatorConditionallySetPathComplete.type || parent?.childrenCount > 0) {
            const uuid = state.sites.byId[state.sites.active].uuid;
            setStoredPathNavigator(uuid, state.user.username, id, {
              currentPath: state.pathNavigator[id].currentPath,
              collapsed: state.pathNavigator[id].collapsed,
              keyword: state.pathNavigator[id].keyword,
              offset: state.pathNavigator[id].offset,
              limit: state.pathNavigator[id].limit
            });
          }
        }
      ),
      ignoreElements()
    ),
  // endregion
  // region contentEvent
  (action$, state$) =>
    action$.pipe(
      ofType(contentEvent.type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        // Cases:
        // a. Item is the current path in the navigator: refresh navigator
        // b. Item is a direct child of the current path: refresh navigator
        // b. Item is a direct child of the current path: refresh navigator
        // c. Item is a child of an item on the current path: refresh item's child count
        const {
          payload: { targetPath }
        } = action;
        const parentPathOfTargetPath = getParentPath(targetPath);
        const parentOfTargetWithIndex = withIndex(parentPathOfTargetPath);
        const idsToRefresh = [];
        Object.values(state.pathNavigator).forEach((navigator) => {
          if (
            // Case (a)
            navigator.currentPath === targetPath ||
            // Case (b)
            navigator.currentPath === parentPathOfTargetPath ||
            navigator.currentPath === parentOfTargetWithIndex
          ) {
            idsToRefresh.push(navigator.id);
          } /* else if (
            // Case (c) - Content epics load any item that's on the state already
            navigator.currentPath === getParentPath(parentPathOfTargetPath)
          ) {
            actions.push(fetchSandboxItem({ path: parentPathOfTargetPath }));
          } */
        });
        return of(pathNavigatorBulkBackgroundRefresh({ ids: idsToRefresh }));
      })
    ),
  // endregion
  // region deleteContentEvent
  (action$: Observable<StandardAction<SocketEvent>>, state$) =>
    action$.pipe(
      ofType(deleteContentEvent.type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        const actions = [];
        const {
          payload: { targetPath }
        } = action;
        Object.values(state.pathNavigator).forEach((navigator) => {
          if (!navigator.isRootPathMissing && navigator.currentPath.startsWith(targetPath)) {
            actions.push(pathNavigatorSetCurrentPath({ id: navigator.id, path: navigator.rootPath }));
          }
        });
        return actions;
      })
    ),
  // endregion
  // region moveContentEvent
  (action$: Observable<StandardAction<MoveContentEventPayload>>, state$) =>
    action$.pipe(
      ofType(moveContentEvent.type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        const actions = [];
        const {
          payload: { targetPath, sourcePath }
        } = action;
        const parentOfTargetPath = getParentPath(targetPath);
        const parentOfSourcePath = getParentPath(sourcePath);
        const idsToRefresh = [];
        const idsToBgRefresh = [];
        Object.values(state.pathNavigator).forEach((navigator) => {
          if (navigator.isRootPathMissing && targetPath === navigator.rootPath) {
            idsToRefresh.push(navigator.id);
          } else if (!navigator.isRootPathMissing && navigator.currentPath.startsWith(sourcePath)) {
            actions.push(pathNavigatorSetCurrentPath({ id: navigator.id, path: navigator.rootPath }));
          } else if (
            withoutIndex(navigator.currentPath) === parentOfTargetPath ||
            withoutIndex(navigator.currentPath) === parentOfSourcePath
          ) {
            idsToBgRefresh.push(navigator.id);
          }
        });
        actions.push(pathNavigatorBulkRefresh({ ids: idsToRefresh }));
        actions.push(pathNavigatorBulkBackgroundRefresh({ ids: idsToBgRefresh }));
        return actions;
      })
    ),
  // endregion
  // region pluginInstalled
  (action$, state$) =>
    action$.pipe(
      ofType(pluginInstalled.type),
      throttleTime(500),
      withLatestFrom(state$),
      mergeMap(([, state]) => {
        const ids = [];
        Object.values(state.pathNavigator).forEach((tree) => {
          if (['/templates', '/scripts', '/static-assets'].includes(getRootPath(tree.rootPath))) {
            ids.push(tree.id);
          }
        });
        return of(pathNavigatorBulkBackgroundRefresh({ ids }));
      })
    ),
  // endregion
  // region publishEvent, workflowEvent
  (action$, state$) =>
    action$.pipe(
      ofType(publishEvent.type, workflowEvent.type),
      throttleTime(500),
      withLatestFrom(state$),
      mergeMap(([, state]) => {
        return of(pathNavigatorBulkBackgroundRefresh({ ids: Object.keys(state.pathNavigator) }));
      })
    )
  // endregion
] as CrafterCMSEpic[];
