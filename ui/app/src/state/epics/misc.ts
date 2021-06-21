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

import { ofType } from 'redux-observable';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { NEVER, Observable, of } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import {
  batchActions,
  changeContentType as changeContentTypeAction,
  editContentTypeTemplate,
  editController,
  editTemplate
} from '../actions/misc';
import { changeContentType, fetchWorkflowAffectedItems } from '../../services/content';
import { showCodeEditorDialog, showEditDialog, showWorkflowCancellationDialog } from '../actions/dialogs';
import { reloadDetailedItem } from '../actions/content';
import { showEditItemSuccessNotification } from '../actions/system';
import { CrafterCMSEpic } from '../store';

const epics = [
  (action$, state$: Observable<GlobalState>) =>
    action$.pipe(
      ofType(changeContentTypeAction.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        const newContentTypeId = payload.newContentTypeId;
        const path = payload.path;
        if (payload.originalContentTypeId !== newContentTypeId) {
          return changeContentType(state.sites.active, path, newContentTypeId).pipe(
            map(() =>
              showEditDialog({
                site: state.sites.active,
                path,
                authoringBase: state.env.authoringBase,
                changeTemplate: newContentTypeId,
                onSaveSuccess: batchActions([showEditItemSuccessNotification(), reloadDetailedItem({ path })])
              })
            )
          );
        }
        return NEVER;
      })
    ),
  (action$, state$: Observable<GlobalState>) =>
    action$.pipe(
      ofType(editContentTypeTemplate.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        const path = state.contentTypes.byId[payload.contentTypeId].displayTemplate;
        return fetchWorkflowAffectedItems(state.sites.active, path).pipe(
          map((items) => {
            if (items?.length > 0) {
              return showWorkflowCancellationDialog({
                onContinue: showCodeEditorDialog({
                  path,
                  mode: 'ftl',
                  contentType: payload.contentTypeId
                })
              });
            } else {
              return showCodeEditorDialog({
                path,
                mode: 'ftl',
                contentType: payload.contentTypeId
              });
            }
          })
        );
      })
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(editTemplate.type, editController.type),
      filter(({ payload }) => payload.openOnSuccess || payload.openOnSuccess === void 0),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        const { payload, type } = action;
        const path = `${payload.path}/${payload.fileName}`.replace(/\/{2,}/g, '/');
        return fetchWorkflowAffectedItems(state.sites.active, path).pipe(
          map((items) =>
            items?.length > 0
              ? showWorkflowCancellationDialog({
                  onContinue: showCodeEditorDialog({
                    path,
                    mode: payload.mode,
                    contentType: payload.contentType
                  })
                })
              : showCodeEditorDialog({
                  authoringBase: state.env.authoringBase,
                  site: state.sites.active,
                  path,
                  mode: payload.mode,
                  contentType: payload.contentType
                })
          ),
          catchError(() => {
            return of(
              showCodeEditorDialog({
                authoringBase: state.env.authoringBase,
                site: state.sites.active,
                path,
                type: editTemplate.type === type ? 'template' : 'controller',
                contentType: payload.contentType
              })
            );
          })
        );
      })
    )
] as CrafterCMSEpic[];

export default epics;
