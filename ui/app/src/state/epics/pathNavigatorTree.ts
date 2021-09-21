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
import { filter, ignoreElements, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
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
  pathNavigatorTreeFetchPathsChildren,
  pathNavigatorTreeFetchPathsChildrenComplete,
  pathNavigatorTreeFetchPathsChildrenFailed,
  pathNavigatorTreeInit,
  pathNavigatorTreeRefresh,
  pathNavigatorTreeRestoreComplete,
  pathNavigatorTreeRestoreFailed,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleExpanded
} from '../actions/pathNavigatorTree';
import { fetchChildrenByPath, fetchChildrenByPaths, fetchItemsByPath } from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import { setStoredPathNavigatorTree } from '../../utils/state';
import { forkJoin } from 'rxjs';
import { createPresenceTable } from '../../utils/array';
import { getIndividualPaths, withoutIndex } from '../../utils/path';

export default [
  // region pathNavigatorTreeInit
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeInit.type, pathNavigatorTreeRefresh.type, pathNavigatorTreeBackgroundRefresh.type),
      withLatestFrom(state$),
      filter(([{ payload }, state]) => Boolean(state.pathNavigatorTree[payload.id].expanded?.length)),
      mergeMap(([{ payload }, state]) => {
        const {
          id,
          path = state.pathNavigatorTree[id].rootPath,
          expanded = state.pathNavigatorTree[id].expanded,
          collapsed = state.pathNavigatorTree[id].collapsed,
          keywordByPath = state.pathNavigatorTree[id].keywordByPath,
          limit = state.pathNavigatorTree[id].limit,
          excludes = state.pathNavigatorTree[id].excludes
        } = payload;
        let paths = [];
        expanded.forEach((expandedPath) => {
          getIndividualPaths(expandedPath, withoutIndex(path)).forEach((parentPath) => {
            if (!paths.includes(parentPath)) {
              paths.push(parentPath);
            }
          });
        });
        return forkJoin([
          fetchItemsByPath(state.sites.active, paths, { castAsDetailedItem: true }),
          fetchChildrenByPaths(
            state.sites.active,
            createPresenceTable(expanded, (value) => {
              if (keywordByPath[value]) {
                return { keyword: keywordByPath[value] };
              }
              return {};
            }),
            { limit, excludes }
          )
        ]).pipe(
          map(([items, data]) => pathNavigatorTreeRestoreComplete({ id, expanded, collapsed, items, data })),
          catchAjaxError((error) => pathNavigatorTreeRestoreFailed({ error, id }))
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
        return fetchChildrenByPath(state.sites.active, path, {
          limit: state.pathNavigatorTree[id].limit,
          ...options,
          excludes: state.pathNavigatorTree[id].excludes
        }).pipe(
          map((children) => pathNavigatorTreeFetchPathChildrenComplete({ id, parentPath: path, children, options })),
          catchAjaxError((error) => pathNavigatorTreeFetchPathChildrenFailed({ error, id }))
        );
      })
    ),
  // endregion
  // region pathNavigatorFetchPathsChildren
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeFetchPathsChildren.type),
      withLatestFrom(state$),
      mergeMap(([{ payload }, state]) => {
        const { id, paths, options } = payload;
        return fetchChildrenByPaths(state.sites.active, paths, {
          ...options
        }).pipe(
          map((data) => pathNavigatorTreeFetchPathsChildrenComplete({ id, data, options })),
          catchAjaxError((error) => pathNavigatorTreeFetchPathsChildrenFailed({ error, id }))
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
        return fetchChildrenByPath(state.sites.active, path, {
          limit: state.pathNavigatorTree[id].limit,
          keyword
        }).pipe(
          map((children) =>
            pathNavigatorTreeFetchPathChildrenComplete({ id, parentPath: path, children, options: { keyword } })
          ),
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
        const keyword = state.pathNavigatorTree[id].keywordByPath[path];
        const offset = state.pathNavigatorTree[id].offsetByPath[path];
        return fetchChildrenByPath(state.sites.active, path, {
          limit: state.pathNavigatorTree[id].limit,
          keyword: keyword,
          offset: offset
        }).pipe(
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
  // region pathNavigatorTreeLocalStore
  (action$, state$) =>
    action$.pipe(
      ofType(
        pathNavigatorTreeCollapsePath.type,
        pathNavigatorTreeExpandPath.type,
        pathNavigatorTreeFetchPathChildrenComplete.type,
        pathNavigatorTreeFetchPathPageComplete.type,
        pathNavigatorTreeToggleExpanded.type
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
    )
  // endregion
] as CrafterCMSEpic[];
