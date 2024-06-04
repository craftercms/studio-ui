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

import { LookupTable } from './LookupTable';
import ContentInstance from './ContentInstance';
import { PaginationOptions } from './PaginationOptions';

export interface ElasticParams extends PaginationOptions {
  query?: string;
  path?: string;
  keywords: string;
  sortBy?: string;
  sortOrder?: string;
  orOperator?: boolean;
  filters: any;
}

export interface Preview {
  url: string;
  type: string;
  name: string;
  open: boolean;
  data: any;
}

export interface MediaItem {
  lastModified: string;
  lastModifier: string;
  mimeType: string;
  name: string;
  path: string;
  previewUrl: string;
  size: number;
  snippets: string;
  type: string;
}

export interface Filter {
  name: string;
  value: string | string[] | any;
}

export interface Facet {
  date: boolean;
  multiple: boolean;
  name: string;
  range: boolean;
  values: {
    [key: string]: any;
  };
}

export interface SearchItem {
  path: string;
  name: string;
  type: string;
  mimeType: string;
  previewUrl: string;
  lastModifier: string;
  lastModified: string;
  size: number;
  snippets: any;
  additionalFields?: Record<string, unknown>;
}

export interface SearchFacet {
  name: string;
  range: boolean;
  date: boolean;
  multiple: boolean;
  values: any;
}

export interface SearchResult {
  total: number;
  items: Array<SearchItem>;
  facets: Array<SearchFacet>;
}

export interface ComponentsContentTypeParams extends PaginationOptions {
  keywords?: string;
}

export interface ContentInstancePage {
  count: number;
  lookup: LookupTable<ContentInstance>;
}
