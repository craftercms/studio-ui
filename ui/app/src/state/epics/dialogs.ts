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
import { camelize } from '../../utils/string';
import { closeDeleteDialog } from '../reducers/dialogs/delete';
import {
  fetchItemVersions,
  fetchItemVersionsComplete,
  fetchItemVersionsFailed,
  showHistoryDialog
} from '../reducers/dialogs/history';
import { getConfigurationVersions, getItemVersions } from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';

function getDialogNameFromType(type: string): string {
  let name = type.substring(type.indexOf('_') + 1);
  name = name.substring(0, name.indexOf('_'));
  return camelize(name.toLowerCase());
}

export default [
  // region Confirm Dialog
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(
        closeConfirmDialog.type,
        closePublishDialog.type,
        closeDeleteDialog.type,
        closeNewContentDialog.type
      ),
      withLatestFrom(state$),
      map(([{ type, payload }, state]) =>
        [payload, state.dialogs[getDialogNameFromType(type)].onClose].filter((callback) => Boolean(callback))
      ),
      switchMap((actions) => (actions.length ? actions : NEVER))
    ),
  // endregion
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(showHistoryDialog.type, fetchItemVersions.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        const service = (payload.config)
          ? getConfigurationVersions(state.sites.active, payload.path, payload.environment, payload.module)
          : getItemVersions(state.sites.active, payload.path);
        return service.pipe(
          map(fetchItemVersionsComplete),
          catchAjaxError(fetchItemVersionsFailed)
        );
      })
    )
] as Epic[];
