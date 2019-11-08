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
 */

import { get } from '../utils/ajax';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export function getRawContent(site: string, configPath: string, module: string): Observable<string> {
  return get(`/studio/api/2/configuration/get_configuration?siteId=${site}&module=${module}&path=${configPath}`).pipe(
    map(({ response }) => response.content)
  );
}

export function getDOM(site: string, configPath: string, module: string): Observable<XMLDocument> {
  return getRawContent(site, configPath, module).pipe(
    map((xml = '') => new DOMParser().parseFromString(xml, 'text/xml'))
  );
}

export default {
  getRawContent,
  getDOM
}
