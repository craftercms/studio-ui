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

import { get, postJSON } from '../utils/ajax';
import { Observable } from 'rxjs';
import { mapTo, pluck } from 'rxjs/operators';
import { FileDiff, Remote, Repository, RepositoryStatus } from '../models/Repository';

const repositoryEndpointUrl = '/studio/api/2/repository';

export function fetchRepositories(siteId: string): Observable<Repository[]> {
  return get(`${repositoryEndpointUrl}/list_remotes?siteId=${siteId}`).pipe(pluck('response', 'remotes'));
}

export function addRemote(remote: Remote): Observable<true> {
  return postJSON(`${repositoryEndpointUrl}/add_remote`, remote).pipe(mapTo(true));
}

export function deleteRemote(siteId: string, remoteName: string): Observable<true> {
  return postJSON(`${repositoryEndpointUrl}/remove_remote`, { siteId, remoteName }).pipe(mapTo(true));
}

export function pull(remote: Partial<Remote>): Observable<true> {
  return postJSON(`${repositoryEndpointUrl}/pull_from_remote`, remote).pipe(mapTo(true));
}

export function push(siteId: string, remoteName: string, remoteBranch: string, force: boolean): Observable<true> {
  return postJSON(`${repositoryEndpointUrl}/push_to_remote`, { siteId, remoteName, remoteBranch, force }).pipe(
    mapTo(true)
  );
}

export function fetchStatus(siteId: string): Observable<RepositoryStatus> {
  return get(`${repositoryEndpointUrl}/status?siteId=${siteId}`).pipe(pluck('response', 'repositoryStatus'));
}

export function resolveConflict(siteId: string, path: string, resolution: string): Observable<RepositoryStatus> {
  return postJSON(`${repositoryEndpointUrl}/resolve_conflict`, { siteId, path, resolution }).pipe(
    pluck('response', 'repositoryStatus')
  );
}

export function diffConflictedFile(siteId: string, path: string): Observable<FileDiff> {
  return get(`${repositoryEndpointUrl}/diff_conflicted_file?siteId=${siteId}&path=${path}`).pipe(
    pluck('response', 'diff')
  );
}

export function commitResolution(siteId: string, commitMessage: string): Observable<RepositoryStatus> {
  return postJSON(`${repositoryEndpointUrl}/commit_resolution`, { siteId, commitMessage }).pipe(
    pluck('response', 'repositoryStatus')
  );
}

export function cancelFailedPull(siteId: string): Observable<RepositoryStatus> {
  return postJSON(`${repositoryEndpointUrl}/cancel_failed_pull`, { siteId }).pipe(
    pluck('response', 'repositoryStatus')
  );
}
