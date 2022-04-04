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

import { LegacyItem } from './Item';
import Person from './Person';
import { PublishingTargets } from './Publishing';

export interface DashboardPublishingPackage {
  id: string;
  label: string;
  comment: string;
  submitter: Person;
  size: number;
  publishingTarget: PublishingTargets;
  schedule: string;
}

interface LegacyDeploymentHistoryDocument {
  children: LegacyItem[];
  endpoint: string;
  internalName: string;
  numOfChildren: number;
}

export interface LegacyDashboardItem {
  total: number;
  sortedBy: boolean;
  ascending: 'true' | 'false';
  documents: LegacyItem[];
}

export interface LegacyDeploymentHistoryResponse {
  total: number;
  offset: number;
  limit: number;
  documents: LegacyDeploymentHistoryDocument[];
}

export type LegacyDeploymentHistoryType = 'page' | 'component' | 'document' | 'all';

export interface LegacyDashboardPreferences {
  filterBy?: string;
  numItems?: number;
  expanded?: boolean;
  showUnpublished?: boolean;
  excludeLiveItems?: boolean;
}
