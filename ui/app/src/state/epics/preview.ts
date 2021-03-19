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

import { ofType, StateObservable } from 'redux-observable';
import { ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
  popToolsPanelPage,
  previewItem,
  pushToolsPanelPage,
  setHighlightMode,
  setPreviewChoice,
  setPreviewChoiceComplete,
  setPreviewEditMode
} from '../actions/preview';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import {
  removeStoredPreviewToolsPanelPage,
  setStoredClipboard,
  setStoredEditModeChoice,
  setStoredHighlightModeChoice,
  setStoredPreviewToolsPanelPage
} from '../../utils/state';
import GlobalState from '../../models/GlobalState';
import { setClipboard } from '../actions/content';
import { setProperties } from '../../services/users';
import { CrafterCMSEpic } from '../store';
import { getSystemLink } from '../../components/LauncherSection';

export default [
  (action$, state$) =>
    action$.pipe(
      ofType(pushToolsPanelPage.type),
      withLatestFrom(state$),
      tap(([{ type, payload }, state]) => {
        if (payload) {
          setStoredPreviewToolsPanelPage(state.sites.active, state.user.username, payload);
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
            state.user.username,
            state.preview.toolsPanelPageStack[state.preview.toolsPanelPageStack.length - 1]
          );
        } else {
          removeStoredPreviewToolsPanelPage(state.sites.active, state.user.username);
        }
      }),
      ignoreElements()
    ),
  // region setPreviewEditMode
  (action$, state$) =>
    action$.pipe(
      ofType(setPreviewEditMode.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        setStoredEditModeChoice(action.payload.editMode, state.user.username);
        getHostToGuestBus().next(action);
      }),
      ignoreElements()
    ),
  // endregion
  // region setPreviewChoice
  (action$, state$) =>
    action$.pipe(
      ofType(setPreviewChoice.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        setProperties({
          previewChoice: JSON.stringify({ ...state.preview.previewChoice, [payload.site]: payload.choice })
        })
      ),
      map(setPreviewChoiceComplete)
    ),
  // endregion
  // region setHighlightMode
  (action$, state$) =>
    action$.pipe(
      ofType(setHighlightMode.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        setStoredHighlightModeChoice(action.payload.highlightMode, state.user.username);
        getHostToGuestBus().next(action);
      }),
      ignoreElements()
    ),
  // endregion
  // region Clipboard
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(setClipboard.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        setStoredClipboard(state.sites.active, state.user.username, payload);
      }),
      ignoreElements()
    ),
  // endregion
  // region Go To Page
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(previewItem.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        const url = getSystemLink({
          site: state.sites.active,
          systemLinkId: 'preview',
          previewChoice: state.preview.previewChoice,
          authoringBase: state.env.authoringBase,
          page: payload.item.previewUrl
        });
        if (payload.newTab) {
          window.open(url);
        } else {
          window.location.href = url;
        }
      }),
      ignoreElements()
    )
  // endregion
] as CrafterCMSEpic[];
