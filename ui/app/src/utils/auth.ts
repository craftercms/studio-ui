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

import Cookies from 'js-cookie';
import { setGlobalHeaders } from './ajax';

const SITE_COOKIE_NAME = 'crafterSite';
const XSRF_TOKEN_HEADER_NAME = 'X-XSRF-TOKEN';
const XSRF_TOKEN_COOKIE_NAME = 'XSRF-TOKEN';

export function getRequestForgeryToken(cookieName = XSRF_TOKEN_COOKIE_NAME): string {
  return Cookies.get(cookieName);
}

export function getRequestForgeryTokenHeaderName(): string {
  return XSRF_TOKEN_HEADER_NAME;
}

export function getRequestForgeryTokenParamName(): string {
  return '_csrf';
}

export function setRequestForgeryToken(headerName = XSRF_TOKEN_HEADER_NAME): void {
  const token = getRequestForgeryToken();
  setGlobalHeaders({ [headerName]: token });
}

export function setJwt(token: string): void {
  setGlobalHeaders(getJwtHeaders(token));
}

export function getJwtHeaders(token: string): object {
  return { Authorization: `Bearer ${token}` };
}

export function getCookieDomain(): string {
  return window.location.hostname.includes('.') ? window.location.hostname : '';
}

export function setSiteCookie(value: string): void {
  Cookies.set(SITE_COOKIE_NAME, value, {
    domain: getCookieDomain(),
    path: '/'
  });
}

export function getSiteCookie(cookieName: string = SITE_COOKIE_NAME): string {
  return Cookies.get(cookieName) || null;
}

export function removeSiteCookie(): void {
  Cookies.remove(SITE_COOKIE_NAME);
}
