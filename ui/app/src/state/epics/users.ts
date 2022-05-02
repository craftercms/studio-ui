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
import { storeInitialized } from '../actions/system';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  deleteProperties,
  fetchGlobalProperties,
  fetchMyRolesInSite as fetchMyRolesInSiteService,
  fetchSiteProperties,
  fetchMyPermissions
} from '../../services/users';
import {
  deleteProperties as deletePropertiesAction,
  deletePropertiesComplete,
  deletePropertiesFailed,
  fetchGlobalProperties as fetchGlobalPropertiesAction,
  fetchGlobalPropertiesComplete,
  fetchGlobalPropertiesFailed,
  fetchMyPermissionsInSite,
  fetchMyPermissionsInSiteComplete,
  fetchMyPermissionsInSiteFailed,
  fetchMyRolesInSite,
  fetchMyRolesInSiteComplete,
  fetchMyRolesInSiteFailed,
  fetchSiteProperties as fetchSitePropertiesAction,
  fetchSitePropertiesComplete,
  fetchSitePropertiesFailed
} from '../actions/user';
import { CrafterCMSEpic } from '../store';
import { changeSite } from '../actions/sites';
import { catchAjaxError } from '../../utils/ajax';

export default [
  // region storeInitialized
  (action$) =>
    action$.pipe(
      ofType(storeInitialized.type),
      switchMap(() => [fetchSitePropertiesAction(), fetchMyRolesInSite(), fetchMyPermissionsInSite()])
    ),
  // endregion
  // region changeSite
  (action$) =>
    action$.pipe(
      ofType(changeSite.type),
      switchMap(() => [fetchMyRolesInSite(), fetchMyPermissionsInSite()])
    ),
  // endregion
  // region fetchMyPermissionsInSite
  (action$, state$) =>
    action$.pipe(
      ofType(fetchMyPermissionsInSite.type),
      withLatestFrom(state$),
      filter(([, state]) => Boolean(state.sites.active)),
      switchMap(([, state]) =>
        fetchMyPermissions(state.sites.active).pipe(
          map((permissions) => fetchMyPermissionsInSiteComplete({ site: state.sites.active, permissions })),
          catchAjaxError(fetchMyPermissionsInSiteFailed)
        )
      )
    ),
  // endregion
  // region changeSite
  (action$, state$) =>
    action$.pipe(
      ofType(fetchMyRolesInSite.type),
      withLatestFrom(state$),
      filter(([, state]) => Boolean(state.sites.active) && state.user.rolesBySite[state.sites.active] === void 0),
      switchMap(([, state]) =>
        fetchMyRolesInSiteService(state.sites.active).pipe(
          map((roles) => fetchMyRolesInSiteComplete({ site: state.sites.active, roles })),
          catchAjaxError(fetchMyRolesInSiteFailed)
        )
      )
    ),
  // endregion
  // region fetchGlobalPropertiesAction
  (action$) =>
    action$.pipe(
      ofType(fetchGlobalPropertiesAction.type),
      switchMap(() =>
        fetchGlobalProperties().pipe(map(fetchGlobalPropertiesComplete), catchAjaxError(fetchGlobalPropertiesFailed))
      )
    ),
  // endregion
  // region fetchSitePropertiesAction
  (action$, state$) =>
    action$.pipe(
      ofType(fetchSitePropertiesAction.type),
      withLatestFrom(state$),
      filter(([, state]) => Boolean(state.sites.active)),
      switchMap(([, state]) =>
        fetchSiteProperties(state.sites.active).pipe(
          map(fetchSitePropertiesComplete),
          catchAjaxError(fetchSitePropertiesFailed)
        )
      )
    ),
  // endregion
  // region deletePropertiesAction
  (action$) =>
    action$.pipe(
      ofType(deletePropertiesAction.type),
      switchMap((action) =>
        deleteProperties(action.payload.properties, action.payload.siteId).pipe(
          map(deletePropertiesComplete),
          catchAjaxError(deletePropertiesFailed)
        )
      )
    )
  // endregion
] as CrafterCMSEpic[];
