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

import { parse, ParsedQuery } from 'query-string';
import { DetailedItem, PasteItem } from '../models/Item';
import { toQueryString } from './object';
import LookupTable from '../models/LookupTable';
import ContentType from '../models/ContentType';
import { SystemType } from '../models';

// Originally from ComponentPanel.getPreviewPagePath
export function getPathFromPreviewURL(previewURL: string): string {
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

export function getPreviewURLFromPath(path: string): string {
  return withoutIndex(path).replace('/site/website', '') || '/';
}

export function getFileNameFromPath(path: string): string {
  return path.substring(path.lastIndexOf('/') + 1);
}

export function getQueryVariable(query: string, variable: string): string | string[] {
  let qs = parse(query);
  return qs[variable] ?? null;
}

export function parseQueryString(): ParsedQuery {
  return parse(window.location.search);
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

export function isRootPath(path: string): boolean {
  return getRootPath(path) === withoutIndex(path);
}

export function getRootPath(path: string): string {
  return withoutIndex(path)
    .split('/')
    .slice(0, path.startsWith('/site') ? 3 : 2)
    .join('/');
}

export function getParentsFromPath(path: string, rootPath: string): string[] {
  let splitPath = withoutIndex(path).replace(rootPath, '').split('/');
  splitPath.pop();
  return [rootPath, ...splitPath.map((value, i) => `${rootPath}/${splitPath.slice(1, i + 1).join('/')}`).splice(1)];
}

export function getIndividualPaths(path: string, rootPath?: string): string[] {
  let paths = [];
  // adding withoutIndex to avoid duplicates paths
  let array = withoutIndex(path)
    .replace(/^\/|\/$/g, '')
    .split('/');
  do {
    // validation to add .index.xml to the current path;
    if ('/' + array.join('/') === withoutIndex(path) && path.endsWith('index.xml')) {
      paths.push(path);
    } else {
      paths.push('/' + array.join('/'));
    }
    array.pop();
  } while (array.length);
  if (rootPath && rootPath !== '/') {
    // validation to remove previous path before the rootPath, example 'site' when rootPath is /site/website
    if (paths.indexOf(withIndex(rootPath)) >= 0) {
      return paths.slice(0, paths.indexOf(withIndex(rootPath)) + 1).reverse();
    } else {
      return paths.slice(0, paths.indexOf(withoutIndex(rootPath)) + 1).reverse();
    }
  } else {
    return paths.reverse();
  }
}

export function getPasteItemFromPath(path: string, paths: string[]): PasteItem {
  const sourcePath = withoutIndex(path);
  let lookup = {
    [sourcePath]: {
      path,
      children: []
    }
  };
  paths.forEach((path) => {
    lookup[path] = {
      path: path,
      children: []
    };
    const parentPath = getParentPath(path);
    if (!lookup[parentPath]) {
      lookup[parentPath] = {
        path: parentPath,
        children: []
      };
    }
    lookup[parentPath].children.push(lookup[path]);
  });
  return lookup[sourcePath];
}

export function isValidCutPastePath(targetPath, sourcePath): boolean {
  return !getIndividualPaths(targetPath).includes(sourcePath);
}

export function getEditFormSrc({
  path,
  selectedFields,
  site,
  authoringBase,
  readonly,
  isHidden,
  modelId,
  changeTemplate,
  contentTypeId,
  isNewContent,
  iceGroupId,
  newEmbedded
}: {
  path: string;
  selectedFields?: string;
  site: string;
  authoringBase: string;
  readonly?: boolean;
  isHidden?: boolean;
  modelId?: string;
  changeTemplate?: string;
  contentTypeId?: string;
  isNewContent?: boolean;
  iceGroupId?: string;
  newEmbedded?: string;
}): string {
  const qs = toQueryString({
    site,
    path,
    selectedFields,
    type: 'form',
    readonly,
    isHidden,
    modelId,
    changeTemplate,
    contentTypeId,
    isNewContent,
    iceId: iceGroupId,
    newEmbedded
  });
  return `${authoringBase}/legacy/form${qs}`;
}

export function getCodeEditorSrc({
  path,
  site,
  type,
  contentType,
  authoringBase,
  readonly
}: {
  path: string;
  site: string;
  type: string;
  contentType?: string;
  authoringBase: string;
  readonly: boolean;
}): string {
  const qs = toQueryString({
    site,
    path,
    type,
    contentType,
    readonly
  });
  return `${authoringBase}/legacy/form${qs}`;
}

export function stripDuplicateSlashes(str: string): string {
  return str.replace(/\/+/g, '/');
}

export function getItemGroovyPath(item: DetailedItem): string {
  const contentTypeName = /[^/]*$/.exec(item.contentTypeId)[0];
  return `${getControllerPath(item.systemType)}/${contentTypeName}.groovy`;
}

export function getItemTemplatePath(item: DetailedItem, contentTypes: LookupTable<ContentType>): string {
  return contentTypes[item.contentTypeId].displayTemplate;
}

export function getControllerPath(type: SystemType): string {
  return `/scripts/${type === 'page' ? 'pages' : 'components'}`;
}
