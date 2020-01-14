/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import { Epic, ofType } from 'redux-observable';
import { ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import {
  FETCH_AUDIENCES_PANEL_FORM_DEFINITION,
  fetchAudiencesPanelFormDefinitionComplete,
  fetchAudiencesPanelFormDefinitionFailed,
  RELOAD_REQUEST,
  SET_ACTIVE_MODEL,
  SET_ACTIVE_MODEL_COMPLETE,
  setActiveModelComplete as setActiveModelCompleteAction,
  setActiveModelFailed
} from '../actions/preview';
import {
  fetchActiveTargetingModel,
  getAudiencesPanelConfig,
  setActiveModel as setActiveModelService
} from '../../services/configuration';
import { forkJoin, Observable } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';

const fetchAudiencesPanel: Epic = (action$, state$: Observable<GlobalState>) => action$.pipe(
  ofType(FETCH_AUDIENCES_PANEL_FORM_DEFINITION),
  withLatestFrom(state$),
  switchMap(([, state]) => forkJoin([getAudiencesPanelConfig(state.sites.active), fetchActiveTargetingModel()]).pipe(
    catchAjaxError(fetchAudiencesPanelFormDefinitionFailed)
  )),
  map(response => fetchAudiencesPanelFormDefinitionComplete({
    contentType: response[0],
    model: response[1]
  }))
);

const setActiveModel: Epic = (action$) => action$.pipe(
  ofType(SET_ACTIVE_MODEL),
  switchMap((action) => setActiveModelService(action.payload).pipe(
    map(response => setActiveModelCompleteAction(response)),
    catchAjaxError(setActiveModelFailed)
  ))
);

const setActiveModelComplete: Epic = (action$) => action$.pipe(
  ofType(SET_ACTIVE_MODEL_COMPLETE),
  tap(() => getHostToGuestBus().next({ type: RELOAD_REQUEST })),
  ignoreElements()
);

export default [
  fetchAudiencesPanel,
  setActiveModel,
  setActiveModelComplete
] as Epic[];
