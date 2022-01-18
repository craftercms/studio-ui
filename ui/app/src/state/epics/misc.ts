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
import { merge, NEVER, Observable, of } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import {
  batchActions,
  changeContentType as changeContentTypeAction,
  editContentTypeTemplate,
  editController,
  editTemplate
} from '../actions/misc';
import { changeContentType, createFile, fetchWorkflowAffectedItems } from '../../services/content';
import { showCodeEditorDialog, showEditDialog, showWorkflowCancellationDialog } from '../actions/dialogs';
import { reloadDetailedItem } from '../actions/content';
import { emitSystemEvent, itemCreated, showEditItemSuccessNotification } from '../actions/system';
import { CrafterCMSEpic } from '../store';
import { nanoid as uuid } from 'nanoid';
import { translations } from '../../components/ItemActionsMenu/translations';
import { showErrorDialog } from '../reducers/dialogs/error';
import { popTab, pushTab } from '../reducers/dialogs/minimizedTabs';
import { getFileNameFromPath, getParentPath } from '../../utils/path';
import { popPiece } from '../../utils/string';
import { associateTemplate } from '../actions/preview';

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
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(editTemplate.type, editController.type, editContentTypeTemplate.type),
      filter(({ payload }) => payload.openOnSuccess || payload.openOnSuccess === void 0),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        const { payload, type } = action;
        const id = uuid();
        let path;
        let mode;
        let contentType;
        if (editContentTypeTemplate.type === type) {
          const _contentType = state.contentTypes.byId[payload.contentTypeId];
          path = _contentType.displayTemplate
            ? _contentType.displayTemplate
            : `/templates/web/${_contentType.type === 'page' ? 'pages' : 'components'}/${popPiece(
                _contentType.id,
                '/'
              )}.ftl`;
          mode = 'ftl';
          contentType = payload.contentTypeId;
        } else {
          path = `${payload.path}/${payload.fileName}`.replace(/\/{2,}/g, '/');
          mode = payload.mode;
          contentType = payload.contentType;
        }
        return merge(
          of(
            pushTab({
              minimized: true,
              id,
              status: 'indeterminate',
              title: getIntl().formatMessage(translations.verifyingAffectedWorkflows)
            })
          ),
          fetchWorkflowAffectedItems(state.sites.active, path).pipe(
            map((items) =>
              items?.length > 0
                ? batchActions([
                    showWorkflowCancellationDialog({
                      onContinue: showCodeEditorDialog({
                        path,
                        mode,
                        contentType
                      })
                    }),
                    popTab({ id })
                  ])
                : batchActions([
                    showCodeEditorDialog({
                      site: state.sites.active,
                      path,
                      mode,
                      contentType
                    }),
                    popTab({ id })
                  ])
            ),
            catchError(({ response }) => {
              if (response.response.code === 7000) {
                const fileName = editContentTypeTemplate.type === type ? getFileNameFromPath(path) : payload.fileName;
                const destinationPath = editContentTypeTemplate.type === type ? getParentPath(path) : payload.path;
                return createFile(state.sites.active, destinationPath, fileName).pipe(
                  map(() =>
                    batchActions([
                      associateTemplate({ contentTypeId: contentType, displayTemplate: path }),
                      emitSystemEvent(itemCreated({ target: path })),
                      showCodeEditorDialog({
                        site: state.sites.active,
                        path,
                        mode,
                        contentType
                      }),
                      popTab({ id })
                    ])
                  )
                );
              }
              return of(
                batchActions([
                  showErrorDialog({
                    error: response.response
                  }),
                  popTab({ id })
                ])
              );
            })
          )
        );
      })
    )
] as CrafterCMSEpic[];

export default epics;
