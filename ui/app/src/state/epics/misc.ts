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
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { NEVER, Observable } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import {
  batchActions,
  changeContentType as changeContentTypeAction,
  editTemplate as editTemplateAction
} from '../actions/misc';
import queryString from 'query-string';
import { changeContentType, fetchWorkflowAffectedItems } from '../../services/content';
import {
  showCodeEditorDialog,
  showEditDialog,
  showEditItemSuccessNotification,
  showWorkflowCancellationDialog
} from '../actions/dialogs';
import { pathNavigatorItemActionSuccess } from '../actions/pathNavigator';

const changeTemplate: Epic = (action$, state$: Observable<GlobalState>) =>
  action$.pipe(
    ofType(changeContentTypeAction.type),
    withLatestFrom(state$),
    switchMap(([{ payload }, state]) => {
      const contentType = queryString.parse(payload.src).contentTypeId as string;
      const path = payload.path;
      if (payload.contentTypeId !== contentType) {
        let src = `${state.env.authoringBase}/legacy/form?site=${state.sites.active}&path=${path}&type=form&changeTemplate=${contentType}`;
        return changeContentType(state.sites.active, path, contentType).pipe(
          map(() =>
            showEditDialog({
              src,
              onSaveSuccess: batchActions([
                showEditItemSuccessNotification,
                pathNavigatorItemActionSuccess({ id: payload.id, option: 'refresh' })
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

export default [changeTemplate, editTemplate] as Epic[];
