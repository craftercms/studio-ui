/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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
import { map, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PagedArray } from '../models/PagedArray';
import { AuditLog } from '../models/Audit';

export function fetchAudit(options): Observable<PagedArray<AuditLog>> {
  const qs = toQueryString({
    ...options
  });
  return get(`/studio/api/2/audit${qs}`).pipe(
    map(({ response }) =>
      Object.assign(response.auditLog, {
        limit: response.limit,
        offset: response.offset,
        total: response.total
      })
    )
  );
}

export function fetchSpecificAudit(id: number): Observable<AuditLog[]> {
  return get(`/studio/api/2/audit/${id}`).pipe(pluck('response', 'auditLog'));
}
