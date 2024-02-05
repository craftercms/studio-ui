/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import { catchError, map } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { User } from '../models/User';
import { AjaxError } from 'rxjs/ajax';
import { Credentials } from '../models/Credentials';
import { Api2ResponseFormat, ApiResponse } from '../models/ApiResponse';
import { toQueryString } from '../utils/object';

interface FetchSSOLogoutUrlResponse {
  logoutUrl: string;
}

/**
 * @deprecated Please note API deprecation for Crafter v4.0.0+
 **/
export function fetchSSOLogoutURL(): Observable<FetchSSOLogoutUrlResponse> {
  return get<FetchSSOLogoutUrlResponse>('/studio/api/2/users/me/logout/sso/url').pipe(
    map((response) => response?.response)
  );
}

export function login(credentials: Credentials): Observable<boolean> {
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
      body: toQueryString({ username: credentials.username, password: credentials.password }, { prefix: '' })
    })
  ).pipe(map(() => true));
}

export function sendPasswordRecovery(username: string): Observable<ApiResponse> {
  return get(`/studio/api/2/users/forgot_password?username=${username}`).pipe(
    map((response) => response?.response?.response),
    catchError((error: AjaxError) => {
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
    : postJSON<Api2ResponseFormat<{ user: User }>>(`/studio/api/2/users/set_password`, {
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
    map(() => true),
    catchError((error) => {
      if (error.status === 401) return of(false);
      else throw new Error(error.response);
    })
  );
}

export type ObtainAuthTokenResponse = { expiresAt: number; token: string };

export function obtainAuthToken(): Observable<ObtainAuthTokenResponse> {
  return get<{ auth: ObtainAuthTokenResponse }>('/studio/refresh.json').pipe(
    map((response) => {
      const auth = response?.response?.auth;
      return { token: auth.token, expiresAt: new Date(auth.expiresAt).getTime() };
    })
  );
}

export type FetchAuthTypeResponse = 'db' | 'ldap' | 'headers' | 'saml';

export function fetchAuthenticationType(): Observable<FetchAuthTypeResponse> {
  return get<{ authType: FetchAuthTypeResponse }>('/studio/authType.json').pipe(
    map((response) => (response?.response?.authType?.toLowerCase() ?? 'db') as FetchAuthTypeResponse)
  );
}
