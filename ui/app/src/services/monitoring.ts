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

import { errorSelectorApi1, get } from '../utils/ajax';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Version } from '../models/monitoring/Version';
import { Status } from '../models/monitoring/Status';
import { LogEvent } from '../models/monitoring/LogEvent';
import { Memory } from '../models/monitoring/Memory';

export function fetchVersion(): Observable<Version> {
  return get(`/studio/api/2/monitoring/version`).pipe(map(({ response: { version } }) => version));
}

export function fetchStatus(): Observable<Status> {
  return get('/studio/api/2/monitoring/status').pipe(map(({ response: { status } }) => status));
}

export function fetchMemory(): Observable<Memory> {
  return get('/studio/api/2/monitoring/memory').pipe(map(({ response: { memory } }) => memory));
}

export function fetchLog(since: number): Observable<LogEvent[]> {
  return get(`/studio/api/2/monitoring/log?since=${since}`).pipe(map(({ response: { events } }) => events));
}

export function fetchPreviewLog(site: string, since: number): Observable<LogEvent[]> {
  return get(`/studio/engine/api/1/monitoring/log.json?since=${since}&site=${site}&crafterSite=${site}`).pipe(
    map(({ response }) => response),
    catchError(errorSelectorApi1)
  );
}

// export function fetchSiteLog(site: string)
