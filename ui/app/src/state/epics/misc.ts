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

import { Epic, ofType } from 'redux-observable';
import { ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { NEVER, Observable } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import {
  batchActions,
  changeContentType as changeContentTypeAction,
  editTemplate as editTemplateAction
} from '../actions/misc';
import { changeContentType, fetchWorkflowAffectedItems } from '../../services/content';
import {
  showCodeEditorDialog,
  showEditDialog,
  showEditItemSuccessNotification,
  showWorkflowCancellationDialog
} from '../actions/dialogs';
import { reloadDetailedItem } from '../actions/content';
import { systemEvent } from '../actions/systemEvents';
import { getHostToHostBus } from '../../modules/Preview/previewContext';

const systemEventPropagate: Epic = (action$) =>
  action$.pipe(
    ofType(systemEvent.type),
    tap(({ payload }) => {
      const hostToHost$ = getHostToHostBus();
      hostToHost$.next(payload);
    }),
    ignoreElements()
  );

const changeTemplate: Epic = (action$, state$: Observable<GlobalState>) =>
  action$.pipe(
    ofType(changeContentTypeAction.type),
    withLatestFrom(state$),
    switchMap(([{ payload }, state]) => {
      const contentType = payload.selectedContentType;
      const path = payload.path;
      if (payload.contentTypeId !== contentType) {
        let src = `${state.env.authoringBase}/legacy/form?site=${state.sites.active}&path=${path}&type=form&changeTemplate=${contentType}`;
        return changeContentType(state.sites.active, path, contentType).pipe(
          map(() =>
            showEditDialog({
              src,
              onSaveSuccess: batchActions([
                showEditItemSuccessNotification(),
                reloadDetailedItem({ path })
              ])
            })
          )
        );
      }
      return NEVER;
    })
  );

const editTemplate: Epic = (action$, state$: Observable<GlobalState>) =>
  action$.pipe(
    ofType(editTemplateAction.type),
    withLatestFrom(state$),
    switchMap(([{ payload }, state]) => {
      const path = state.contentTypes.byId[payload.contentTypeId].displayTemplate;
      let src = `${state.env.authoringBase}/legacy/form?site=${state.sites.active}&path=${path}&type=template`;
      return fetchWorkflowAffectedItems(state.sites.active, path).pipe(
        map((items) => {
          if (items?.length > 0) {
            return showWorkflowCancellationDialog({ onContinue: showCodeEditorDialog({ src }) });
          } else {
            return showCodeEditorDialog({ src });
          }
        })
      );
    })
  );

export default [changeTemplate, editTemplate, systemEventPropagate] as Epic[];
