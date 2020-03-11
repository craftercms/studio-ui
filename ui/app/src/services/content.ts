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

import { CONTENT_TYPE_JSON, get, post } from '../utils/ajax';
import { map, pluck } from 'rxjs/operators';
import { Observable, Observer } from 'rxjs';
import { Item } from '../models/Item';

export function getContent(site: string, path: string): Observable<string> {
  return get(`/studio/api/1/services/api/1/content/get-content.json?site_id=${site}&path=${path}`).pipe(
    map(({ response }) => response.content)
  );
}

export function getDOM(site: string, path: string): Observable<XMLDocument> {
  return getContent(site, path).pipe(
    map((xml = '') => new DOMParser().parseFromString(xml, 'text/xml'))
  );
}

export function getChildrenByPath(site: string, path: string): Observable<any> {
  const response = {
    response: {},
    items: [
      {
        id: 'Style',
        label: 'Style',
        path: '/site/website/style/index.xml',
        localeCode: 'en'
      },
      {
        id: 'Salud',
        label: 'Salud',
        path: '/site/website/health/index.xml',
        localeCode: 'es'
      },
      {
        id: 'Entertainment',
        label: 'Entertainment',
        path: '/site/website/entertainment/index.xml',
        localeCode: 'en'
      },
      {
        id: 'Tecnologia',
        label: 'Tecnologia',
        path: '/site/website/technology/index.xml',
        localeCode: 'es'
      }
    ]
  };

  return new Observable((observer: Observer<any>) => {
    observer.next(response);
    observer.complete();
  });
}

export function copyItem(site: string, item: Item): Observable<any> {
  return post(`/studio/api/1/services/api/1/clipboard/copy-item.json?site=${site}`, { item: [{ uri: item.path }] }, CONTENT_TYPE_JSON).pipe(pluck('response'));
}

export function cutItem(site: string, item: Item): Observable<any> {
  return post(`/studio/api/1/services/api/1/clipboard/cut-item.json?site=${site}`, { item: [{ uri: item.path }] }, CONTENT_TYPE_JSON).pipe(pluck('response'));
}

export function pasteItem(site: string, item: Item): Observable<any> {
  return get(`/studio/api/1/services/api/1/clipboard/paste-item.json?site=${site}&parentPath=${item.path}`).pipe(pluck('response'));
}

export default {
  getContent,
  getDOM
}
