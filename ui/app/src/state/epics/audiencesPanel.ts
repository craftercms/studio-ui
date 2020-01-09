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
import { map, switchMap, withLatestFrom } from "rxjs/operators";
import { catchAjaxError } from "../../utils/ajax";
import {
  FETCH_AUDIENCES_PANEL,
  fetchAudiencesPanelComplete,
  fetchAudiencesPanelFailed,
  SET_AUDIENCES_PANEL_MODEL,
  setAudiencesPanelModelComplete,
  setAudiencesPanelModelFailed
} from "../actions/preview";
import {
  getAudiencesPanelConfig,
  getAudiencesPanelModel,
  setAudiencesPanelModel as setAudiencesPanelModelService
} from "../../services/configuration";
import { forkJoin, Observable } from "rxjs";
import GlobalState from "../../models/GlobalState";

const fetchAudiencesPanel: Epic = (action$, state$: Observable<GlobalState>) => action$.pipe(
  ofType(FETCH_AUDIENCES_PANEL),
  withLatestFrom(state$),
  switchMap(([, state]) => forkJoin([getAudiencesPanelConfig(state.sites.active), getAudiencesPanelModel()])),
  map(response => fetchAudiencesPanelComplete({
    contentType: response[0],
    model: response[1]
  })),
  catchAjaxError(fetchAudiencesPanelFailed)
);

const setAudiencesPanelModel: Epic = (action$) => action$.pipe(
  ofType(SET_AUDIENCES_PANEL_MODEL),
  switchMap((action) => setAudiencesPanelModelService(action.payload).pipe(
    map(setAudiencesPanelModelComplete),
    catchAjaxError(setAudiencesPanelModelFailed)
  ))
);

export default [
  fetchAudiencesPanel,
  setAudiencesPanelModel
] as Epic[];
