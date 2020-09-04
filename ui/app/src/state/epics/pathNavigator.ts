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

import { Epic, ofType, StateObservable } from 'redux-observable';
import { ignoreElements, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import {
  pathNavigatorFetchParentItems,
  pathNavigatorFetchParentItemsComplete,
  pathNavigatorFetchPathComplete,
  pathNavigatorFetchPathFailed,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath
} from '../reducers/pathNavigator';
import { getChildrenByPath } from '../../services/content';
import GlobalState from '../../models/GlobalState';
import { getParentsFromPath, withIndex } from '../../utils/path';
import { forkJoin, Observable } from 'rxjs';
import { GetChildrenResponse } from '../../models/GetChildrenResponse';

export default [
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(pathNavigatorSetCurrentPath.type),
      withLatestFrom(state$),
      mergeMap(([{ type, payload: { id, path } }, state]) => getChildrenByPath(state.sites.active, path).pipe(
        map((response) => pathNavigatorFetchPathComplete({ id, response })),
        catchAjaxError(pathNavigatorFetchPathFailed)
      ))
    ),
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(pathNavigatorFetchParentItems.type),
      withLatestFrom(state$),
      mergeMap(([{ type, payload: { id, path } }, state]) => {
          const site = state.sites.active;
          const parentsPath = [...getParentsFromPath(path, state.pathNavigator[id].rootPath), path];
          const requests: Observable<GetChildrenResponse>[] = [];
          if (parentsPath.length) {
            parentsPath.forEach(parentPath => {
              if (!state.pathNavigator[id].items[parentPath] && !state.pathNavigator[id].items[withIndex(parentPath)]) {
                requests.push(getChildrenByPath(site, parentPath));
              }
            });
            return forkJoin(requests).pipe(
              map((response) => pathNavigatorFetchParentItemsComplete({ id, response })),
              catchAjaxError(pathNavigatorFetchPathFailed)
            );
          } else {
            return getChildrenByPath(site, path).pipe(
              map((response) => pathNavigatorFetchPathComplete({ id, response })),
              catchAjaxError(pathNavigatorFetchPathFailed)
            );
          }
        }
      )
    ),
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(pathNavigatorSetCurrentPath.type, pathNavigatorSetCollapsed.type),
      withLatestFrom(state$),
      tap(([{ type, payload: { id } }, state]) => {
          localStorage.setItem(`craftercms.pathNavigator.${id}`, JSON.stringify({
            currentPath: state.pathNavigator[id].currentPath,
            collapsed: state.pathNavigator[id].collapsed
          }));
        }
      ),
      ignoreElements()
    )
] as Epic[];
