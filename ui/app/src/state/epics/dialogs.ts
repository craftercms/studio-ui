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

import { Epic, ofType, StateObservable } from 'redux-observable';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { closeConfirmDialog } from '../reducers/dialogs/confirm';
import { NEVER } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import { closeNewContentDialog } from '../reducers/dialogs/newContent';
import { closePublishDialog } from '../reducers/dialogs/publish';
import { camelize, dasherize } from '../../utils/string';
import { closeDeleteDialog } from '../reducers/dialogs/delete';
import {
  closeCompareVersionsDialog,
  closeHistoryDialog,
  closeViewVersionDialog,
  fetchContentVersion,
  fetchContentVersionComplete,
  fetchContentVersionFailed
} from '../actions/dialogs';
import { getContentVersion } from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';

function getDialogNameFromType(type: string): string {
  let name = type.replace(/(CLOSE_)|(_DIALOG)/g, '');
  return camelize(dasherize(name.toLowerCase()));
}

function getDialogState(type: string, state: GlobalState): any {
  const stateName = getDialogNameFromType(type);
  const dialog = state.dialogs[stateName];
  if (!dialog) {
    console.error(`[epics/dialogs] Unable to retrieve dialog state from "${stateName}" action`);
  }
  return dialog;
}
export default [
  // region Dialogs
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(
        closeConfirmDialog.type,
        closePublishDialog.type,
        closeDeleteDialog.type,
        closeNewContentDialog.type,
        closeHistoryDialog.type,
        closeViewVersionDialog.type,
        closeCompareVersionsDialog.type
      ),
      withLatestFrom(state$),
      map(([{ type, payload }, state]) =>
        [payload, getDialogState(type, state)?.onClose].filter((callback) => Boolean(callback))
      ),
      switchMap((actions) => (actions.length ? actions : NEVER))
    ),
  // endregion
  // region View Version Dialog
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(fetchContentVersion.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        getContentVersion(state.sites.active, payload.path, payload.versionNumber).pipe(
          map(fetchContentVersionComplete),
          catchAjaxError(fetchContentVersionFailed)
        )
      )
    )
  // endregion
] as Epic[];
