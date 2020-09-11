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
import {
  SELECT_TOOL,
  fetchPreviewToolsConfig,
  fetchPreviewToolsConfigComplete,
  fetchPreviewToolsConfigFailed,
  setPreviewEditMode
} from '../actions/preview';
import { getPreviewToolsConfig } from '../../services/configuration';
import { catchAjaxError } from '../../utils/ajax';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';

export default [
  (action$, state$) => action$.pipe(
    ofType(SELECT_TOOL),
    withLatestFrom(state$),
    tap(([{ payload }, state]) => {
      if (payload) {
        window.localStorage.setItem(`craftercms.previewSelectedTool.${state.sites.active}`, payload);
      } else {
        window.localStorage.removeItem(`craftercms.previewSelectedTool.${state.sites.active}`);
      }
    }),
    ignoreElements()
  ),
  // region fetchPreviewToolsConfig
  (action$) =>
    action$.pipe(
      ofType(fetchPreviewToolsConfig.type),
      switchMap(({ payload: site }) =>
        getPreviewToolsConfig(site).pipe(
          map(fetchPreviewToolsConfigComplete),
          catchAjaxError(fetchPreviewToolsConfigFailed)
        )
      )
    ),
  // endregion
  // region setPreviewEditMode
  (action$) =>
    action$.pipe(
      ofType(setPreviewEditMode.type),
      tap((action) => getHostToGuestBus().next(action)),
      ignoreElements()
    ),
  // endregion
] as Epic[];
