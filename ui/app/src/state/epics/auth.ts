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
import {
  login,
  loginComplete,
  loginFailed,
  logout,
  refreshAuthToken,
  refreshAuthTokenComplete,
  refreshAuthTokenFailed,
  validateSession,
  validateSessionComplete,
  validateSessionFailed
} from '../actions/auth';
import { ignoreElements, map, mapTo, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import * as auth from '../../services/auth';
import { refreshSession } from '../../services/auth';
import { catchAjaxError } from '../../utils/ajax';
import { setJwt, setRequestForgeryToken } from '../../utils/auth';
import { CrafterCMSEpic } from '../store';
import { interval } from 'rxjs';
import { storeInitialized } from '../actions/system';

const epics: CrafterCMSEpic[] = [
  (action$) =>
    action$.pipe(
      ofType(login.type),
      switchMap((action) => auth.login(action.payload).pipe(map(loginComplete), catchAjaxError(loginFailed)))
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(logout.type),
      withLatestFrom(state$),
      tap(([, state]) => (window.location.href = `${state.env.authoringBase}/logout`)),
      ignoreElements()
    ),
  (action$) =>
    action$.pipe(
      ofType(validateSession.type),
      switchMap(() =>
        auth.validateSession().pipe(
          tap((isValid) => !isValid && setRequestForgeryToken()),
          map(validateSessionComplete),
          catchAjaxError(validateSessionFailed)
        )
      )
    ),
  (action$) =>
    action$.pipe(
      ofType(refreshAuthToken.type),
      switchMap(() =>
        refreshSession().pipe(
          tap(({ token }) => setJwt(token)),
          map(refreshAuthTokenComplete),
          catchAjaxError(refreshAuthTokenFailed)
        )
      )
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(refreshAuthTokenComplete.type, storeInitialized.type),
      withLatestFrom(state$),
      switchMap(([, state]) =>
        interval(Math.floor((state.auth.expiresAt - Date.now()) * 0.8)).pipe(mapTo(refreshAuthToken()), take(1))
      )
    ),
  (action$) => action$.pipe(ofType(loginComplete.type), mapTo(refreshAuthToken()))
];

export default epics;
