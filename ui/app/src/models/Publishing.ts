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

export interface Package {
  id: string;
  siteId: string;
  schedule: string;
  approver: string;
  state: string;
  environment: string;
  comment: string;
}

export interface Selected {
  [keys: string]: boolean;
}

export interface File {
  contentTypeClass: string;
  mimeType: string;
  path: string;
}

export interface CurrentFilters {
  environment: string;
  path: string;
  state: Array<string>;
  limit: number;
  page: number;
}

export interface PublishingStatus {
  enabled: boolean;
  status: 'ready' | 'processing' | 'publishing' | 'queued' | 'stopped' | 'error';
  lockOwner: string;
  lockTTL: string;
  publishingTarget: string;
  submissionId: string;
  numberOfItems: number;
  totalItems: number;
}

export interface PublishFormData {
  path?: string;
  commitIds?: string;
  comment: string;
  environment: string;
}

export type PublishOnDemandMode = 'studio' | 'git';

export interface PublishingTarget {
  name: string;
  order: number;
  publish: boolean;
  updateStatus: boolean;
}
