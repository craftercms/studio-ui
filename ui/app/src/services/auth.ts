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

import { CONTENT_TYPE_JSON, get, post, postJSON } from '../utils/ajax';
import { catchError, map, mapTo, pluck } from 'rxjs/operators';
import { Observable, of, OperatorFunction } from 'rxjs';
import { Credentials, LegacyUser, User } from '../models/User';
import { AjaxError } from 'rxjs/ajax';

const mapToUser: OperatorFunction<LegacyUser, User> = map<LegacyUser, User>((user) => ({
  ...user,
  authType: user.authenticationType
}));

export function getLogoutInfoURL(): Observable<{ logoutUrl: string }> {
  return get('/studio/api/2/users/me/logout/sso/url').pipe(pluck('response'));
}

export function logout(): Observable<boolean> {
  return post('/studio/api/1/services/api/1/security/logout.json', {}, CONTENT_TYPE_JSON).pipe(mapTo(true));
}

export function login(credentials: Credentials): Observable<User> {
  return post('/studio/api/1/services/api/1/security/login.json', credentials, CONTENT_TYPE_JSON).pipe(
    pluck('response'),
    mapToUser
  );
}

export function validateSession(): Observable<boolean> {
  return get('/studio/api/1/services/api/1/security/validate-session.json').pipe(
    map(({ response }) => response.active)
  );
}

export function me(): Observable<User> {
  return get('/studio/api/2/users/me.json').pipe(pluck('response', 'authenticatedUser'), mapToUser);
}

interface ApiResponse {
  code: number;
  message: string;
  remedialAction: string;
  documentationUrl: string;
}

export function sendPasswordRecovery(username: string): Observable<ApiResponse> {
  return get(`/studio/api/2/users/forgot_password?username=${username}`).pipe(
    pluck('response', 'response'),
    catchError((error: AjaxError) => {
      // eslint-disable-next-line no-throw-literal
      throw error.response?.response ?? error;
    })
  );
}

export function setPassword(token: string, password: string, confirmation: string = password): Observable<User> {
  return password !== confirmation
    ? of('Password and confirmation mismatch').pipe(
        map((msg) => {
          throw new Error(msg);
        })
      )
    : postJSON(`/studio/api/2/users/set_password`, {
        token,
        new: password
      }).pipe(
        map(({ response }) => {
          if (response.user == null) {
            throw new Error('Expired or incorrect token');
          }
          return response.user;
        })
      );
}

export function validatePasswordResetToken(token: string): Observable<boolean> {
  return get(`/studio/api/2/users/validate_token?token=${token}`).pipe(
    mapTo(true),
    catchError((error) => {
      if (error.status === 401) return of(false);
      else throw new Error(error.response);
    })
  );
}
