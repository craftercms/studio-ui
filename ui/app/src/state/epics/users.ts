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
import { deletePreferences, fetchGlobalPreferences, fetchSitePreferences } from '../../services/users';
import { NEVER } from 'rxjs';
import {
  deletePreferences as deletePreferencesAction,
  deletePreferencesComplete,
  fetchGlobalPreferences as fetchGlobalPreferencesAction,
  fetchGlobalPreferencesComplete,
  fetchSitePreferences as fetchSitePreferencesAction,
  fetchSitePreferencesComplete
} from '../actions/user';
import { CrafterCMSEpic } from '../store';

export default [
  (action$) =>
    action$.pipe(
      ofType(storeInitialized.type),
      switchMap(() => [fetchGlobalPreferencesAction(), fetchSitePreferencesAction()])
    ),
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(fetchGlobalPreferencesAction.type),
      switchMap(() => fetchGlobalPreferences().pipe(map(fetchGlobalPreferencesComplete)))
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(fetchSitePreferencesAction.type),
      withLatestFrom(state$),
      switchMap(([, state]) =>
        state.sites.active ? fetchSitePreferences(state.sites.active).pipe(map(fetchSitePreferencesComplete)) : NEVER
      )
    ),
  (action$) =>
    action$.pipe(
      ofType(deletePreferencesAction.type),
      switchMap((action) =>
        deletePreferences(action.payload.properties, action.payload.siteId).pipe(map(deletePreferencesComplete))
      )
    )
] as CrafterCMSEpic[];
