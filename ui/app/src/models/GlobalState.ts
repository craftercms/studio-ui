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

import { LookupTable } from './LookupTable';
import { User } from './User';
import { Site } from './Site';
import ContentType from './ContentType';
import { GuestData } from '../modules/Preview/previewContext';
import { WidthAndHeight } from './WidthAndHeight';
import Tools from './PreviewToolIDs';
import { ElasticParams, MediaItem } from "./Search";

interface APIError {
  code: string;
  message: string;
  remedialAction: string;
  documentationUrl: string;
}

export interface EntityState<T = any> {
  error: APIError;
  byId: LookupTable<T>;
  isFetching: boolean;

  [key: string]: any;
}

export interface PagedEntityState<T = any> extends EntityState<T> {
  page: any;
  pageNumber: number;
  count: number;
  query: ElasticParams;
}

export interface GlobalState {
  auth: {
    active: boolean;
  };
  user: User;
  sites: {
    active: string;
    byId: LookupTable<Site>;
  };
  contentTypes: EntityState<ContentType>;
  env: {
    AUTHORING_BASE: string;
    GUEST_BASE: string;
    XSRF_CONFIG_HEADER: string;
    XSRF_CONFIG_ARGUMENT: string;
    SITE_COOKIE: string;
    PREVIEW_LANDING_BASE: string;
  };
  preview: {
    currentUrl: string;
    computedUrl: string;
    showToolsPanel: boolean;
    selectedTool: Tools;
    previousTool: Tools;
    tools: Array<any>;
    hostSize: WidthAndHeight;
    guest: GuestData;
    assets: PagedEntityState<MediaItem>;
  }
}

export default GlobalState;
