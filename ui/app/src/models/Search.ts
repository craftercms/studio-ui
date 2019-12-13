/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export interface ElasticParams {
  query: string;
  keywords: string;
  offset: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  filters:  any;
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
  multiple: boolean
  name: string;
  range: boolean;
  values: {
    [key: string]: any;
  }
}
