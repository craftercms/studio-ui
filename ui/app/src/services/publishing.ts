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

import { get, post, postJSON } from '../utils/ajax';
import { Observable } from 'rxjs';
import { mapTo, pluck } from 'rxjs/operators';

export function fetchPackages(siteId: string, filters: any) {
  let queryS = new URLSearchParams(filters).toString();
  return get(`/studio/api/2/publish/packages?siteId=${siteId}&${queryS}`);
}

export function fetchPackage(siteId: string, packageId: string) {
  return get(`/studio/api/2/publish/package?siteId=${siteId}&packageId=${packageId}`);
}

export function cancelPackage(siteId: string, packageIds: any) {
  return post(
    '/studio/api/2/publish/cancel',
    { siteId, packageIds },
    {
      'Content-Type': 'application/json'
    }
  );
}

export function fetchEnvironments(siteId: string) {
  return get(`/studio/api/1/services/api/1/deployment/get-available-publishing-channels.json?site_id=${siteId}`);
}

export function fetchStatus(siteId: string): Observable<{
  enabled: boolean;
  status: 'ready' | 'publishing' | 'queued' | 'stopped' | 'error';
  message: string;
  lockOwner: string;
  lockTTL: string;
}> {
  return get(`/studio/api/2/publish/status?siteId=${siteId}`).pipe(pluck('response'));
}

export function clearLock(siteId: string): Observable<boolean> {
  return postJSON('/studio/api/2/publish/clear_lock', { siteId }).pipe(mapTo(true));
}
