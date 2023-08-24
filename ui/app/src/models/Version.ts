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

import { DetailedItem } from './Item';
import ApiResponse from './ApiResponse';
import ContentInstance from './ContentInstance';
import Person from './Person';

export interface ItemVersion {
  author: Person;
  committer: string;
  comment: string;
  modifiedDate: string;
  oldPath: string;
  path: string;
  revertible: boolean;
  versionNumber: string;
}

export interface FetchContentVersion {
  path: string;
  versionNumber: string;
}

export interface CompareVersionsBranch {
  compareVersions: ContentInstance[];
  isFetching: Boolean;
  error: ApiResponse;
}

export interface VersionsStateProps {
  byId: string;
  item: DetailedItem;
  rootPath?: string;
  isConfig?: boolean;
  environment?: string;
  module?: string;
  error: ApiResponse;
  isFetching: Boolean;
  current: string;
  versions: ItemVersion[];
  allVersions: ItemVersion[];
  count: number;
  page: number;
  limit: number;
  selected: string[];
  previous: string;
  compareVersionsBranch: CompareVersionsBranch;
}
