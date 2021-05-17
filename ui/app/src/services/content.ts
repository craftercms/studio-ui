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

import { get } from '../utils/ajax';
import { map, mapTo } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { getRequestForgeryToken } from '../utils/auth';

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

export default {
  getContent,
  getDOM,
  unlock
};
