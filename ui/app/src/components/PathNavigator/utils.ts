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

import { DetailedItem, SandboxItem } from '../../models/Item';

export function isNavigable(item: DetailedItem | SandboxItem): boolean {
  if (item) {
    // Assets have a valid previewUrl but we don't want assets to show in the
    // Guest iFrame but rather as a preview dialog.
    return item.previewUrl !== null && item.systemType !== 'asset';
  }
  return false;
}

export function isEditableViaFormEditor(item: DetailedItem | SandboxItem): boolean {
  return ['page', 'component', 'taxonomy'].includes(item.systemType);
}

export function isImage(item: DetailedItem | SandboxItem): boolean {
  return item?.mimeType.startsWith('image/');
}

export function isVideo(item: DetailedItem | SandboxItem): boolean {
  return item?.mimeType.startsWith('video/');
}

export function isAssetPreviewable(mimeType: string): boolean {
  return (
    /^text\//.test(mimeType) ||
    /^application\/(x-httpd-php|rtf|xhtml\+xml|xml|json|ld\+json|javascript|x-groovy|x-sh)$/.test(mimeType) ||
    /^image\//.test(mimeType)
  );
}

export function isPreviewable(item: DetailedItem | SandboxItem): boolean {
  if (item?.systemType === 'asset') {
    return isAssetPreviewable(item.mimeType);
  } else {
    return ['page', 'component', 'asset', 'renderingTemplate', 'script', 'taxonomy'].includes(item?.systemType);
  }
}

export function isFolder(item: DetailedItem | SandboxItem): boolean {
  return item?.systemType === 'folder';
}

export function getEditorMode(item: DetailedItem | SandboxItem): 'ftl' | 'groovy' | 'javascript' | 'css' | 'text' {
  if (item.systemType === 'renderingTemplate') {
    return 'ftl';
  } else if (item.systemType === 'script') {
    return 'groovy';
  } else if (item.mimeType === 'application/javascript') {
    return 'javascript';
  } else if (item.mimeType === 'text/css') {
    return 'css';
  } else {
    return 'text';
  }
}

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
