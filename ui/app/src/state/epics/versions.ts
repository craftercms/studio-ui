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
  getItemVersions
} from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import {
  compareBothVersions,
  compareBothVersionsComplete,
  compareBothVersionsFailed,
  fetchItemVersions,
  fetchItemVersionsComplete,
  fetchItemVersionsFailed
} from '../reducers/versions';
import { forkJoin } from 'rxjs';

export default [
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(fetchItemVersions.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        const service = (payload.config)
          ? getConfigurationVersions(
            state.sites.active,
            payload.path ?? state.versions.path,
            payload.environment ?? state.versions.environment,
            payload.module ?? state.versions.module
          )
          : getItemVersions(state.sites.active, payload.path ?? state.versions.path);
        return service.pipe(
          map(fetchItemVersionsComplete),
          catchAjaxError(fetchItemVersionsFailed)
        );
      })
    ),
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(compareBothVersions.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        forkJoin(
          getContentVersion(state.sites.active, payload.path, payload[0]),
          getContentVersion(state.sites.active, payload.path, payload[1])
        ).pipe(
          map(compareBothVersionsComplete),
          catchAjaxError(compareBothVersionsFailed)
        )
      )
    )
] as Epic[];
