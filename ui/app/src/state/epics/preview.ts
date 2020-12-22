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
import { ignoreElements, tap, withLatestFrom } from 'rxjs/operators';
import { popToolsPanelPage, pushToolsPanelPage, setHighlightMode, setPreviewEditMode } from '../actions/preview';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import {
  removeStoredPreviewToolsPanelPage,
  setStoredClipboard,
  setStoredEditModeChoice,
  setStoredhighlightModeChoice,
  setStoredPreviewToolsPanelPage
} from '../../utils/state';
import GlobalState from '../../models/GlobalState';
import { setClipBoard } from '../actions/content';

export default [
  (action$, state$) =>
    action$.pipe(
      ofType(pushToolsPanelPage.type),
      withLatestFrom(state$),
      tap(([{ type, payload }, state]) => {
        if (payload) {
          setStoredPreviewToolsPanelPage(state.sites.active, payload);
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
          setStoredPreviewToolsPanelPage(
            state.sites.active,
            state.preview.toolsPanelPageStack[state.preview.toolsPanelPageStack.length - 1]
          );
        } else {
          removeStoredPreviewToolsPanelPage(state.sites.active);
        }
      }),
      ignoreElements()
    ),
  // region setPreviewEditMode
  (action$) =>
    action$.pipe(
      ofType(setPreviewEditMode.type),
      tap((action) => {
        setStoredEditModeChoice(action.payload.editMode);
        getHostToGuestBus().next(action);
      }),
      ignoreElements()
    ),
  // region setHighlightMode
  (action$) =>
    action$.pipe(
      ofType(setHighlightMode.type),
      tap((action) => {
        setStoredhighlightModeChoice(action.payload.highlightMode);
        getHostToGuestBus().next(action);
      }),
      ignoreElements()
    ),
  // region Clipboard
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(setClipBoard.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        setStoredClipboard(state.sites.active, payload);
      }),
      ignoreElements()
    )
  // endregion
] as Epic[];
