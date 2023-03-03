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

import LookupTable from './LookupTable';

export type PublishingTargets = 'live' | 'staging';

export interface Package {
  id: string;
  siteId: string;
  schedule: string;
  approver: string;
  state: string;
  environment: string;
  comment: string;
}

export type Selected = LookupTable<boolean>;

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

export type PublishingStatusCodes =
  | 'ready'
  | 'processing'
  | 'publishing'
  | 'queued'
  | 'stopped'
  | 'error'
  | 'readyWithErrors';

export interface PublishingStatus {
  enabled: boolean;
  status: PublishingStatusCodes;
  lockOwner: string;
  lockTTL: string;
  published: boolean;
  publishingTarget: string;
  submissionId: string;
  numberOfItems: number;
  totalItems: number;
}

export interface PublishFormData {
  path?: string;
  commitIds?: string;
  comment: string;
  publishingTarget: string;
}

export type PublishOnDemandMode = 'studio' | 'git' | 'everything';

export interface PublishingTarget {
  name: string;
  order: number;
}

export interface PublishingParams {
  items: string[];
  publishingTarget: string;
  optionalDependencies?: string[];
  schedule?: string;
  comment?: string;
  sendEmailNotifications?: boolean;
}

export interface PublishingStats {
  numberOfPublishes: number;
  numberOfNewAndPublishedItems: number;
  numberOfEditedAndPublishedItems: number;
}
