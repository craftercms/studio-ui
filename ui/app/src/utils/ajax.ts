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

import { ajax } from 'rxjs/ajax';

const HEADERS = {};
export const CONTENT_TYPE_JSON = { 'Content-Type': 'application/json' };
export const OMIT_GLOBAL_HEADERS = {};

export function setGlobalHeaders(props: object) {
  Object.assign(HEADERS, props);
}

export function getGlobalHeaders() {
  return { ...HEADERS };
}

/* private */ function mergeHeaders(headers: object = {}) {
  if (headers === OMIT_GLOBAL_HEADERS) {
    return null;
  } else if (Object.values(headers).includes(OMIT_GLOBAL_HEADERS)) {
    return headers;
  }
  return Object.assign({}, HEADERS, headers);
}

export function get(url: string, headers: object = {}) {
  return ajax.get(url, mergeHeaders(headers));
}

export function post(url: string, body: any, headers: object = {}) {
  return ajax.post(url, body, mergeHeaders(headers));
}

export function patch(url: string, body: any, headers: object = {}) {
  return ajax.patch(url, body, mergeHeaders(headers));
}

export function put(url: string, body: any, headers: object = {}) {
  return ajax.put(url, body, mergeHeaders(headers));
}

export function del(url: string, headers: object = {}) {
  return ajax.delete(url, mergeHeaders(headers));
}

export default {
  OMIT_GLOBAL_HEADERS,
  getGlobalHeaders,
  setGlobalHeaders,
  get,
  post,
  patch,
  put,
  del
}
