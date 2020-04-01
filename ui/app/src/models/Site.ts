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

import { Blueprint } from './Blueprint';

interface View {
  title: string;
  subtitle: string;
  btnText?: string;
}

export interface Views {
  [key: number]: View;
}

export interface SiteState {
  [key: string]: string | boolean | Blueprint | number | object;
  blueprint: Blueprint;
  siteId: string;
  siteIdExist: boolean;
  invalidSiteId: boolean;
  description: string;
  pushSite: boolean;
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
  submitted: boolean;
  selectedView: number;
  details: { blueprint: Blueprint, index: number};
  blueprintFields?: {
    [key: string]: string;
  };
  expanded: {
    basic: boolean,
    token: boolean,
    key: boolean
  }
}

export interface CreateSiteMeta {
  [key:string]: any;
  siteId: string;
  description?: string;
  singleBranch?: boolean;
  authenticationType?: string;
  blueprint?: string;
  useRemote?: boolean;
  repoRemoteName?: string;
  remoteUrl?: string;
  remoteName?: string;
  remoteBranch? : string;
  sandboxBranch? : string;
  remoteUsername?: string;
  remotePassword?: string;
  remoteToken?: string;
  remotePrivateKey?: string;
  createOption?: string;
  siteParams?: {
    [key: string]: string;
  }
}

export interface MarketplaceSite {
  [key:string]: any;
  siteId: string;
  blueprintId: string;
  blueprintVersion: {
    major: number,
    minor: number,
    patch: number,
  },
  siteParams?: {
    [key: string]: string;
  }
}

export interface Site {
  id: string;
  name: string;
  description: string;
}
