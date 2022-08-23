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

import { SandboxItem } from '../../models';

export interface Conflict {
  conflictingPath: string;
  resolvedPath: string;
}

export interface RecycleBinPackage {
  id: number;
  comment: string;
  numOfItems: number;
  published: string;
  deletedBy: string;
  dateDeleted: string;
  items: SandboxItem[];
  conflicts: Conflict[];
}

export interface RecycleBinProps {
  embedded?: boolean;
}

export interface RecycleBinGridUIProps {
  packages: RecycleBinPackage[];
  pageSize: number;
  selectedPackages: number[];
  setSelectedPackages(packages: number[]): void;
  setPageSize(size: number): void;
  onOpenPackageDetails(recycleBinPackage: RecycleBinPackage): void;
}
