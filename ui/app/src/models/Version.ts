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

import { LegacyItem } from './Item';
import ApiResponse from './ApiResponse';

export interface LegacyVersion {
  lastModifiedDate: string;
  lastModifier: string;
  versionNumber: string;
  comment: string;
  contentItem: any;
}

export interface VersionsResponse {
  item: LegacyItem;
  versions: LegacyVersion[];
}

export interface FetchContentVersion {
  path: string;
  versionNumber: string;
}

export interface VersionsStateProps {
  byId: string;
  path: string;
  environment?: string;
  module?: string;
  error: ApiResponse;
  isFetching: Boolean;
  current: string;
  versions: LegacyVersion[];
  allVersions: LegacyVersion[];
  count: number;
  page: number;
  limit: number;
  selected: string[];
  previous: string;
  compareVersionsBranch: any;
}

export interface StudioVersion {
  javaVendor: string;
  javaVersion: string;
  javaVm: string;
  osArch: string;
  osName: string;
  osVersion: string;
  packageBuild: string;
  packageBuildDate: string;
  packageName: string;
  packageVersion: string;
}
