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

import { parse } from 'query-string';

// Originally from ComponentPanel.getPreviewPagePath
export function getPathFromPreviewURL(previewURL: string) {
  let pagePath = previewURL;

  if (pagePath.indexOf('?') > 0) {
    pagePath = pagePath.split('?')[0];
  }
  if (pagePath.indexOf('#') > 0) {
    pagePath = pagePath.split('#')[0];
  }
  if (pagePath.indexOf(';') > 0) {
    pagePath = pagePath.split(';')[0];
  }

  pagePath = pagePath.replace('.html', '.xml');

  if (pagePath.indexOf('.xml') === -1) {
    if (pagePath.substring(pagePath.length - 1) !== '/') {
      pagePath += '/';
    }
    pagePath += 'index.xml';
  }

  return `/site/website${pagePath}`;
}

export function parseQueryString() {
  return parse(window.location.search);
}
