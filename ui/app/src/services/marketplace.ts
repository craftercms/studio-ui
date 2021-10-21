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
import { map, mapTo, pluck, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MarketplacePlugin, MarketplacePluginVersion } from '../models/MarketplacePlugin';
import { pluckProps, toQueryString } from '../utils/object';
import { PagedArray } from '../models/PagedArray';
import { PluginRecord } from '../models/Plugin';
import { Api2BulkResponseFormat, Api2ResponseFormat } from '../models/ApiResponse';
import { fetchItemsByPath } from './content';
import { SandboxItem } from '../models/Item';

export function fetchBlueprints(options?: {
  type?: string;
  limit?: number;
  showIncompatible?: boolean;
}): Observable<PagedArray<MarketplacePlugin>> {
  return fetchMarketplacePlugins({
    limit: 1000,
    showIncompatible: true,
    ...options,
    type: 'blueprint'
  });
}

interface MarketplacePluginSearchOptions {
  type: string;
  limit: number;
  keywords: string;
  showIncompatible: boolean;
}

export function fetchMarketplacePlugins(
  options: Partial<MarketplacePluginSearchOptions>
): Observable<PagedArray<MarketplacePlugin>> {
  const qs = toQueryString(options);
  return get<
    Api2BulkResponseFormat<{
      plugins: MarketplacePlugin[];
    }>
  >(`/studio/api/2/marketplace/search${qs}`).pipe(
    map((response) =>
      Object.assign(response.response.plugins, pluckProps(response.response, 'limit', 'total', 'offset'))
    )
  );
}

export function installMarketplacePlugin(
  siteId: string,
  pluginId: string,
  pluginVersion: MarketplacePluginVersion
): Observable<boolean> {
  return postJSON('/studio/api/2/marketplace/install', { siteId, pluginId, pluginVersion }).pipe(mapTo(true));
}

export function uninstallMarketplacePlugin(
  siteId: string,
  pluginId: string,
  force: boolean = false
): Observable<boolean> {
  return postJSON('/studio/api/2/marketplace/remove', {
    siteId,
    pluginId,
    force
  }).pipe(mapTo(true));
}

export function fetchMarketplacePluginUsage(siteId: string, pluginId: string): Observable<SandboxItem[]> {
  const qs = toQueryString({ siteId, pluginId });
  return get(`/studio/api/2/marketplace/usage${qs}`).pipe(
    pluck('response', 'items'),
    switchMap((items) => (items.length === 0 ? of(items) : fetchItemsByPath(siteId, items)))
  );
}

export function fetchInstalledMarketplacePlugins(siteId: string): Observable<PluginRecord[]> {
  return get<Api2ResponseFormat<{ plugins: PluginRecord[] }>>(
    `/studio/api/2/marketplace/installed?siteId=${siteId}`
  ).pipe(pluck('response', 'plugins'));
}

export function createSite(site: MarketplaceSite): Observable<boolean> {
  return postJSON('/studio/api/2/sites/create_site_from_marketplace', site).pipe(mapTo(true));
}
