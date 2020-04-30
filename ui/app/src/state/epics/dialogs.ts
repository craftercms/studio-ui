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
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { NEVER } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import { camelize, dasherize } from '../../utils/string';
import {
  closeCompareVersionsDialog,
  closeConfirmDialog,
  closeDeleteDialog,
  closeDependenciesDialog,
  closeHistoryDialog,
  closeNewContentDialog,
  closePublishDialog,
  closeViewVersionDialog,
  fetchContentVersion,
  fetchContentVersionComplete,
  fetchContentVersionFailed
} from '../actions/dialogs';
import { getContentVersion } from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';

function getDialogNameFromType(type: string): string {
  let name = getDialogActionNameFromType(type);
  return camelize(dasherize(name.toLowerCase()));
}

function getDialogActionNameFromType(type: string): string {
  return type.replace(/(CLOSE_)|(_DIALOG)/g, '');
}

function getDialogState(type: string, state: GlobalState): any {
  const stateName = getDialogNameFromType(type);
  const dialog = state.dialogs[stateName];
  if (!dialog) {
    console.error(`[epics/dialogs] Unable to retrieve dialog state from "${stateName}" action`);
  }
  return dialog;
}

function createClosedAction(type: string) {
  const stateName = getDialogActionNameFromType(type);
  return { type: `${stateName}_DIALOG_CLOSED` };
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
        closeCompareVersionsDialog.type,
        closeDependenciesDialog.type
      ),
      withLatestFrom(state$),
      map(([{ type, payload }, state]) => {
        // Setting both onDismiss & onClose to the close*Dialog action, allows escape
        // and backdrop click to work. This is the default on reducers. However this
        // send on a infinite loop of CLOSE_*_DIALOG actions. Checking that the onClose
        // is not the following action to execute avoids that. On top, the *DialogClosed action
        // is also dispatched for the state to clean up the onClose handler
        const onClose = getDialogState(type, state)?.onClose;
        // TODO: allow multi-dispatch by supporting arrays on onClose/payload
        // Array.isArray(payload) ? payload.includes(onClose.type)
        return [
          payload,
          onClose && payload && onClose.type !== payload.type && onClose,
          createClosedAction(type)
        ].filter((callback) => Boolean(callback));
      }),
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
