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

import { Epic, ofType } from 'redux-observable';
import { ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { setSiteCookie } from '../../utils/auth';
import { fetchSites } from '../../services/sites';
import { catchAjaxError } from '../../utils/ajax';
import { changeSite, fetchSites as fetchSitesAction, fetchSitesComplete, fetchSitesFailed } from '../reducers/sites';

export default [
  // region Change site
  (action$, state$) =>
    action$.pipe(
      ofType(changeSite.type),
      withLatestFrom(state$),
      tap(([{ payload: { nextSite } }, { env: { SITE_COOKIE } }]) =>
        setSiteCookie(SITE_COOKIE, nextSite)
      ),
      ignoreElements()
    ),
  // endregion
  // region Fetch sites
  (action$) =>
    action$.pipe(
      ofType(fetchSitesAction.type),
      switchMap(() => fetchSites().pipe(map(fetchSitesComplete), catchAjaxError(fetchSitesFailed)))
    )
  // endregion
] as Epic[];
