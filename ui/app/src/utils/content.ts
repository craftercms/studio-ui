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

import { LegacyItem, SandboxItem } from '../models/Item';

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

export function parseLegacyItemToSandBoxItem(item: LegacyItem): SandboxItem;
export function parseLegacyItemToSandBoxItem(item: LegacyItem[]): SandboxItem[];
export function parseLegacyItemToSandBoxItem(item: LegacyItem | LegacyItem[]): SandboxItem | SandboxItem[] {
  if (Array.isArray(item)) {
    // If no internalName then skipping (e.g. level descriptors)
    return item.flatMap(i => i.internalName || i.name ? [parseLegacyItemToSandBoxItem(i)] : []);
  }

  return {
    id: item.uri ?? item.path,
    label: item.internalName ?? item.name,
    path: item.uri ?? item.path,
    localeCode: 'en',
    contentTypeId: item.contentType,
    // Assuming folders aren't navigable
    previewUrl: item.uri?.includes('index.xml') ? (item.browserUri || '/') : null,
    systemType: item.asset ? 'asset' : item.component ? 'component' : item.folder ? 'folder' : item.page ? 'page' : null,
    mimeType: null,
    state: null,
    lockOwner: null,
    disabled: null,
    translationSourceId: null,
    creator: null,
    createdDate: null,
    modifier: null,
    lastModifiedDate: null,
    commitId: null,
    sizeInBytes: null
  };
}

export default {
  isEditableAsset,
  parseLegacyItemToSandBoxItem
};
