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

import { forkJoin, Observable, of, OperatorFunction } from 'rxjs';
import { LegacyUser, User } from '../models/User';
import { get } from '../utils/ajax';
import { map, pluck, switchMap } from 'rxjs/operators';
import { fetchSites } from './sites';
import LookupTable from '../models/LookupTable';
import { Site } from '../models/Site';

export const mapToUser: OperatorFunction<LegacyUser, User> = map<LegacyUser, User>((user) => ({
  ...user,
  authType: user.authenticationType
}));

export function me(): Observable<User> {
  return get('/studio/api/2/users/me.json').pipe(pluck('response', 'authenticatedUser'), mapToUser);
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
