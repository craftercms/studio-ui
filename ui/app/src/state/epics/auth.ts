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
import { delay, ignoreElements, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import * as auth from '../../services/auth';
import { catchAjaxError } from '../../utils/ajax';
import { getRequestForgeryToken, setJwt, setRequestForgeryToken } from '../../utils/auth';
import { CrafterCMSEpic } from '../store';
import { messageSharedWorker } from '../actions/system';
import { sessionTimeout } from '../actions/user';
import { interval } from 'rxjs';

const epics: CrafterCMSEpic[] = [
  // region login
  (action$) =>
    action$.pipe(
      ofType(login.type),
      switchMap((action) => auth.login(action.payload).pipe(map(loginComplete), catchAjaxError(loginFailed)))
    ),
  // endregion
  // region loginComplete
  (action$) =>
    action$.pipe(
      ofType(loginComplete.type),
      map(() => messageSharedWorker(refreshAuthToken()))
    ),
  // endregion
  // region logout
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
        form.action = state.env.logoutUrl;
        form.appendChild(tokenField);
        document.body.appendChild(form);
        // The timeout purpose is to avoid immediate submission stopping
        // the logout message from getting to the Service Worker
        setTimeout(() => form.submit());
      }),
      map(() => messageSharedWorker(logout()))
    ),
  // endregion
  // region sessionTimeout
  (action$) =>
    action$.pipe(
      ofType(sessionTimeout.type),
      tap(() => setRequestForgeryToken()),
      map(() => messageSharedWorker(sharedWorkerTimeout()))
    ),
  // endregion
  // region sharedWorkerToken
  (action$) =>
    action$.pipe(
      ofType(sharedWorkerToken.type),
      map(({ payload }) => refreshAuthTokenComplete(payload))
    ),
  // endregion
  // region sharedWorkerUnauthenticated
  (action$) =>
    action$.pipe(
      ofType(sharedWorkerUnauthenticated.type),
      switchMap(() =>
        // We need the new set of auth cookies to be set
        // on this window so that if login attempted from the re-login dialog,
        // it won't fail due to outdated XSRF/auth cookies.
        interval(1000).pipe(
          delay(100),
          switchMap(() => auth.fetchAuthenticationType().pipe(tap(() => setRequestForgeryToken()))),
          take(1)
        )
      ),
      ignoreElements()
    ),
  // endregion
  // region refreshAuthTokenComplete
  (action$) =>
    action$.pipe(
      ofType(refreshAuthTokenComplete.type),
      tap(({ payload }) => setJwt(payload.token)),
      ignoreElements()
    )
  // endregion
];

export default epics;
