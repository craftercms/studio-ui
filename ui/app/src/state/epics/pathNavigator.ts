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

import { ofType } from 'redux-observable';
import { ignoreElements, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import { fetchChildrenByPath, fetchItemsByPath, fetchItemWithChildrenByPath } from '../../services/content';
import { getIndividualPaths, getRootPath } from '../../utils/path';
import { forkJoin } from 'rxjs';
import {
  pathNavigatorBackgroundRefresh,
  pathNavigatorChangePage,
  pathNavigatorConditionallySetPath,
  pathNavigatorConditionallySetPathComplete,
  pathNavigatorConditionallySetPathFailed,
  pathNavigatorFetchParentItems,
  pathNavigatorFetchParentItemsComplete,
  pathNavigatorFetchPathComplete,
  pathNavigatorFetchPathFailed,
  pathNavigatorInit,
  pathNavigatorRefresh,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath,
  pathNavigatorSetKeyword
} from '../actions/pathNavigator';
import { setStoredPathNavigator } from '../../utils/state';
import { CrafterCMSEpic } from '../store';
import { showErrorDialog } from '../reducers/dialogs/error';
import { AjaxError } from 'rxjs/ajax';

export default [
  // region pathNavigatorInit
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorInit.type),
      withLatestFrom(state$),
      map(
        ([
          {
            payload: { id, excludes }
          },
          state
        ]) =>
          pathNavigatorFetchParentItems({
            id,
            path: state.pathNavigator[id].currentPath,
            offset: state.pathNavigator[id].offset,
            keyword: state.pathNavigator[id].keyword,
            excludes,
            limit: state.pathNavigator[id].limit
          })
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
            excludes: state.pathNavigator[id].excludes
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
  // region pathNavigatorConditionallySetPath
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorConditionallySetPath.type),
      withLatestFrom(state$),
      mergeMap(
        ([
          {
            type,
            payload: { id, path }
          },
          state
        ]) =>
          fetchItemWithChildrenByPath(state.sites.active, path, { excludes: state.pathNavigator[id].excludes }).pipe(
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
          fetchItemWithChildrenByPath(state.sites.active, path).pipe(
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
            limit: state.pathNavigator[id].limit
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
      ofType(pathNavigatorChangePage.type),
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
            payload: { id, path, excludes, limit, offset, keyword }
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
                keyword
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
            return fetchItemWithChildrenByPath(site, path, { excludes, limit, offset, keyword }).pipe(
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
        pathNavigatorSetCollapsed.type
      ),
      withLatestFrom(state$),
      tap(
        ([
          {
            type,
            payload: { id, children, parent }
          },
          state
        ]) => {
          if (parent?.childrenCount > 0 || type === pathNavigatorSetCollapsed.type) {
            const uuid = state.sites.byId[state.sites.active].uuid;
            setStoredPathNavigator(uuid, state.user.username, id, {
              currentPath: state.pathNavigator[id].currentPath,
              collapsed: state.pathNavigator[id].collapsed,
              keyword: state.pathNavigator[id].keyword,
              offset: state.pathNavigator[id].offset
            });
          }
        }
      ),
      ignoreElements()
    )
  // endregion
] as CrafterCMSEpic[];
