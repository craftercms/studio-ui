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
import { blockUI, showEditItemSuccessNotification, unblockUI } from '../actions/system';
import { CrafterCMSEpic } from '../store';
import { translations } from '../../components/ItemActionsMenu/translations';
import { showErrorDialog } from '../reducers/dialogs/error';
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
          of(blockUI({ message: getIntl().formatMessage(translations.verifyingAffectedWorkflows) })),
          fetchWorkflowAffectedItems(state.sites.active, path).pipe(
            map((items) =>
              items?.length > 0
                ? batchActions([
                    showWorkflowCancellationDialog({
                      items,
                      onContinue: showCodeEditorDialog({
                        path,
                        mode,
                        contentType
                      })
                    }),
                    unblockUI()
                  ])
                : batchActions([
                    showCodeEditorDialog({
                      site: state.sites.active,
                      path,
                      mode,
                      contentType
                    }),
                    unblockUI()
                  ])
            ),
            catchError(({ response }) => {
              if (response.response.code === 7000) {
                const fileName = editContentTypeTemplate.type === type ? getFileNameFromPath(path) : payload.fileName;
                const destinationPath = editContentTypeTemplate.type === type ? getParentPath(path) : payload.path;
                return createFile(state.sites.active, destinationPath, fileName).pipe(
                  map(() =>
                    batchActions(
                      [
                        // Only editing templates should associate. Groovy controllers are not on the content type definition.
                        type !== editController.type &&
                          associateTemplate({ contentTypeId: contentType, displayTemplate: path }),
                        showCodeEditorDialog({
                          site: state.sites.active,
                          path,
                          mode,
                          contentType
                        }),
                        unblockUI()
                      ].filter(Boolean)
                    )
                  )
                );
              }
              return of(
                batchActions([
                  showErrorDialog({
                    error: response.response
                  }),
                  unblockUI()
                ])
              );
            })
          )
        );
      })
    )
] as CrafterCMSEpic[];

export default epics;
