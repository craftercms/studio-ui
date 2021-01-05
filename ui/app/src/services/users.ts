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

import { forkJoin, Observable, of } from 'rxjs';
import { User } from '../models/User';
import { del, get, patchJSON, postJSON } from '../utils/ajax';
import { map, mapTo, pluck, switchMap } from 'rxjs/operators';
import { fetchSites } from './sites';
import LookupTable from '../models/LookupTable';
import { Site } from '../models/Site';
import { PagedArray } from '../models/PagedArray';
import PaginationOptions from '../models/PaginationOptions';
import { toQueryString } from '../utils/object';
import { asArray } from '../utils/array';
import { ApiResponse } from '../models/ApiResponse';

// Check services/auth/login if `me` method is changed.
export function me(): Observable<User> {
  return get(me.url).pipe(pluck('response', 'authenticatedUser'));
}

me.url = '/studio/api/2/users/me.json';

export function create(user: Partial<User>): Observable<User> {
  return postJSON(`/studio/api/2/users`, user).pipe(pluck('response', 'user'));
}

export function update(user: Partial<User>): Observable<User> {
  return patchJSON(`/studio/api/2/users`, user).pipe(pluck('response', 'user'));
}

export function trash(username: string): Observable<true> {
  return del(`/studio/api/2/users?username=${encodeURIComponent(username)}`).pipe(mapTo(true));
}

export function fetchAll(options?: PaginationOptions): Observable<PagedArray<User>> {
  const qs = toQueryString({
    limit: 100,
    offset: 0,
    ...options
  });
  return get(`/studio/api/2/users${qs}`).pipe(
    map(({ response }) =>
      Object.assign(response.users, {
        limit: response.limit,
        offset: response.offset,
        total: response.total
      })
    )
  );
}

export function byId(): Observable<User> {
  return null;
}

export function enable(username: string): Observable<User>;
export function enable(usernames: string[]): Observable<User[]>;
export function enable(usernames: string | string[]): Observable<User | User[]> {
  return patchJSON('/studio/api/2/users/enable', { usernames: asArray(usernames) }).pipe(
    pluck('response', 'users'),
    map((users) => (Array.isArray(usernames) ? users : users[0]))
  );
}

export function disable(username: string): Observable<User>;
export function disable(usernames: string[]): Observable<User[]>;
export function disable(usernames: string | string[]): Observable<User | User[]> {
  return patchJSON('/studio/api/2/users/disable', { usernames: asArray(usernames) }).pipe(
    pluck('response', 'users'),
    map((users) => (Array.isArray(usernames) ? users : users[0]))
  );
}

/**
 * Sets the password for the supplied username. Requires UPDATE_USERS permission.
 **/
export function setPassword(username: string, password: string): Observable<void> {
  return postJSON(`/studio/api/2/users/${encodeURIComponent(username)}/reset_password`, {
    username,
    new: password
  }).pipe(pluck('response'));
}

/**
 * Set a new password using a valid password reset token.
 **/
export function resetPasswordWithToken(token: string, password: string): Observable<boolean> {
  return postJSON('/studio/api/2/users/set_password', {
    token,
    new: password
  }).pipe(pluck('response', 'user'));
}

/**
 * Set the password for the current user.
 **/
export function setMyPassword(username: string, currentPassword: string, newPassword: string): Observable<User> {
  return postJSON('/studio/api/2/users/me/change_password', {
    username,
    current: currentPassword,
    new: newPassword
  }).pipe(pluck('response', 'user'));
}

export function fetchByUsername(username: string): Observable<User> {
  return get(`/studio/api/2/users/${encodeURIComponent(username)}`).pipe(pluck('response', 'user'));
}

export function fetchRolesInSite(username: string, siteId: string): Observable<string[]> {
  return get(`/studio/api/2/users/${username}/sites/${siteId}/roles`).pipe(pluck('response', 'roles'));
}

// renamed from fetchRolesInSiteForCurrent
export function fetchMyRolesInSite(siteId: string): Observable<string[]> {
  return get(`/studio/api/2/users/me/sites/${siteId}/roles`).pipe(pluck('response', 'roles'));
}

export function fetchRolesBySite(username?: string, sites?: Site[]): Observable<LookupTable<string[]>> {
  return forkJoin({
    username: username ? of(username) : me().pipe(map((user) => user.username)),
    sites: sites ? of(sites) : fetchSites()
  }).pipe(
    switchMap(({ username, sites }) =>
      forkJoin<LookupTable<Observable<string[]>>, ''>(
        sites.reduce((lookup, site) => {
          lookup[site.id] = fetchRolesInSite(username, site.id);
          return lookup;
        }, {})
      )
    )
  );
}

// renamed from fetchRolesBySiteForCurrent
export function fetchMyRolesBySite(sites?: Site[]): Observable<LookupTable<string[]>> {
  return (sites ? of(sites) : fetchSites()).pipe(
    switchMap((sites) =>
      forkJoin<LookupTable<Observable<string[]>>, ''>(
        sites.reduce((lookup, site) => {
          lookup[site.id] = fetchMyRolesInSite(site.id);
          return lookup;
        }, {})
      )
    )
  );
}

export function fetchGlobalPreferences(): Observable<LookupTable<any>> {
  return get('/studio/api/2/users/me/properties').pipe(pluck('response', 'properties', ''));
}

export function fetchSitePreferences(siteId: string): Observable<LookupTable<any>> {
  return get(`/studio/api/2/users/me/properties?siteId=${siteId}`).pipe(pluck('response', 'properties', siteId));
}

export function setPreferences(
  properties: LookupTable<string | number>,
  siteId?: string
): Observable<{ response: ApiResponse; properties: LookupTable<any> }> {
  return postJSON('studio/api/2/users/me/properties', {
    siteId,
    properties
  }).pipe(pluck('response'));
}

export function deletePreferences(properties: string[], siteId?: string): Observable<Boolean> {
  return del(`/studio/api/2/users/me/properties?${siteId ? `siteId=${siteId}&` : ``}properties=${properties}`).pipe(
    mapTo(true)
  );
}
