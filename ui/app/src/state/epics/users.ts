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
import { storeInitialized } from '../actions/system';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { deleteProperties, fetchGlobalProperties, fetchSiteProperties } from '../../services/users';
import { NEVER } from 'rxjs';
import {
  deleteProperties as deletePropertiesAction,
  deletePropertiesComplete,
  fetchGlobalProperties as fetchGlobalPropertiesAction,
  fetchGlobalPropertiesComplete,
  fetchSiteProperties as fetchSitePropertiesAction,
  fetchSitePropertiesComplete
} from '../actions/user';
import { CrafterCMSEpic } from '../store';

export default [
  (action$) =>
    action$.pipe(
      ofType(storeInitialized.type),
      map(() => fetchSitePropertiesAction())
    ),
  (action$) =>
    action$.pipe(
      ofType(fetchGlobalPropertiesAction.type),
      switchMap(() => fetchGlobalProperties().pipe(map(fetchGlobalPropertiesComplete)))
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(fetchSitePropertiesAction.type),
      withLatestFrom(state$),
      switchMap(([, state]) =>
        state.sites.active ? fetchSiteProperties(state.sites.active).pipe(map(fetchSitePropertiesComplete)) : NEVER
      )
    ),
  (action$) =>
    action$.pipe(
      ofType(deletePropertiesAction.type),
      switchMap((action) =>
        deleteProperties(action.payload.properties, action.payload.siteId).pipe(map(deletePropertiesComplete))
      )
    )
] as CrafterCMSEpic[];
