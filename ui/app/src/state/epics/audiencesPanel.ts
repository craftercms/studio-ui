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
import { catchAjaxError } from '../../utils/ajax';
import {
  FETCH_AUDIENCES_PANEL_FORM_DEFINITION,
  fetchAudiencesPanelFormDefinitionComplete,
  fetchAudiencesPanelFormDefinitionFailed,
  RELOAD_REQUEST,
  SET_ACTIVE_TARGETING_MODEL,
  SET_ACTIVE_TARGETING_MODEL_COMPLETE,
  setActiveTargetingModelComplete as setActiveTargetingModelCompleteAction,
  setActiveTargetingModelFailed
} from '../actions/preview';
import {
  getAudiencesPanelPayload,
  setActiveTargetingModel as setActiveTargetingModelService
} from '../../services/configuration';
import { Observable } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';

const fetchAudiencesPanel: Epic = (action$, state$: Observable<GlobalState>) => action$.pipe(
  ofType(FETCH_AUDIENCES_PANEL_FORM_DEFINITION),
  withLatestFrom(state$),
  switchMap(([, state]) => getAudiencesPanelPayload(state.sites.active).pipe(
    map(fetchAudiencesPanelFormDefinitionComplete),
    catchAjaxError(fetchAudiencesPanelFormDefinitionFailed)
  ))
);

const setActiveTargetingModel: Epic = (action$, state$: Observable<GlobalState>) => action$.pipe(
  ofType(SET_ACTIVE_TARGETING_MODEL),
  withLatestFrom(state$),
  switchMap(([, state]) => setActiveTargetingModelService(state.preview.audiencesPanel.model).pipe(
    map(response => setActiveTargetingModelCompleteAction(response)),
    catchAjaxError(setActiveTargetingModelFailed)
  ))
);

const setActiveTargetingModelComplete: Epic = (action$) => action$.pipe(
  ofType(SET_ACTIVE_TARGETING_MODEL_COMPLETE),
  tap(() => getHostToGuestBus().next({ type: RELOAD_REQUEST })),
  ignoreElements()
);

export default [
  fetchAudiencesPanel,
  setActiveTargetingModel,
  setActiveTargetingModelComplete
] as Epic[];
