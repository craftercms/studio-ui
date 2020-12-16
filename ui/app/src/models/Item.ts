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

type States =
  | 'new'
  | 'modified'
  | 'deleted'
  | 'userLocked'
  | 'systemProcessing'
  | 'inWorkflow'
  | 'scheduled'
  | 'staged'
  | 'live'
  | 'translationUpToDate'
  | 'translationPending'
  | 'translationInProgress'
  | 'submitted';

export interface BaseItem {
  id: string;
  label: string;
  contentTypeId: string;
  path: string;
  previewUrl: string;
  systemType: string;
  mimeType: string;
  state: number;
  stateMap: { [key in States]?: boolean };
  lockOwner: string;
  disabled: boolean;
  localeCode: string;
  translationSourceId: string;
}

interface SandboxEnvProps {
  creator: string;
  createdDate: string;
  modifier: string;
  lastModifiedDate: string;
  commitId: string;
  sizeInBytes: number;
}

interface PublishEnvProps {
  lastScheduledDate: string;
  lastPublishedDate: string;
  publisher: string;
  commitId: string;
}

export interface LocalizationItem extends BaseItem {}

export interface SandboxItem extends BaseItem, SandboxEnvProps {}

export interface DetailedItem extends BaseItem {
  sandbox: SandboxEnvProps;
  staging: PublishEnvProps;
  live: PublishEnvProps;
}

export interface AuditDashboardItem {
  siteId: string;
  actor: string;
  operation: string;
  operationTimestamp: string; // datetime
  target: string;
}

export interface PublishingDashboardItem {
  siteId: string;
  label: string;
  path: string;
  publisher: string;
  publishedDate: string; // datetime
  environment: string;
}

export interface DashboardItem {}

export interface LegacyItem {
  uri: string;
  name: string;
  browserUri: string;
  contentType: string;
  internalName: string;
  children: LegacyItem[];
  [prop: string]: any;
}

export interface PasteItem {
  path: string;
  children?: PasteItem[];
}
