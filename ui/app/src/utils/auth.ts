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

const siteCookie = 'crafterSite';
const xsrfTokenHeader = 'X-XSRF-TOKEN';
const xsrfTokenCookie = 'XSRF-TOKEN';

export function getRequestForgeryToken(cookieName = xsrfTokenCookie): string {
  return Cookies.get(cookieName);
}

export function setRequestForgeryToken(headerName = xsrfTokenHeader): void {
  const token = getRequestForgeryToken();
  setGlobalHeaders({ [headerName]: token });
}

export function getCookieDomain(): string {
  let hostname = window.location.hostname;
  let domain = '';
  if (hostname.includes('.')) {
    domain = hostname.replace(/^(.*?)\./, '');
    domain = `.${domain.includes('.') ? domain : hostname}`;
  }
  return domain;
}

export function setSiteCookie(value: string, cookieName: string = 'crafterSite'): void {
  Cookies.set(cookieName, value, {
    domain: getCookieDomain(),
    path: '/'
  });
}

export function getSiteCookie(cookieName: string = siteCookie): string {
  return Cookies.get(cookieName) || null;
}

const auth = {
  getCookieDomain,
  getRequestForgeryToken,
  setRequestForgeryToken,
  setSiteCookie,
  getSiteCookie
};

export default auth;
