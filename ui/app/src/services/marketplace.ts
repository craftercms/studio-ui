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

import { get, postJSON } from '../utils/ajax';
import { MarketplaceSite } from '../models/Site';
import { map, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MarketplacePlugin, Version } from '../models/MarketplacePlugin';
import { toQueryString } from '../utils/object';
import { PagedArray } from '../models/PagedArray';
import ApiResponse from '../models/ApiResponse';

export function fetchBlueprints(options?: { type?: string; limit?: number; showIncompatible?: boolean }) {
  const params = {
    type: 'blueprint',
    limit: 1000,
    showIncompatible: true,
    ...options
  };

  return get(
    `/studio/api/2/marketplace/search?type=${params.type}&limit=${params.limit}&showIncompatible=${params.showIncompatible}`
  );
}

export function fetchMarketplacePlugins(
  type: string,
  keywords?: string,
  options?: {
    limit?: number;
    showIncompatible?: boolean;
  }
): Observable<PagedArray<MarketplacePlugin>> {
  const qs = toQueryString({ type, keywords, ...options });
  return get(`/studio/api/2/marketplace/search${qs}`).pipe(
    pluck('response'),
    map(({ plugins, offset, total, limit }) => Object.assign(plugins, { total, offset, limit }))
  );
}

export function installMarketplacePlugin(
  siteId: string,
  pluginId: string,
  pluginVersion: Version
): Observable<ApiResponse> {
  return postJSON('/studio/api/2/marketplace/install', { siteId, pluginId, pluginVersion }).pipe(pluck('response'));
}

export function fetchInstalledMarketplacePlugins(siteId: string) {
  return get(`/studio/api/2/marketplace/installed?siteId=${siteId}`).pipe(pluck('response', 'plugins'));
}

export function createSite(site: MarketplaceSite) {
  return postJSON('/studio/api/2/sites/create_site_from_marketplace', site);
}
