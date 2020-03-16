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


//curl -X GET "http://localhost:8080/studio/api/2/translation/list_target_locales?siteId=editorial&path=asd" -H "accept: application/json"

import { Observable, Observer } from 'rxjs';

export function getTargetLocales(site: string, path: string): Observable<any> {
  ///studio/api/2/translation/list_target_locales
  const response = {
    response: {},
    items: [
      {
        id: '1',
        status: 'Edited by me',
        localeCode: 'en'
      },
      {
        id: '2',
        status: 'Machine translations complete',
        localeCode: 'es'
      },
      {
        id: '3',
        status: 'Published',
        localeCode: 'en'
      },
      {
        id: '4',
        status: 'Not translated',
        localeCode: 'es'
      }
    ]
  };

  return new Observable((observer: Observer<any>) => {
    observer.next(response);
    observer.complete();
  });
}
