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

import { Observable } from 'rxjs';
import { del, get, post } from '../utils/ajax';
import { pluck } from 'rxjs/operators';

export function getTokens(): Observable<any> {
  return get('/studio/api/2/security/tokens').pipe(pluck('response', 'tokens'));
}

export function createToken(label: string, expiresAt?: string): Observable<any> {
  return post('/studio/api/2/security/tokens', {
    label,
    ...(expiresAt && { expiresAt })
  }).pipe(pluck('response'));
}

export function updateToken(id: string, properties: Object): Observable<any> {
  return post(`/studio/api/2/security/tokens/${id}`, properties).pipe(pluck('response'));
}

export function deleteToken(id: string): Observable<any> {
  return del(`/studio/api/2/security/tokens/${id}`).pipe(pluck('response'));
}
