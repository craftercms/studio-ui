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

import { catchApi1Error, get, post } from '../utils/ajax';
import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

export function fetchDependencies(siteId: string, items: any) {
  return get(`/studio/api/2/dependency/dependencies?siteId=${siteId}&paths=${items}`)
}

export function getSimpleDependencies(siteId: string, path: string): Observable<any> {
  return post(
    `/studio/api/1/services/api/1/dependency/get-simple-dependencies.json?site=${siteId}&path=${path}`,
    null
  ).pipe(
    pluck('response'),
    catchApi1Error
  );
}

export function getDependant(siteId: string, path: string): Observable<any> {
  return post(
    `/studio/api/1/services/api/1/dependency/get-dependant.json?site=${siteId}&path=${path}`,
    null
  ).pipe(
    pluck('response'),
    catchApi1Error
  );
}


export default {
  fetchDependencies,
  getSimpleDependencies,
  getDependant
}
