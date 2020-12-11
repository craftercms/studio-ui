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
import { get } from '../utils/ajax';
import { map, pluck, switchMap } from 'rxjs/operators';
import { fetchSites } from './sites';
import LookupTable from '../models/LookupTable';
import { Site } from '../models/Site';
import { PagedArray } from '../models/PagedArray';
import PaginationOptions from '../models/PaginationOptions';
import { toQueryString } from '../utils/object';

export function me(): Observable<User> {
  return get('/studio/api/2/users/me.json').pipe(pluck('response', 'authenticatedUser'));
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

export function fetchByUsername(username: string): Observable<User> {
  return get(`/studio/api/2/users/${encodeURIComponent(username)}`).pipe(pluck('response', 'user'));
}

export function fetchRolesInSite(username: string, siteId: string): Observable<string[]> {
  return get(`/studio/api/2/users/${username}/sites/${siteId}/roles`).pipe(pluck('response', 'roles'));
}

export function fetchRolesInSiteForCurrent(siteId: string): Observable<string[]> {
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

export function fetchRolesBySiteForCurrent(sites?: Site[]): Observable<LookupTable<string[]>> {
  return (sites ? of(sites) : fetchSites()).pipe(
    switchMap((sites) =>
      forkJoin<LookupTable<Observable<string[]>>, ''>(
        sites.reduce((lookup, site) => {
          lookup[site.id] = fetchRolesInSiteForCurrent(site.id);
          return lookup;
        }, {})
      )
    )
  );
}
