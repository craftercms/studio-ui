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
  popToolsPanelPage,
  pushToolsPanelPage,
  setHighlightMode,
  setHighlightModeComplete,
  setPreviewChoice,
  setPreviewChoiceComplete,
  setPreviewEditMode,
  setPreviewEditModeComplete
} from '../actions/preview';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import { setClipBoard, setClipBoardComplete } from '../actions/content';
import { deletePreferences, setPreferences } from '../../services/users';

export default [
  (action$, state$) =>
    action$.pipe(
      ofType(pushToolsPanelPage.type),
      withLatestFrom(state$),
      tap(([{ type, payload }, state]) => {
        if (payload) {
          setPreferences({ toolsPanelPage: JSON.stringify(payload) }, state.sites.active).subscribe(() => {});
        }
      }),
      ignoreElements()
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(popToolsPanelPage.type),
      withLatestFrom(state$),
      tap(([, state]) => {
        if (state.preview.toolsPanelPageStack.length) {
          setPreferences(
            {
              toolsPanelPage: JSON.stringify(
                state.preview.toolsPanelPageStack[state.preview.toolsPanelPageStack.length - 1]
              )
            },
            state.sites.active
          ).subscribe(() => {});
        } else {
          deletePreferences(['toolsPanelPage'], state.sites.active).subscribe(() => {});
        }
      }),
      ignoreElements()
    ),
  // region setPreviewEditMode
  (action$) =>
    action$.pipe(
      ofType(setPreviewEditMode.type),
      switchMap((action) => {
        getHostToGuestBus().next(action);
        return setPreferences({ editMode: action.payload.editMode });
      }),
      map(setPreviewEditModeComplete)
    ),
  // region setPreviewChoice
  (action$, state$) =>
    action$.pipe(
      ofType(setPreviewChoice.type),
      withLatestFrom(state$),
      switchMap(([, state]) => setPreferences({ previewChoice: state.preview.previewChoice })),
      map(setPreviewChoiceComplete)
    ),
  // region setHighlightMode
  (action$) =>
    action$.pipe(
      ofType(setHighlightMode.type),
      switchMap((action) => {
        getHostToGuestBus().next(action);
        return setPreferences({ highlightMode: action.payload.highlightMode });
      }),
      map(setHighlightModeComplete)
    ),
  // region Clipboard
  (action$) =>
    action$.pipe(
      ofType(setClipBoard.type),
      switchMap(({ payload }) => setPreferences({ clipboard: JSON.stringify({ ...payload, timestamp: Date.now() }) })),
      map(setClipBoardComplete)
    )
  // endregion
] as Epic[];
