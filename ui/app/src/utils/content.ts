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

import { BaseItem, DetailedItem, LegacyItem, SandboxItem } from '../models/Item';
import { getStateMapFromLegacyItem } from './state';

export function isEditableAsset(path: string) {
  return (
    path.endsWith('.ftl')
    || path.endsWith('.css')
    || path.endsWith('.js')
    || path.endsWith('.groovy')
    || path.endsWith('.txt')
    || path.endsWith('.html')
    || path.endsWith('.hbs')
    || path.endsWith('.xml')
    || path.endsWith('.tmpl')
    || path.endsWith('.htm')
  );
}

export function isAsset(path: string) {
  return (
    path.endsWith('.jpg')
    || path.endsWith('.png')
    || path.endsWith('.svg')
    || path.endsWith('.jpeg')
    || path.endsWith('.gif')
    || path.endsWith('.pdf')
    || path.endsWith('.doc')
    || path.endsWith('.docx')
    || path.endsWith('.xls')
    || path.endsWith('.xlsx')
    || path.endsWith('.ppt')
    || path.endsWith('.pptx')
    || path.endsWith('.mp4')
    || path.endsWith('.avi')
    || path.endsWith('.webm')
    || path.endsWith('.mpg')
  );
}

export function isCode(path: string) {
  return (
    path.endsWith('.ftl')
    || path.endsWith('.css')
    || path.endsWith('.js')
    || path.endsWith('.groovy')
    || path.endsWith('.html')
    || path.endsWith('.hbs')
    || path.endsWith('.tmpl')
    || path.endsWith('.htm')
  );
}

export function isImage(path: string) {
  return (
    path.endsWith('.jpg')
    || path.endsWith('.png')
    || path.endsWith('.svg')
    || path.endsWith('.jpeg')
    || path.endsWith('.gif')
  );
}

function systemType(item: LegacyItem) {
  switch (true) {
    case item.contentType === 'renderingTemplate': {
      return 'template';
    }
    case item.contentType === 'script': {
      return 'script';
    }
    case item.asset: {
      return 'asset';
    }
    case item.component: {
      return 'component';
    }
    case item.folder:
    case item.container: {
      return 'folder';
    }
    case item.page: {
      return 'page';
    }
    case (item.contentType === 'taxonomy'): {
      return 'taxonomy';
    }
    default: {
      return null;
    }
  }
}

export function parseLegacyItemToBaseItem(item: LegacyItem): BaseItem {
  return {
    id: item.uri ?? item.path,
    label: item.internalName ?? item.name,
    contentTypeId: item.contentType,
    path: item.uri ?? item.path,
    // Assuming folders aren't navigable
    previewUrl: item.uri?.includes('index.xml') ? (item.browserUri || '/') : null,
    systemType: systemType(item),
    mimeType: null,
    state: null,
    stateMap: getStateMapFromLegacyItem(item),
    lockOwner: null,
    disabled: null,
    localeCode: 'en',
    translationSourceId: null
  };
}

export function parseLegacyItemToSandBoxItem(item: LegacyItem): SandboxItem;
export function parseLegacyItemToSandBoxItem(item: LegacyItem[]): SandboxItem[];
export function parseLegacyItemToSandBoxItem(item: LegacyItem | LegacyItem[]): SandboxItem | SandboxItem[] {
  if (Array.isArray(item)) {
    // If no internalName then skipping (e.g. level descriptors)
    return item.flatMap(i => i.internalName || i.name ? [parseLegacyItemToSandBoxItem(i)] : []);
  }

  return {
    ...parseLegacyItemToBaseItem(item),
    creator: null,
    createdDate: null,
    modifier: null,
    lastModifiedDate: null,
    commitId: null,
    sizeInBytes: null
  };
}

export function parseLegacyItemToDetailedItem(item: LegacyItem): DetailedItem;
export function parseLegacyItemToDetailedItem(item: LegacyItem[]): DetailedItem[];
export function parseLegacyItemToDetailedItem(item: LegacyItem | LegacyItem[]): DetailedItem | DetailedItem[] {
  if (Array.isArray(item)) {
    // If no internalName then skipping (e.g. level descriptors)
    return item.flatMap(i => i.internalName || i.name ? [parseLegacyItemToDetailedItem(i)] : []);
  }

  return {
    ...parseLegacyItemToBaseItem(item),
    sandbox: null,
    staging: null,
    live: {
      lastScheduledDate: item.scheduledDate,
      lastPublishedDate: item.publishedDate,
      publisher: item.user,
      commitId: null
    }
  };
}

export default {
  isEditableAsset,
  parseLegacyItemToSandBoxItem,
  parseLegacyItemToDetailedItem
};
