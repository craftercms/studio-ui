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

import { get } from '../utils/ajax';
import { toQueryString } from '../utils/object';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export function fetchToken(site: string, profileId: string): Observable<string> {
  const qs = toQueryString({
    site,
    profileId
  });
  return get<{ accessToken: string }>(`/studio/api/1/services/api/1/box/token.json${qs}`).pipe(
    map((response) => response?.response?.accessToken)
  );
}

export function fetchBoxUrl(site: string, profileId: string, fileId: string, filename: string): Observable<string> {
  const qs = toQueryString({
    site,
    profileId,
    fileId,
    filename
  });
  return get<{ url: string }>(`/api/1/services/api/1/box/url.json${qs}`).pipe(
    map((response) => response?.response?.url)
  );
}
