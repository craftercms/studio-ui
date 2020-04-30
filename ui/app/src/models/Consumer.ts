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

import PaginationOptions from './PaginationOptions';
import { LookupTable } from './LookupTable';
import ApiResponse from './ApiResponse';
import { SandboxItem } from './Item';

export interface SandBoxItemConsumer extends PaginationOptions {
  byId: LookupTable<SandboxItem>;
  isFetching: boolean;
  error: ApiResponse;
  items: string[];
  leafs: string[];
  rootPath: string;
  path: string;
  keywords?: string;
  pageNumber?: number;
  breadcrumb?: SandboxItem[];
  selectedItem?: string;
}
