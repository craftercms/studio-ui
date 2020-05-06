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
import GlobalState from '../../models/GlobalState';
import {
  getConfigurationVersions,
  getContentVersion,
  getItemVersions,
  revertContentToVersion
} from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import {
  compareBothVersions,
  compareBothVersionsComplete,
  compareBothVersionsFailed,
  compareToPreviousVersion,
  fetchItemVersions,
  fetchItemVersionsComplete,
  fetchItemVersionsFailed,
  resetVersionsState,
  revertContent,
  revertContentComplete,
  revertContentFailed,
  revertToPreviousVersion,
  versionsChangeItem
} from '../reducers/versions';
import { forkJoin } from 'rxjs';
import { historyDialogClosed } from '../actions/dialogs';

export default [
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(fetchItemVersions.type, versionsChangeItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        const service = (state.versions.config)
          ? getConfigurationVersions(
            state.sites.active,
            payload.path ?? state.versions.item.path,
            payload.environment ?? state.versions.environment,
            payload.module ?? state.versions.module
          )
          : getItemVersions(state.sites.active, payload.path ?? state.versions.item.path);
        return service.pipe(
          map(fetchItemVersionsComplete),
          catchAjaxError(fetchItemVersionsFailed)
        );
      })
    ),
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(compareBothVersions.type, compareToPreviousVersion.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        forkJoin(
          getContentVersion(
            state.sites.active,
            state.versions.item.path,
            state.versions.selected[0]
          ),
          getContentVersion(
            state.sites.active,
            state.versions.item.path,
            state.versions.selected[1]
          )
        ).pipe(
          map(compareBothVersionsComplete),
          catchAjaxError(compareBothVersionsFailed)
        )
      )
    ),
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(revertContent.type, revertToPreviousVersion.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        revertContentToVersion(
          state.sites.active,
          state.versions.config ? state.versions.revertPath : payload.path ?? state.versions.item.path,
          payload.versionNumber ?? state.versions.previous
        ).pipe(
          map(revertContentComplete),
          catchAjaxError(revertContentFailed)
        )
      )
    ),
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(revertContentComplete.type),
      map(fetchItemVersions)
    ),
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(historyDialogClosed.type),
      withLatestFrom(state$),
      map(([, { dialogs }]) => {
        if (!dialogs.viewVersion.open && !dialogs.compareVersions.open) {
          return resetVersionsState();
        } else {
          return { type: 'nadita' };
        }
      })
    )
] as Epic[];
