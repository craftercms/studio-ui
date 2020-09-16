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
import { LookupTable } from '../models/LookupTable';
import { SandboxItem } from '../models/Item';

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
  if (path.endsWith('.xml')) {
    url.replace('.xml', '.html');
  }
  url.replace('/site/website', '');
  return `${baseUrl}${url}`;
}

export function getQueryVariable(query: string, variable: string) {
  let qs = parse(query);
  return qs[variable] ?? null;
}

export function parseQueryString() {
  return parse(window.location.search);
}

// TODO: an initial path with trailing `/` breaks
export function itemsFromPath(path: string, root: string, items: LookupTable<SandboxItem>): SandboxItem[] {
  const rootWithIndex = withIndex(root);
  const rootWithoutIndex = withoutIndex(root);
  const rootItem = items[rootWithIndex] ?? items[root];
  if (path === rootWithIndex || path === root) {
    return [rootItem];
  }
  const regExp = new RegExp(`${rootWithIndex}|${rootWithoutIndex}|\\/index\\.xml|/$`, 'g');
  const pathWithoutRoot = path.replace(regExp, '');
  let accum = rootWithoutIndex;
  return [
    rootItem,
    ...pathWithoutRoot
      .split('/')
      .slice(1)
      .map((folder) => {
        accum += `/${folder}`;
        return items[accum] ?? items[withIndex(accum)];
      })
  ];
}

export function withoutIndex(path: string): string {
  return path.replace('/index.xml', '');
}

export function withIndex(path: string): string {
  return `${withoutIndex(path)}/index.xml`;
}

export function getParentPath(path: string): string {
  let splitPath = withoutIndex(path).split('/');
  splitPath.pop();
  return splitPath.join('/');
}

export function getParentsFromPath(path: string, rootPath: string): string[] {
  let splitPath = withoutIndex(path).replace(rootPath, '').split('/');
  splitPath.pop();
  return [rootPath, ...splitPath.map((value, i) => `${rootPath}/${splitPath.slice(1, i + 1).join('/')}`).splice(2)];
}

export function getIndividualPaths(path: string) {
  let paths = [];
  let array = path.replace(/^\/|\/$/g, '').split('/');
  do {
    paths.push('/' + array.join('/'));
    array.pop();
  } while (array.length);
  return paths;
}

export default {
  getPathFromPreviewURL,
  getPreviewURLFromPath,
  getQueryVariable,
  parseQueryString,
  itemsFromPath,
  withoutIndex,
  withIndex,
  getParentPath,
  getParentsFromPath
};
