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

import { Observable } from 'rxjs';
import { get } from '../utils/ajax';
import { pluck } from 'rxjs/operators';
import { ItemStates } from '../models/WorkflowState';

export function fetchItemStates(siteId: string, state: string = 'ALL'): Observable<ItemStates> {
  // return get(`/studio/api/1/services/api/1/content/get-item-states.json?site=${siteId}&state=${state}`).pipe(
  //   pluck('response')
  // );

  return new Observable<ItemStates>((observer) => {
    observer.next({
      total: 2,
      offset: 0,
      limit: 0,
      items: [
        {
          creator: 'git_repo_user',
          dateCreated: '2021-05-06T16:54:31-06:00',
          modifier: 'admin',
          dateModified: '2021-05-07T16:16:12-06:00',
          commitId: '3ee001afdcd3c8ff91686dec27dc8ce775100350',
          sizeInBytes: 10065,
          id: 28305,
          label: 'Home',
          parentId: 28216,
          contentTypeId: '/page/home',
          path: '/site/website/index.xml',
          previewUrl: '/',
          systemType: 'page',
          mimeType: 'application/xml',
          state: 779,
          lockOwner: 'git_repo_user',
          localeCode: null,
          translationSourceId: null,
          availableActions: 6158591,
          disabled: false,
          stateMap: {
            new: true,
            modified: true,
            deleted: false,
            locked: true,
            systemProcessing: false,
            submitted: false,
            scheduled: false,
            staged: false,
            live: true,
            translationUpToDate: true,
            translationPending: false,
            translationInProgress: false
          },
          availableActionsMap: {
            view: true,
            copy: true,
            history: true,
            dependencies: true,
            requestPublish: true,
            createContent: true,
            paste: true,
            edit: true,
            unlock: false,
            rename: false,
            cut: false,
            upload: false,
            duplicate: true,
            changeContentType: true,
            revert: true,
            editController: true,
            editTemplate: true,
            createFolder: true,
            delete: false,
            deleteController: true,
            deleteTemplate: true,
            publish: true,
            approvePublish: false,
            schedulePublish: true,
            rejectPublish: false
          }
        },
        {
          creator: null,
          dateCreated: '2021-05-06T16:54:31-06:00',
          modifier: null,
          dateModified: '2021-05-06T16:54:28-06:00',
          commitId: '0e5432cd25463cb641aa70cd577738c8f6fd59eb',
          sizeInBytes: 1694,
          id: 28301,
          label: 'Entertainment',
          parentId: 28305,
          contentTypeId: '/page/category-landing',
          path: '/site/website/entertainment/index.xml',
          previewUrl: '/entertainment',
          systemType: 'page',
          mimeType: 'application/xml',
          state: 769,
          lockOwner: null,
          localeCode: 'en_US',
          translationSourceId: null,
          availableActions: 6290431,
          disabled: false,
          stateMap: {
            new: true,
            modified: false,
            deleted: false,
            locked: false,
            systemProcessing: false,
            submitted: false,
            scheduled: false,
            staged: false,
            live: true,
            translationUpToDate: true,
            translationPending: false,
            translationInProgress: false
          },
          availableActionsMap: {
            view: true,
            copy: true,
            history: true,
            dependencies: true,
            requestPublish: true,
            createContent: true,
            paste: true,
            edit: true,
            unlock: false,
            rename: true,
            cut: true,
            upload: false,
            duplicate: true,
            changeContentType: true,
            revert: true,
            editController: true,
            editTemplate: true,
            createFolder: true,
            delete: true,
            deleteController: true,
            deleteTemplate: true,
            publish: true,
            approvePublish: false,
            schedulePublish: true,
            rejectPublish: false
          }
        }
      ]
    });
  });
}
