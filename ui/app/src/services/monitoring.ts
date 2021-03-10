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
import { Observable } from 'rxjs';
import { Version } from '../models/monitoring/Version';
import { Status } from '../models/monitoring/Status';
import { LogEvent } from '../models/monitoring/LogEvent';
import { Memory } from '../models/monitoring/Memory';

export function fetchVersion(): Observable<Version> {
  return get(`/studio/api/2/monitoring/version`).pipe(pluck('response', 'version'));
}

export function fetchStatus(): Observable<Status> {
  return get('/studio/api/2/monitoring/status').pipe(pluck('response', 'status'));
}

export function fetchMemory(): Observable<Memory> {
  return get('/studio/api/2/monitoring/memory').pipe(pluck('response', 'memory'));
}

export function fetchLog(since: number): Observable<LogEvent[]> {
  return get(`/studio/api/2/monitoring/log?since=${since}`).pipe(pluck('response', 'events'));
}
