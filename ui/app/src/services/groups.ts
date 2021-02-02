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

import PaginationOptions from '../models/PaginationOptions';
import { PagedArray } from '../models/PagedArray';
import { Observable } from 'rxjs';
import { toQueryString } from '../utils/object';
import { del, get, patchJSON, postJSON } from '../utils/ajax';
import { map, mapTo, pluck } from 'rxjs/operators';
import Group from '../models/Group';
import User from '../models/User';

const paginationDefault = {
  limit: 100,
  offset: 0
};

export function fetchAll(options?: PaginationOptions): Observable<PagedArray<Group>> {
  const qs = toQueryString({
    ...paginationDefault,
    ...options
  });
  return get(`/studio/api/2/groups${qs}`).pipe(
    map(({ response }) =>
      Object.assign(response.groups, {
        limit: response.limit,
        offset: response.offset,
        total: response.total
      })
    )
  );
}

export function fetchUsersFromGroup(id: number, options?: PaginationOptions): Observable<PagedArray<User>> {
  const qs = toQueryString({
    ...paginationDefault,
    options
  });
  return get(`/studio/api/2/groups/${id}/members${qs}`).pipe(
    map(({ response }) =>
      Object.assign(response.users, {
        limit: response.limit,
        offset: response.offset,
        total: response.total
      })
    )
  );
}

export function create(group: Partial<Group>): Observable<Group> {
  return postJSON('/studio/api/2/groups', group).pipe(pluck('response', 'group'));
}

export function update(group: Partial<Group>): Observable<Group> {
  return patchJSON(`/studio/api/2/groups`, group).pipe(pluck('response', 'group'));
}

export function trash(groupId: string): Observable<true> {
  return del(`/studio/api/2/groups?id=${groupId}`).pipe(mapTo(true));
}

export function addUsersToGroup(id: number, users: { ids: string[]; usernames: string[] }): Observable<User[]> {
  return postJSON(`/studio/api/2/groups/${id}/members`, users).pipe(pluck('response', 'users'));
}

export function deleteUserFromGroup(id: number, userId: number, username: string): Observable<true> {
  const qs = toQueryString({
    userId,
    username
  });
  return del(`/studio/api/2/groups/${id}/members${qs}`).pipe(mapTo(true));
}
