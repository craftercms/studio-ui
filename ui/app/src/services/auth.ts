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

import { CONTENT_TYPE_JSON, get, post } from '../utils/ajax';
import { catchError, map, pluck } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Credentials, User } from '../models/User';
import { AjaxError } from 'rxjs/ajax';

export function getLogoutInfoURL(): Observable<{ logoutUrl: string }> {
  return get('/studio/api/2/users/me/logout/sso/url').pipe(pluck('response'));
}

export function logout() {
  return post('/studio/api/1/services/api/1/security/logout.json', {}, CONTENT_TYPE_JSON);
}

export function login(credentials: Credentials): Observable<User> {
  return post(
    '/studio/api/1/services/api/1/security/login.json',
    credentials,
    CONTENT_TYPE_JSON
  ).pipe(pluck('response'));
}

export function validateSession(): Observable<boolean> {
  return get('/studio/api/1/services/api/1/security/validate-session.json').pipe(
    map(({ response }) => response.message === 'OK'),
    catchError((error: AjaxError) => {
      if (error.status === 401) {
        return of(false);
      } else {
        throw error;
      }
    })
  );
}

export default {
  getLogoutInfoURL,
  logout,
  login,
  validateSession
}
