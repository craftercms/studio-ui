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

export default [
  // region Confirm Dialog
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(closeConfirmDialog.type),
      withLatestFrom(state$),
      map(([{ payload }, state]) =>
        [payload, state.dialogs.confirm.onClose].filter((callback) => Boolean(callback))
      ),
      switchMap((actions) => (actions.length ? actions : NEVER))
    )
  // endregion
] as Epic[];
