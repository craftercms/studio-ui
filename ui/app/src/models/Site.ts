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

import { MarketplacePlugin } from './MarketplacePlugin';
import { ReactNode } from 'react';

interface View {
  title: ReactNode;
  subtitle?: ReactNode;
  btnText?: ReactNode;
}

export interface Views {
  [key: number]: View;
}

export interface SiteBaseState {
  siteId: string;
  siteName: string;
  siteIdExist: boolean;
  siteNameExist: boolean;
  invalidSiteId: boolean;
  description: string;
  submitted: boolean;
  selectedView: number;
  gitBranch: string;
}

export interface SiteState extends SiteBaseState {
  blueprint: MarketplacePlugin;
  useRemote: boolean;
  createAsOrphan: boolean;
  repoUrl: string;
  repoAuthentication: string;
  repoRemoteBranch: string;
  sandboxBranch: string;
  repoRemoteName: string;
  repoPassword: string;
  repoUsername: string;
  repoToken: string;
  repoKey: string;
  details: { blueprint: MarketplacePlugin; index: number };
  blueprintFields?: {
    [key: string]: string;
  };
  expanded: {
    basic: boolean;
    token: boolean;
    key: boolean;
  };
  showIncompatible: boolean;

  [key: string]: string | boolean | MarketplacePlugin | number | object;
}

export interface DuplicateSiteState extends SiteBaseState {
  sourceSiteId: string;
  blobStoresReadOnly?: boolean;
}

export interface CreateSiteMeta {
  siteId: string;
  siteName?: string;
  description?: string;
  singleBranch?: boolean;
  authenticationType?: string;
  blueprint?: string;
  useRemote?: boolean;
  repoRemoteName?: string;
  remoteUrl?: string;
  remoteName?: string;
  remoteBranch?: string;
  sandboxBranch?: string;
  remoteUsername?: string;
  remotePassword?: string;
  remoteToken?: string;
  remotePrivateKey?: string;
  createOption?: string;
  siteParams?: {
    [key: string]: string;
  };
  createAsOrphan: boolean;
}

export interface DuplicateSiteMeta
  extends Pick<CreateSiteMeta, 'siteId' | 'siteName' | 'description' | 'sandboxBranch'> {
  sourceSiteId: string;
}

export interface MarketplaceSite {
  siteId: string;
  name?: string;
  blueprintId: string;
  blueprintVersion: {
    major: number;
    minor: number;
    patch: number;
  };
  siteParams?: {
    [key: string]: string;
  };
  sandboxBranch?: string;
  description: string;
}

export interface Site {
  id: string;
  uuid: string;
  name: string;
  description: string;
  imageUrl: string;
  state?: 'INITIALIZING' | 'READY' | 'DELETING' | 'DELETED';
}

export interface BackendSite {
  siteId: string;
  uuid: string;
  name: string;
  desc: string;
  state: 'INITIALIZING' | 'READY' | 'DELETING' | 'DELETED';
}

export interface LegacySite {
  deleted: number;
  description: string;
  id: number;
  lastCommitId: string;
  lastSyncedGitlogCommitId: string;
  lastVerifiedGitlogCommitId: string;
  liveUrl: string;
  name: string;
  publishedRepoCreated: number;
  publishingEnabled: number;
  publishingLockHeartbeat: string;
  publishingLockOwner: string;
  publishingStatus: string;
  sandboxBranch: string;
  siteDeleted: boolean;
  siteId: string;
  sitePublishedRepoCreated: boolean;
  siteUuid: string;
  state: string;
  blobStores: Array<{
    id: string;
    type: string;
    pattern: string;
    mappings: Array<{
      publishingTarget: string;
      storeTarget: string;
      prefix: string;
    }>;
  }>;
}

export interface Action {
  type: 'CREATE' | 'RENAME' | 'MOVE' | 'COPY';
  source?: string;
  target: string;
  recursive?: boolean;
  contentMetadata?: {
    fileSize?: number;
    contentType?: string;
  };
}

export interface ContentValidationResult {
  type: string;
  target: string;
  allowed: boolean;
  modifiedValue: string;
}
