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

import { get } from '../utils/ajax';
import { toQueryString } from '../utils/object';
import { map, pluck } from 'rxjs/operators';
import { DashboardPublishingPackage, LegacyDashboardItem, LegacyDeploymentHistoryResponse } from '../models/Dashboard';
import { Observable } from 'rxjs';
import { DetailedItem, PagedArray, PublishingStats, PublishingTargets, SandboxItem } from '../models';
import { Activity } from '../models/Activity';
import PaginationOptions from '../models/PaginationOptions';
import { createPagedArray } from '../utils/array';
import { prepareVirtualItemProps } from '../utils/content';

export function fetchLegacyGetGoLiveItems(
  site: string,
  sortBy?: string,
  sortAsc?: boolean,
  includeInProgress?: boolean,
  filterByNumber?: number
): Observable<LegacyDashboardItem> {
  const qs = toQueryString({
    site,
    ...(sortBy
      ? {
          sort: sortBy,
          ascending: sortAsc
        }
      : {}),
    ...(includeInProgress && { includeInProgress }),
    ...(filterByNumber && { num: filterByNumber })
  });
  return get(`/studio/api/1/services/api/1/workflow/get-go-live-items.json${qs}`).pipe(pluck('response'));
}

export function fetchLegacyUserActivities(
  site: string,
  user: string,
  sortBy: string,
  sortAsc: boolean,
  numResults: number,
  filterBy: string,
  excludeLive: boolean
): Observable<LegacyDashboardItem> {
  const qs = toQueryString({
    site,
    user,
    ...(sortBy
      ? {
          sort: sortBy,
          ascending: sortAsc
        }
      : {}),
    ...(numResults && { num: numResults }),
    ...(filterBy && { filterType: filterBy }),
    excludeLive
  });
  return get(`/studio/api/1/services/api/1/activity/get-user-activities.json${qs}`).pipe(pluck('response'));
}

export function fetchLegacyScheduledItems(
  site: string,
  sort: string,
  ascending: boolean,
  filterType: string
): Observable<LegacyDashboardItem> {
  const qs = toQueryString({
    site,
    sort,
    ascending,
    filterType
  });
  return get(`/studio/api/1/services/api/1/deployment/get-scheduled-items.json${qs}`).pipe(pluck('response'));
}

export function fetchLegacyDeploymentHistory(
  siteId: string,
  days: number,
  numResults: number,
  filterBy: string
): Observable<LegacyDeploymentHistoryResponse> {
  const qs = toQueryString({
    siteId,
    ...(days && { days }),
    ...(numResults && { num: numResults }),
    ...(filterBy && { filterType: filterBy })
  });
  return get(`/studio/api/2/publish/history.json${qs}`).pipe(pluck('response'));
}

interface FetchActivityOptions extends PaginationOptions {
  actions?: string[];
  usernames?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export function fetchActivity(siteId: string, options?: FetchActivityOptions): Observable<PagedArray<Activity>> {
  const qs = toQueryString({ siteId, ...options }, { arrayFormat: 'comma' });
  return get(`/studio/api/2/dashboard/activity${qs}`).pipe(
    map(({ response: { activities, total, offset, limit } }) =>
      Object.assign(activities, {
        total,
        offset,
        limit
      })
    )
  );
}

interface FetchMyActivityOptions extends Omit<FetchActivityOptions, 'usernames'> {}

export function fetchMyActivity(siteId: string, options?: FetchMyActivityOptions): Observable<PagedArray<Activity>> {
  const qs = toQueryString({ siteId, ...options });
  return get(`/studio/api/2/dashboard/activity/me${qs}`).pipe(
    map(({ response: { activities, total, offset, limit } }) =>
      Object.assign(activities, {
        total,
        offset,
        limit
      })
    )
  );
}

export interface FetchPendingApprovalOptions extends PaginationOptions {
  itemType?: string;
  sort?: string;
}

export function fetchPendingApproval(
  siteId: string,
  options?: FetchPendingApprovalOptions
): Observable<PagedArray<DetailedItem>> {
  const qs = toQueryString({ siteId, ...options });
  return get(`/studio/api/2/dashboard/content/pending_approval${qs}`).pipe(
    map(({ response }) =>
      createPagedArray(
        response.publishingItems.map((item) => prepareVirtualItemProps(item)),
        response
      )
    )
  );
}

export function fetchPendingApprovalPackageItems(siteId: string, packageId: number): Observable<SandboxItem[]> {
  const qs = toQueryString({ siteId });
  return get(`/studio/api/2/dashboard/content/pending_approval/${packageId}${qs}`).pipe(
    pluck('response', 'publishingPackageItems'),
    map((items) => items.map((item) => prepareVirtualItemProps(item)))
  );
}

export interface FetchUnpublishedOptions extends PaginationOptions {
  itemType?: string;
  sort?: string;
}

export function fetchUnpublished(
  siteId: string,
  options: FetchUnpublishedOptions
): Observable<PagedArray<SandboxItem>> {
  const qs = toQueryString({ siteId, ...options });
  return get(`/studio/api/2/dashboard/content/unpublished${qs}`).pipe(
    map(({ response }) =>
      createPagedArray(
        response.unpublishedItems.map((item) => prepareVirtualItemProps(item)),
        response
      )
    )
  );
}

export interface FetchScheduledOptions extends PaginationOptions {
  publishingTarget?: PublishingTargets;
  approver?: string;
  dateFrom?: string;
  dateTo?: string;
  itemType?: string;
  sort?: string;
}

export function fetchScheduled(siteId: string, options: FetchScheduledOptions): Observable<PagedArray<DetailedItem>> {
  const qs = toQueryString({ siteId, ...options });
  return get(`/studio/api/2/dashboard/publishing/scheduled${qs}`).pipe(
    map(({ response }) =>
      createPagedArray(
        response.publishingItems.map((item) => prepareVirtualItemProps(item)),
        response
      )
    )
  );
}

export function fetchScheduledPackageItems(siteId: string, packageId: number): Observable<SandboxItem[]> {
  const qs = toQueryString({ siteId });
  return get(`/studio/api/2/dashboard/publishing/scheduled/${packageId}${qs}`).pipe(
    pluck('response', 'publishingPackageItems'),
    map((items) => items.map((item) => prepareVirtualItemProps(item)))
  );
}

export function fetchPublishingHistory(
  siteId: string,
  options: Partial<FetchScheduledOptions>
): Observable<PagedArray<DashboardPublishingPackage>> {
  const qs = toQueryString({ siteId, ...options });
  return get(`/studio/api/2/dashboard/publishing/history${qs}`).pipe(
    map(({ response }) => createPagedArray(response.publishingPackages, response))
  );
}

export function fetchPublishingHistoryPackageItems(
  siteId: string,
  packageId: string,
  options?: PaginationOptions
): Observable<PagedArray<SandboxItem>> {
  const qs = toQueryString({ siteId, ...options });
  return get(`/studio/api/2/dashboard/publishing/history/${packageId}${qs}`).pipe(
    map(({ response }) =>
      createPagedArray(
        response.publishingPackageItems.map((item) => prepareVirtualItemProps(item)),
        response
      )
    )
  );
}

export interface ExpiredItem {
  itemName: string;
  itemPath: string;
  expiredDateTime: string;
  sandboxItem: SandboxItem;
}

export function fetchExpired(siteId: string, options?: PaginationOptions): Observable<ExpiredItem[]> {
  const qs = toQueryString({ siteId, ...options });
  return get(`/studio/api/2/dashboard/content/expired${qs}`).pipe(
    pluck('response', 'items'),
    map((items) =>
      items.map((item) => ({
        ...item,
        sandboxItem: prepareVirtualItemProps(item.sandboxItem)
      }))
    )
  );
}

interface FetchExpiringOptions extends PaginationOptions {
  dateFrom: string;
  dateTo: string;
}

export function fetchExpiring(siteId: string, options: FetchExpiringOptions): Observable<ExpiredItem[]> {
  const qs = toQueryString({ siteId, ...options });
  return get(`/studio/api/2/dashboard/content/expiring${qs}`).pipe(
    pluck('response', 'items'),
    map((items) =>
      items.map((item) => ({
        ...item,
        sandboxItem: prepareVirtualItemProps(item.sandboxItem)
      }))
    )
  );
}

export function fetchPublishingStats(siteId: string, days: number): Observable<PublishingStats> {
  const qs = toQueryString({ siteId, days });
  return get(`/studio/api/2/dashboard/publishing/stats${qs}`).pipe(pluck('response', 'publishingStats'));
}
