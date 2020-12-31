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
  authTokenRefreshedFromAnotherTab,
  login,
  loginComplete,
  loginFailed,
  logout,
  refreshAuthToken,
  refreshAuthTokenComplete,
  refreshAuthTokenFailed
} from '../actions/auth';
import { ignoreElements, map, mapTo, pluck, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import * as auth from '../../services/auth';
import { refreshSession } from '../../services/auth';
import { catchAjaxError } from '../../utils/ajax';
import { getRequestForgeryToken, setJwt, setRequestForgeryToken } from '../../utils/auth';
import { CrafterCMSEpic } from '../store';
import { interval } from 'rxjs';
import { storeInitialized } from '../actions/system';
import { sessionTimeout } from '../actions/user';
import { getHostToHostBus } from '../../modules/Preview/previewContext';

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
      // Spring requires regular post for logout....
      // tap(([, state]) => (window.location.href = `${state.env.authoringBase}/logout`)),
      tap(([, state]) => {
        const tokenField = document.createElement('input');
        tokenField.type = 'hidden';
        tokenField.name = state.env.xsrfArgument;
        tokenField.value = getRequestForgeryToken();
        const form = document.createElement('form');
        form.method = 'post';
        form.action = `${state.env.authoringBase}/logout`;
        form.appendChild(tokenField);
        document.body.appendChild(form);
        form.submit();
      }),
      ignoreElements()
    ),
  (action$) =>
    action$.pipe(
      ofType(sessionTimeout.type),
      tap(() => setRequestForgeryToken()),
      ignoreElements()
    ),
  (action$) =>
    action$.pipe(
      ofType(refreshAuthToken.type),
      switchMap(() => refreshSession().pipe(map(refreshAuthTokenComplete), catchAjaxError(refreshAuthTokenFailed)))
    ),
  (action$, state$, { systemBroadcastChannel }) =>
    action$.pipe(
      ofType(refreshAuthTokenComplete.type, storeInitialized.type),
      // Note refreshAuthTokenComplete & storeInitialized payload signatures are different.
      tap(({ payload }) => {
        const auth = payload.auth ?? payload;
        const token = auth.token;
        const action = authTokenRefreshedFromAnotherTab(auth);
        setJwt(token);
        // For other tabs...
        systemBroadcastChannel?.postMessage(action);
        // For other frames on this tab....
        getHostToHostBus().next(action);
      }),
      ignoreElements()
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(refreshAuthTokenComplete.type, storeInitialized.type, authTokenRefreshedFromAnotherTab.type),
      withLatestFrom(state$),
      switchMap(([, state]) =>
        interval(Math.floor((state.auth.expiresAt - Date.now()) * 0.8)).pipe(mapTo(refreshAuthToken()), take(1))
      )
    ),
  (action$) => action$.pipe(ofType(loginComplete.type), pluck('payload', 'auth'), map(refreshAuthTokenComplete))
];

export default epics;
