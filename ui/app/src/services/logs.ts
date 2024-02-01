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

import { get, post } from '../utils/ajax';
import { Observable } from 'rxjs';
import { Log } from '../models/Log';
import { map } from 'rxjs/operators';
import { Logger, LoggerLevel } from '../models/Logger';

export function fetchLogs(since: number): Observable<Log[]> {
  return get(`/studio/api/2/monitoring/log?since=${since}`).pipe(map((response) => response?.response?.events));
}

export function fetchLoggers(): Observable<Logger[]> {
  return get('/studio/api/2/loggers').pipe(map((response) => response?.response?.results));
}

export function setLogger(name: string, level: LoggerLevel): Observable<true> {
  return post('/studio/api/2/loggers/logger_level', { name, level }).pipe(map(() => true));
}
