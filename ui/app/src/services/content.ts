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

import { errorSelectorApi1, get } from '../utils/ajax';
import { catchError, map, mapTo, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { getRequestForgeryToken } from '../utils/auth';
import { Item } from '../models/Item';
import { stringify } from 'query-string';

export function getContent(site: string, path: string): Observable<string> {
  return get(`/studio/api/1/services/api/1/content/get-content.json?site_id=${site}&path=${path}`).pipe(
    map(({ response }) => response.content)
  );
}

export function getDOM(site: string, path: string): Observable<XMLDocument> {
  return getContent(site, path).pipe(map((xml = '') => new DOMParser().parseFromString(xml, 'text/xml')));
}

export function getBulkUploadUrl(site: string, path: string): string {
  return `/studio/api/1/services/api/1/content/write-content.json?site=${site}&path=${path}&contentType=folder&createFolders=true&draft=false&duplicate=false&unlock=true&_csrf=${getRequestForgeryToken()}`;
}

export function unlock(site: string, path: string): Observable<boolean> {
  return get(`/studio/api/1/services/api/1/content/unlock-content.json?site=${site}&path=${path}`).pipe(mapTo(true));
}

export function fetchLegacyItem(site: string, path: string): Observable<Item> {
  return get(
    `/studio/api/1/services/api/1/content/get-item.json?site_id=${site}&path=${encodeURIComponent(path)}`
  ).pipe(pluck('response', 'item'), catchError(errorSelectorApi1));
}

export function fetchLegacyItemsTree(
  site: string,
  path: string,
  options?: Partial<{ depth: number; order: string }>
): Observable<Item> {
  return get(
    `/studio/api/1/services/api/1/content/get-items-tree.json?${stringify({
      site_id: site,
      path,
      ...options
    })}`
  ).pipe(pluck('response', 'item'), catchError(errorSelectorApi1));
}
