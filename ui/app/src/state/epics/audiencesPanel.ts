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
import { ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import {
  fetchAudiencesPanelModel,
  fetchAudiencesPanelModelComplete,
  fetchAudiencesPanelModelFailed,
  reloadRequest,
  SET_ACTIVE_TARGETING_MODEL,
  SET_ACTIVE_TARGETING_MODEL_COMPLETE,
  setActiveTargetingModelComplete as setActiveTargetingModelCompleteAction,
  setActiveTargetingModelFailed
} from '../actions/preview';
import {
  deserializeActiveTargetingModelData,
  fetchActiveTargetingModel,
  setActiveTargetingModel as setActiveTargetingModelService
} from '../../services/configuration';
import { Observable } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import { getHostToGuestBus } from '../../utils/subjects';
import { CrafterCMSEpic } from '../store';

export default [
  (action$, state$: Observable<GlobalState>) =>
    action$.pipe(
      ofType(fetchAudiencesPanelModel.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        fetchActiveTargetingModel(state.sites.active).pipe(
          map((data) => fetchAudiencesPanelModelComplete(deserializeActiveTargetingModelData(data, payload.fields))),
          catchAjaxError(fetchAudiencesPanelModelFailed)
        )
      )
    ),
  (action$, state$: Observable<GlobalState>) =>
    action$.pipe(
      ofType(SET_ACTIVE_TARGETING_MODEL),
      withLatestFrom(state$),
      switchMap(([, state]) =>
        setActiveTargetingModelService(state.preview.audiencesPanel.model).pipe(
          map((response) => setActiveTargetingModelCompleteAction(response)),
          catchAjaxError(setActiveTargetingModelFailed)
        )
      )
    ),
  (action$) =>
    action$.pipe(
      ofType(SET_ACTIVE_TARGETING_MODEL_COMPLETE),
      tap(() => getHostToGuestBus().next({ type: reloadRequest.type })),
      ignoreElements()
    )
] as CrafterCMSEpic[];
