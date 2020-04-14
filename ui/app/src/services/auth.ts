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

import { CONTENT_TYPE_JSON, get, post } from '../utils/ajax';
import { catchError, map, mapTo, pluck } from 'rxjs/operators';
import { Observable, OperatorFunction } from 'rxjs';
import { Credentials, LegacyUser, User } from '../models/User';
import { AjaxError } from 'rxjs/ajax';
import { APIError } from '../models/GlobalState';

const mapToUser: OperatorFunction<LegacyUser, User> = map<LegacyUser, User>((user) => ({
  ...user,
  authType: user.authenticationType
}));

export function getLogoutInfoURL(): Observable<{ logoutUrl: string }> {
  return get('/studio/api/2/users/me/logout/sso/url').pipe(pluck('response'));
}

export function logout(): Observable<boolean> {
  return post('/studio/api/1/services/api/1/security/logout.json', {}, CONTENT_TYPE_JSON).pipe(
    mapTo(true)
  );
}

export function login(credentials: Credentials): Observable<User> {
  return post(
    '/studio/api/1/services/api/1/security/login.json',
    credentials,
    CONTENT_TYPE_JSON
  ).pipe(
    pluck('response'),
    mapToUser
  );
}

export function validateSession(): Observable<boolean> {
  return get('/studio/api/1/services/api/1/security/validate-session.json').pipe(
    pluck('response', 'active')
  );
}

export function me(): Observable<User> {
  return get('/studio/api/2/users/me.json').pipe(
    pluck('response', 'authenticatedUser'),
    mapToUser
  );
}

export function sendPasswordRecovery(username: string): Observable<APIError> {
  return get(`/studio/api/2/users/forgot_password?username=${username}`).pipe(
    pluck('response', 'response'),
    catchError((error: AjaxError) => {
      // eslint-disable-next-line no-throw-literal
      throw error.response?.response ?? error;
    })
  );
}

export default {
  getLogoutInfoURL,
  logout,
  login,
  validateSession,
  sendPasswordRecovery,
  me
};
