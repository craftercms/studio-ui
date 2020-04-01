/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import { CHANGE_SITE } from '../actions/sites';
import { ignoreElements, tap, withLatestFrom } from 'rxjs/operators';
import { setSiteCookie } from '../../utils/auth';

const changeSite: Epic = (action$, state$) => action$.pipe(
  ofType(CHANGE_SITE),
  withLatestFrom(state$),
  tap(
    (
      [
        { payload: { nextSite } },
        { env: { SITE_COOKIE } }
      ]
    ) => (
      setSiteCookie(SITE_COOKIE, nextSite)
    )
  ),
  ignoreElements()
);

export default [
  changeSite
] as Epic[];
