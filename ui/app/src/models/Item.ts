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
export interface LegacyItem {
  name: string;
  internalName: string;
  uri: string;
  [prop: string]: any;

  children: LegacyItem[];
}

export interface LocalizationItem {
  id: string;
  label: string;
  path: string;
  previewUrl: string;
  systemType: string;
  mimeType: string;
  state: number;
  lockOwner: string;
  disabled: boolean;
  localeCode: string;
  translationSourceId: string;
}

export interface Item {
  id: string;
  label: string;
  contentTypeId: string;
  path: string;
  previewUrl: string;
  systemType: string;
  mimeType: string;
  state: number;
  lockOwner: string;
  disabled: boolean;
  localeCode: string;
  translationSourceId: string;
  creator: string;
  createdDate: string;
  modifier: string;
  lastModifiedDate: string;
  commitId: string;
  sizeInBytes: number;
}

