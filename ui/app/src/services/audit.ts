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
import { PagedArray } from '../models/PagedArray';
import { AuditLogEntry } from '../models/Audit';
import PaginationOptions from '../models/PaginationOptions';
import { Api2BulkResponseFormat, Api2ResponseFormat } from '../models/ApiResponse';

export type AuditOptions = Partial<
  PaginationOptions & {
    siteId: string;
    siteName: string;
    user: string;
    operations: string;
    includeParameters: boolean;
    dateFrom: string;
    dateTo: string;
    target: string;
    origin: 'API' | 'GIT';
    sort: 'date';
    order: 'ASC' | 'DESC';
  }
>;

export function fetchAuditLog(options: AuditOptions): Observable<PagedArray<AuditLogEntry>> {
  const mergedOptions = {
    limit: 100,
    offset: 0,
    ...options
  };
  return get<Api2BulkResponseFormat<{ auditLog: AuditLogEntry[] }>>(
    `/studio/api/2/audit${toQueryString(mergedOptions)}`
  ).pipe(
    map(({ response }) =>
      Object.assign(response.auditLog, {
        limit: response.limit < mergedOptions.limit ? mergedOptions.limit : response.limit,
        offset: response.offset,
        total: response.total
      })
    )
  );
}

export function fetchAuditLogEntry(id: number, siteId?: string): Observable<AuditLogEntry> {
  const qs = toQueryString({ siteId }, { skipNull: true });
  return get<Api2ResponseFormat<{ auditLog: AuditLogEntry }>>(`/studio/api/2/audit/${id}${qs}`).pipe(
    map((response) => response?.response?.auditLog)
  );
}
