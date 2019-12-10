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

export function getPreviewURLFromPath(baseUrl: string, path: string) {
  let url = '';
  if(path.endsWith('.xml')) {
    url.replace('.xml', '.html');
  }
  url.replace('/site/website','');
  return baseUrl+url;
}

export function isEditableFormAsset (path: string) {
  return path.indexOf(".ftl") != -1
    || path.indexOf(".css") != -1
    || path.indexOf(".js") != -1
    || path.indexOf(".groovy") != -1
    || path.indexOf(".txt") != -1
    || path.indexOf(".html") != -1
    || path.indexOf(".hbs") != -1
    || path.indexOf(".xml") != -1;
}

export default {
  getPathFromPreviewURL,
  isEditableFormAsset
};
