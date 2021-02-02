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

import { del, get } from '../utils/ajax';
import { ClusterMember } from '../models/Clusters';
import { mapTo, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

export function fetchMembers(): Observable<ClusterMember[]> {
  return get(`/studio/api/2/cluster`).pipe(pluck('response', 'clusterMembers'));
}

export function deleteMember(id: number): Observable<true> {
  return del(`/studio/api/2/cluster?id=${id}`).pipe(mapTo(true));
}
