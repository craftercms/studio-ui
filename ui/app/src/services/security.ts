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

import { get, post, postJSON } from '../utils/ajax';
import { map, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { toQueryString } from '../utils/object';

export function encrypt(text: string): Observable<string>;
export function encrypt(text: string, site: string): Observable<string>;
export function encrypt(text: string, site: string = ''): Observable<string> {
  return postJSON(`/studio/api/2/security/encrypt.json`, { text, siteId: site }).pipe(pluck('response', 'item'));
}

export function getUserPermissions(site: string, path: string): Observable<string[]> {
  const qs = toQueryString({ site, path });
  return get(`/studio/api/1/services/api/1/security/get-user-permissions.json${qs}`).pipe(
    pluck('response', 'permissions')
  );
}

export function previewSwitch(): Observable<true> {
  return post(`/studio/api/2/security/preview/switch`).pipe(map(() => true));
}
