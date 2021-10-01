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

import { errorSelectorApi1, get, post, postJSON } from '../utils/ajax';
import { Observable } from 'rxjs';
import { catchError, map, mapTo, pluck } from 'rxjs/operators';
import { LegacyItem } from '../models/Item';
import { toQueryString } from '../utils/object';
import { PublishingStatus, PublishingTarget } from '../models/Publishing';

export function fetchPackages(
  siteId: string,
  filters: Partial<{ environment: string; path: string; states: string; offset: number; limit: number }>
) {
  let qs = toQueryString({
    siteId,
    ...filters
  });
  return get(`/studio/api/2/publish/packages${qs}`);
}

export function fetchPackage(siteId: string, packageId: string) {
  return get(`/studio/api/2/publish/package?siteId=${siteId}&packageId=${packageId}`);
}

export function cancelPackage(siteId: string, packageIds: any) {
  return postJSON('/studio/api/2/publish/cancel', { siteId, packageIds });
}

export function fetchPublishingTargets(site: string): Observable<Array<PublishingTarget>> {
  return get(`/studio/api/1/services/api/1/deployment/get-available-publishing-channels.json?site_id=${site}`).pipe(
    pluck('response', 'availablePublishChannels')
  );
}

export interface GoLiveResponse {
  status: number;
  commitId: string;
  item: LegacyItem;
  invalidateCache: boolean;
  success: boolean;
  message: string;
}

export function submitToGoLive(siteId: string, user: string, data): Observable<GoLiveResponse> {
  return postJSON(
    `/studio/api/1/services/api/1/workflow/submit-to-go-live.json?site=${siteId}&user=${user}`,
    data
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function goLive(siteId: string, user: string, data): Observable<GoLiveResponse> {
  return postJSON(`/studio/api/1/services/api/1/workflow/go-live.json?site=${siteId}&user=${user}`, data).pipe(
    pluck('response'),
    catchError(errorSelectorApi1)
  );
}

export function reject(siteId: string, items: string[], comment: string): Observable<boolean> {
  return postJSON(`/studio/api/2/workflow/reject`, {
    siteId,
    items,
    comment
  }).pipe(mapTo(true));
}

export function fetchStatus(siteId: string): Observable<PublishingStatus> {
  return get(`/studio/api/2/publish/status?siteId=${siteId}`).pipe(
    pluck('response', 'publishingStatus'),
    map((status) => ({
      ...status,
      // Address backend sending status as null.
      status: status.status ?? '',
      publishingTarget: status.environment,
      // Parse and express the formatted date if present.
      message:
        status.message?.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/, (match) =>
          new Intl.DateTimeFormat(window?.navigator?.language ?? 'en-US', {
            // @ts-ignore - dateStyle & timeStyle props not typed yet.
            dateStyle: 'full',
            timeStyle: 'long'
          }).format(new Date(match))
        ) ?? ''
    }))
  );
}

export function start(siteId: string): Observable<true> {
  return postJSON('/studio/api/1/services/api/1/publish/start.json', { site_id: siteId }).pipe(mapTo(true));
}

export function stop(siteId: string): Observable<true> {
  return postJSON('/studio/api/1/services/api/1/publish/stop.json', { site_id: siteId }).pipe(mapTo(true));
}

export function bulkGoLive(siteId: string, path: string, environment: string, comment: string): Observable<true> {
  const qs = toQueryString({
    site_id: siteId,
    path,
    environment: encodeURIComponent(environment),
    comment
  });
  return post(`/studio/api/1/services/api/1/deployment/bulk-golive.json${qs}`).pipe(mapTo(true));
}

export function publishByCommits(
  siteId: string,
  commitIds: string[],
  environment: string,
  comment: string
): Observable<true> {
  return postJSON('/studio/api/1/services/api/1/publish/commits.json', {
    site_id: siteId,
    commit_ids: commitIds,
    environment,
    comment
  }).pipe(mapTo(true));
}

export function clearLock(siteId: string): Observable<boolean> {
  return postJSON('/studio/api/2/publish/clear_lock', { siteId }).pipe(mapTo(true));
}
