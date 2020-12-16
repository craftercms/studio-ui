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

import { get, getGlobalHeaders, postJSON } from '../utils/ajax';
import { catchError, map, mapTo, pluck, switchMap } from 'rxjs/operators';
import { Observable, of, from } from 'rxjs';
import { User } from '../models/User';
import { AjaxError } from 'rxjs/ajax';
import { Credentials } from '../models/Credentials';
import { ApiResponse } from '../models/ApiResponse';
import { me } from './users';
import { getJwtHeaders } from '../utils/auth';

export function getSSOLogoutURL(): Observable<{ logoutUrl: string }> {
  return get('/studio/api/2/users/me/logout/sso/url').pipe(pluck('response'));
}

export function login(credentials: Credentials): Observable<{ user: User; auth: RefreshSessionResponse }> {
  // Regular post works fine, but fetch provides the redirect: 'manual' option which cancels the 302
  // that's useless for when doing the async style login.
  return from(
    fetch('/studio/login', {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...getGlobalHeaders()
      },
      redirect: 'manual',
      body: `username=${credentials.username}&password=${credentials.password}`
    })
  ).pipe(
    switchMap(() => refreshSession()),
    switchMap((auth) =>
      get(me.url, getJwtHeaders(auth.token))
        .pipe(pluck('response', 'authenticatedUser'))
        .pipe(map((user: User) => ({ user, auth })))
    )
  );
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

export type RefreshSessionResponse = { expiresAt: string; token: string };

export function refreshSession(): Observable<RefreshSessionResponse> {
  return get('/studio/refresh.json').pipe(pluck('response'));
}
