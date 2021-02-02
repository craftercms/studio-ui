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
  sharedWorkerTimeout,
  sharedWorkerToken,
  sharedWorkerUnauthenticated
} from '../actions/auth';
import { catchError, ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as auth from '../../services/auth';
import { catchAjaxError } from '../../utils/ajax';
import { getRequestForgeryToken, setJwt, setRequestForgeryToken } from '../../utils/auth';
import { CrafterCMSEpic } from '../store';
import { messageSharedWorker, storeInitialized } from '../actions/system';
import { sessionTimeout } from '../actions/user';
import Cookies from 'js-cookie';
import { fetchAuthenticationType } from '../../services/auth';

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
        Cookies.set('userSession', null);
        const tokenField = document.createElement('input');
        tokenField.type = 'hidden';
        tokenField.name = state.env.xsrfArgument;
        tokenField.value = getRequestForgeryToken();
        const form = document.createElement('form');
        form.method = 'post';
        form.action = state.env.logoutUrl;
        form.appendChild(tokenField);
        document.body.appendChild(form);
        // The timeout purpose is to avoid immediate submission stopping
        // the logout message from getting to the Service Worker
        setTimeout(() => form.submit());
      }),
      map(() => messageSharedWorker(logout()))
    ),
  (action$) =>
    action$.pipe(
      ofType(sessionTimeout.type),
      tap(() => setRequestForgeryToken()),
      map(() => messageSharedWorker(sharedWorkerTimeout()))
    ),
  (action$) =>
    action$.pipe(
      ofType(sharedWorkerToken.type),
      map(({ payload }) => refreshAuthTokenComplete(payload))
    ),
  (action$) =>
    action$.pipe(
      ofType(sharedWorkerUnauthenticated.type),
      // This call will fail. We need the new set of auth cookies to be set
      // on this window so that if login attempted from the re-login dialog,
      // it won't fail due to outdated XSRF/auth cookies.
      switchMap(() => fetchAuthenticationType().pipe(catchError(() => []))),
      tap(() => setRequestForgeryToken()),
      ignoreElements()
    ),
  (action$) =>
    action$.pipe(
      ofType(refreshAuthTokenComplete.type, storeInitialized.type),
      // Note refreshAuthTokenComplete & storeInitialized payload signatures are different.
      tap(({ payload }) => {
        const auth = payload.auth ?? payload;
        const token = auth.token;
        setJwt(token);
      }),
      ignoreElements()
    ),
  (action$) =>
    action$.pipe(
      ofType(loginComplete.type),
      map(() => messageSharedWorker(refreshAuthToken()))
    )
];

export default epics;
