/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import { get, post } from '../utils/ajax';
import { map } from 'rxjs/operators';

export function fetchDependencies(siteId: string, items: any) {
  return get(`/studio/api/2/dependency/dependencies?siteId=${siteId}&paths=${items}`)
}

export function getSimpleDependencies(siteId: string, path: string) {
  return post(
    `/studio/api/1/services/api/1/dependency/get-simple-dependencies.json?site=${siteId}&path=${path}`,
    null,
    {
      'Content-Type': 'application/json'
    }
  ).pipe(
    map((response: any) => {
      if (response.response) {
        return response.response;
      } else {
        return response;
      }
    })
  );
}

export function getDependant(siteId: string, path: string) {
  return post(
    `/studio/api/1/services/api/1/dependency/get-dependant.json?site=${siteId}&path=${path}`,
    null,
    {
      'Content-Type': 'application/json'
    }
  ).pipe(
    map((response: any) => {
      if (response.response) {
        return response.response;
      } else {
        return response;
      }
    })
  );
}


export default {
  fetchDependencies
}
