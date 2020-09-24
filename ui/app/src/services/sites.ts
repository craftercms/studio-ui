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
import { CreateSiteMeta, Site } from '../models/Site';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PagedArray } from '../models/PagedArray';
import { PaginationOptions } from '../models/PaginationOptions';

export function fetchBlueprints() {
  return get('/studio/api/2/sites/available_blueprints');
}

export function fetchSites(paginationOptions?: PaginationOptions): Observable<PagedArray<Site>> {
  const options: PaginationOptions = Object.assign({
    limit: 100,
    offset: 0
  }, paginationOptions || {});
  return get(`/studio/api/2/users/me/sites?limit=${options.limit}&offset=${options.offset}`).pipe(
    map(({ response }) => Object.assign(
      response.sites.map(site => ({
        id: site.siteId,
        name: site.siteId,    // TODO: need to get site.name when API is ready
        description: site.desc
      })),
      {
        limit: response.limit,
        offset: response.offset,
        total: response.total
      }
    ))
  );
}

export function createSite(site: CreateSiteMeta) {
  return postJSON('/studio/api/1/services/api/1/site/create.json', site);
}

export function deleteSite(id: string) {
  return postJSON('/studio/api/1/services/api/1/site/delete-site.json', { siteId: id });
}

export function checkHandleAvailability(name: string) {
  return get(`/studio/api/1/services/api/1/site/exists.json?site=${name}`);
}

export default {
  fetchBlueprints,
  fetchSites,
  createSite,
  checkHandleAvailability
};
