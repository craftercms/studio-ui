/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

export interface Repository {
  name: string;
  url: string;
  fetch: string;
  push_url: string;
  branches: string[];
  reachable: boolean;
  unreachableReason: string;
  removable: boolean;
}

export interface RepositoryStatus {
  conflicting: string[];
  uncommittedChanges: string[];
  clean: boolean;
}

export interface FileDiff {
  diff: string;
  studioVersion: string;
  remoteVersion: string;
}

export interface Remote {
  siteId: string;
  remoteName: string;
  remoteUrl: string;
  authenticationType: string;
  remoteUsername: string;
  remotePassword: string;
  remoteToken: string;
  remotePrivateKey: string;
  remoteBranch?: string;
  mergeStrategy?: string;
}
