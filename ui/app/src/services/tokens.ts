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

import { Observable } from 'rxjs';
import { del, get, postJSON } from '../utils/ajax';
import { map } from 'rxjs/operators';
import { Token } from '../models/Token';

export function fetchTokens(): Observable<Token[]> {
  return get('/studio/api/2/security/tokens').pipe(map((response) => response?.response?.tokens));
}

export function createToken(label: string, expiresAt?: string): Observable<Token> {
  return postJSON('/studio/api/2/security/tokens', {
    label,
    ...(expiresAt && { expiresAt })
  }).pipe(map((response) => response?.response?.token));
}

export function updateToken(id: number, properties: Object): Observable<Token> {
  return postJSON(`/studio/api/2/security/tokens/${id}`, properties).pipe(map((response) => response?.response?.token));
}

export function deleteToken(id: number): Observable<boolean> {
  return del(`/studio/api/2/security/tokens/${id}`).pipe(map(() => true));
}
