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

import { get, postJSON } from '../utils/ajax';
import { Action, BackendSite, ContentValidationResult, CreateSiteMeta, LegacySite, Site } from '../models/Site';
import { map, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PagedArray } from '../models/PagedArray';
import { PaginationOptions } from '../models/PaginationOptions';
import { MarketplacePlugin } from '../models/MarketplacePlugin';
import { underscore } from '../utils/string';
import { Api2BulkResponseFormat, Api2ResponseFormat } from '../models/ApiResponse';
import { FetchPublishingTargetsResponse } from './publishing';

interface BuiltInBlueprint {
  descriptorVersion: string;
  plugin: MarketplacePlugin;
}

export function fetchBlueprints(): Observable<BuiltInBlueprint[]> {
  return get<
    Api2ResponseFormat<{
      blueprints: BuiltInBlueprint[];
    }>
  >('/studio/api/2/sites/available_blueprints').pipe(pluck('response', 'blueprints'));
}

export function fetchAll(paginationOptions?: PaginationOptions): Observable<PagedArray<Site>> {
  const options: PaginationOptions = Object.assign(
    {
      limit: 100,
      offset: 0
    },
    paginationOptions || {}
  );
  return get<
    Api2BulkResponseFormat<{
      sites: BackendSite[];
    }>
  >(`/studio/api/2/users/me/sites?limit=${options.limit}&offset=${options.offset}`).pipe(
    map(({ response }) =>
      Object.assign(
        response.sites.map((site) => ({
          id: site.siteId,
          uuid: site.uuid,
          name: site.name ?? site.siteId,
          description: site.desc,
          imageUrl: `/.crafter/screenshots/default.png?crafterSite=${site.siteId}`,
          state: site.state
        })),
        {
          limit: response.limit,
          offset: response.offset,
          total: response.total
        }
      )
    )
  );
}

export function create(site: CreateSiteMeta): Observable<Site> {
  let api1Params: any = {};
  Object.entries(site).forEach(([key, value]) => {
    if (key === 'siteName') {
      api1Params.name = value;
    } else {
      api1Params[underscore(key)] = value;
    }
  });
  return postJSON('/studio/api/1/services/api/1/site/create.json', api1Params).pipe(
    pluck('response'),
    map(() => ({
      id: site.siteId,
      name: site.siteName,
      description: site.description ?? '',
      uuid: null,
      imageUrl: `/.crafter/screenshots/default.png?crafterSite=${site.siteId}`
    }))
  );
}

export function trash(id: string): Observable<boolean> {
  return postJSON('/studio/api/1/services/api/1/site/delete-site.json', { siteId: id }).pipe(
    pluck('response'),
    map(() => true)
  );
}

export function update(site: Omit<Site, 'uuid' | 'imageUrl'>): Observable<Api2ResponseFormat<{}>> {
  return postJSON<Api2ResponseFormat<{}>>(`/studio/api/2/sites/${site.id}`, {
    name: site.name,
    description: site.description
  }).pipe(pluck('response'));
}

export function exists(siteId: string): Observable<boolean> {
  return get<{ exists: boolean }>(`/studio/api/1/services/api/1/site/exists.json?site=${siteId}`).pipe(
    pluck('response', 'exists')
  );
}

export function validateActionPolicy(site: string, action: Action): Observable<ContentValidationResult>;
export function validateActionPolicy(site: string, actions: Action[]): Observable<ContentValidationResult[]>;
export function validateActionPolicy(
  site: string,
  action: Action | Action[]
): Observable<ContentValidationResult | ContentValidationResult[]> {
  const multi = Array.isArray(action);
  const actions = multi ? action : [action];
  const toPluck = ['response', 'results', !multi && '0'].filter(Boolean) as ['response', 'results', 0?];
  return postJSON<Api2ResponseFormat<{ results: ContentValidationResult[] }>>(
    `/studio/api/2/sites/${site}/policy/validate`,
    {
      actions
    }
  ).pipe(pluck(...toPluck));
}

export function fetchLegacySite(siteId: string): Observable<LegacySite> {
  return get(`/studio/api/1/services/api/1/site/get.json?site_id=${siteId}`).pipe(pluck('response'));
}

export function hasInitialPublish(siteId: string): Observable<boolean> {
  return get<FetchPublishingTargetsResponse>(`/studio/api/2/publish/available_targets?siteId=${siteId}`).pipe(
    pluck('response', 'published')
  );
}
