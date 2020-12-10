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
  LOG_IN,
  LOG_OUT,
  loginComplete,
  loginFailed,
  logoutComplete,
  logoutFailed,
  refreshAuthToken,
  refreshAuthTokenComplete,
  refreshAuthTokenFailed,
  VALIDATE_SESSION,
  validateSessionComplete,
  validateSessionFailed
} from '../actions/auth';
import { map, switchMap, tap } from 'rxjs/operators';
import * as auth from '../../services/auth';
import { refreshSession } from '../../services/auth';
import { catchAjaxError } from '../../utils/ajax';
import { setJwt, setRequestForgeryToken } from '../../utils/auth';
import { CrafterCMSEpic } from '../store';

const epics: CrafterCMSEpic[] = [
  (action$) =>
    action$.pipe(
      ofType(LOG_IN),
      switchMap((action) => auth.login(action.payload).pipe(map(loginComplete), catchAjaxError(loginFailed)))
    ),
  (action$) =>
    action$.pipe(
      ofType(LOG_OUT),
      switchMap(() => auth.logout().pipe(map(logoutComplete), catchAjaxError(logoutFailed)))
    ),
  (action$) =>
    action$.pipe(
      ofType(VALIDATE_SESSION),
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
    )
];

export default epics;
