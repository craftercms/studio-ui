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
import { pluck } from 'rxjs/operators';

export function fetchDependencies(siteId: string, items: any) {
  return get(`/studio/api/2/dependency/dependencies?siteId=${siteId}&paths=${items}`).pipe(
    pluck('response', 'items')
  );
}

export function fetchDeleteDependencies(siteId: string, paths: string[]) {
  return get(`/studio/api/2/content/get_delete_package?siteId=${siteId}&paths=${paths}`).pipe(
    pluck('response')
  )
}

export default {
  fetchDependencies,
  fetchDeleteDependencies
};
