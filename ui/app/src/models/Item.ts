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

import { SystemType } from './SystemType';

export type ItemStates =
  | 'new'
  | 'modified'
  | 'deleted'
  | 'locked'
  | 'systemProcessing'
  | 'submitted'
  | 'scheduled'
  | 'publishing'
  | 'submittedToStaging'
  | 'submittedToLive'
  | 'staged'
  | 'live'
  | 'disabled'
  | 'translationUpToDate'
  | 'translationPending'
  | 'translationInProgress';

export type ItemActions =
  | 'view'
  | 'copy'
  | 'history'
  | 'dependencies'
  | 'requestPublish'
  | 'createContent'
  | 'paste'
  | 'edit'
  | 'unlock'
  | 'rename'
  | 'cut'
  | 'upload'
  | 'duplicate'
  | 'changeContentType'
  | 'revert'
  | 'editController'
  | 'editTemplate'
  | 'createFolder'
  | 'delete'
  | 'deleteController'
  | 'deleteTemplate'
  | 'publish'
  | 'approvePublish'
  | 'schedulePublish'
  | 'rejectPublish';

export type VirtualItemActions = 'preview';

export type AssessRemovalItemActions =
  | 'editCode'
  | 'viewCode'
  | 'viewImage'
  | 'duplicateAsset'
  | 'createTemplate'
  | 'createController';

export type AllItemActions = ItemActions | VirtualItemActions | AssessRemovalItemActions;

export type ItemStateMap = { [key in ItemStates]: boolean };

export type ItemActionsMap = { [key in ItemActions]: boolean };

export interface BaseItem {
  id: number;
  label: string;
  parentId: number;
  contentTypeId: string;
  path: string;
  previewUrl: string;
  systemType: SystemType;
  mimeType: string;
  state: number;
  stateMap: ItemStateMap;
  lockOwner: string;
  disabled: boolean;
  localeCode: string;
  translationSourceId: string;
  availableActions: number;
  availableActionsMap: ItemActionsMap;
}

interface SandboxEnvProps {
  creator: string;
  dateCreated: string;
  modifier: string;
  dateModified: string;
  commitId: string;
  sizeInBytes: number;
  expiresOn: string;
}

interface PublishEnvProps {
  dateScheduled: string;
  datePublished: string;
  publisher: string;
  commitId: string;
  expiresOn: string;
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
  user: string;
  userFirstName: string;
  userLastName: string;
  [prop: string]: any;
}

export interface PasteItem {
  path: string;
  children?: PasteItem[];
}
