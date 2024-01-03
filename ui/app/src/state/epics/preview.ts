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

import { ofType, StateObservable } from 'redux-observable';
import { debounceTime, filter, ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
  closeToolsPanel,
  mainModelModifiedExternally,
  openToolsPanel,
  popIcePanelPage,
  popToolsPanelPage,
  previewItem,
  pushIcePanelPage,
  pushToolsPanelPage,
  setEditModePadding,
  setHighlightMode,
  setPreviewEditMode,
  setWindowSize,
  toggleEditModePadding,
  updateIcePanelWidth,
  updateToolsPanelWidth
} from '../actions/preview';
import { getHostToGuestBus } from '../../utils/subjects';
import {
  removeStoredICEToolsPanelPage,
  removeStoredPreviewToolsPanelPage,
  setStoredClipboard,
  setStoredEditModeChoice,
  setStoredEditModePadding,
  setStoredHighlightModeChoice,
  setStoredICEToolsPanelPage,
  setStoredICEToolsPanelWidth,
  setStoredPreviewToolsPanelPage,
  setStoredPreviewToolsPanelWidth,
  setStoredShowToolsPanel
} from '../../utils/state';
import GlobalState from '../../models/GlobalState';
import { setClipboard } from '../actions/content';
import { CrafterCMSEpic } from '../store';
import { getSystemLink } from '../../utils/system';
import { contentEvent, storeInitialized } from '../actions/system';
import { fromEvent, Observable } from 'rxjs';
import StandardAction from '../../models/StandardAction';
import { SocketEventBase } from '../../models';

export default [
  // region storeInitialized
  (action$, state$) =>
    action$.pipe(
      ofType(storeInitialized.type),
      switchMap(() =>
        fromEvent(window, 'resize').pipe(
          debounceTime(200),
          map((e) => setWindowSize({ size: (e.target as Window).innerWidth }))
        )
      )
    ),
  // endregion
  // region pushToolsPanelPage
  (action$, state$) =>
    action$.pipe(
      ofType(pushToolsPanelPage.type),
      withLatestFrom(state$),
      tap(([{ type, payload }, state]) => {
        if (payload) {
          const uuid = state.sites.byId?.[state.sites.active].uuid;
          uuid && setStoredPreviewToolsPanelPage(uuid, state.user.username, payload);
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region popToolsPanelPage
  (action$, state$) =>
    action$.pipe(
      ofType(popToolsPanelPage.type),
      withLatestFrom(state$),
      tap(([, state]) => {
        const uuid = state.sites.byId?.[state.sites.active].uuid;
        if (state.preview.toolsPanelPageStack.length && uuid) {
          setStoredPreviewToolsPanelPage(
            uuid,
            state.user.username,
            state.preview.toolsPanelPageStack[state.preview.toolsPanelPageStack.length - 1]
          );
        } else {
          removeStoredPreviewToolsPanelPage(uuid, state.user.username);
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region setPreviewEditMode
  (action$, state$) =>
    action$.pipe(
      ofType(setPreviewEditMode.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const uuid = state.sites.byId?.[state.sites.active].uuid;
        setStoredEditModeChoice(action.payload.editMode, state.user.username, uuid);
        if (action.payload.highlightMode) {
          setStoredHighlightModeChoice(action.payload.highlightMode, state.user.username, uuid);
          getHostToGuestBus().next(setHighlightMode(action.payload));
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region setHighlightMode
  (action$, state$) =>
    action$.pipe(
      ofType(setHighlightMode.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const uuid = state.sites.byId?.[state.sites.active].uuid;
        setStoredHighlightModeChoice(action.payload.highlightMode, state.user.username, uuid);
        getHostToGuestBus().next(action);
      }),
      ignoreElements()
    ),
  // endregion
  // region setEditModePadding
  (action$, state$) =>
    action$.pipe(
      ofType(setEditModePadding.type, toggleEditModePadding.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const nextValue =
          action.type === setEditModePadding.type ? action.payload.editModePadding : state.preview.editModePadding;
        setStoredEditModePadding(nextValue, state.user.username);
        getHostToGuestBus().next(setEditModePadding({ editModePadding: nextValue }));
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
        const uuid = state.sites.byId?.[state.sites.active].uuid;
        uuid && setStoredClipboard(uuid, state.user.username, payload);
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
    ),
  // endregion
  // region close/open toolbar
  (action$, state$) =>
    action$.pipe(
      ofType(openToolsPanel.type, closeToolsPanel.type),
      withLatestFrom(state$),
      tap(([, state]) => {
        const uuid = state.sites.byId?.[state.sites.active]?.uuid;
        uuid && setStoredShowToolsPanel(uuid, state.user.username, state.preview.showToolsPanel);
      }),
      ignoreElements()
    ),
  // endregion
  // region pushIcePanelPage
  (action$, state$) =>
    action$.pipe(
      ofType(pushIcePanelPage.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        if (payload) {
          const uuid = state.sites.byId?.[state.sites.active].uuid;
          uuid && setStoredICEToolsPanelPage(uuid, state.user.username, payload);
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region popIcePanelPage
  (action$, state$) =>
    action$.pipe(
      ofType(popIcePanelPage.type),
      withLatestFrom(state$),
      tap(([, state]) => {
        const uuid = state.sites.byId?.[state.sites.active].uuid;

        if (state.preview.icePanelStack.length && uuid) {
          setStoredICEToolsPanelPage(
            uuid,
            state.user.username,
            state.preview.icePanelStack[state.preview.icePanelStack.length - 1]
          );
        } else {
          removeStoredICEToolsPanelPage(uuid, state.user.username);
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region store panels width
  (action$, state$) =>
    action$.pipe(
      ofType(
        openToolsPanel.type,
        setPreviewEditMode.type,
        updateIcePanelWidth.type,
        updateToolsPanelWidth.type,
        setWindowSize.type
      ),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const { sites, preview } = state;
        setStoredICEToolsPanelWidth(sites.active, state.user.username, preview.icePanelWidth);
        setStoredPreviewToolsPanelWidth(sites.active, state.user.username, preview.toolsPanelWidth);
      }),
      ignoreElements()
    ),
  // endregion
  // region contentEvent
  (action$: Observable<StandardAction<SocketEventBase>>, state$) =>
    action$.pipe(
      ofType(contentEvent.type),
      withLatestFrom(state$),
      filter(
        ([action, state]) =>
          action.payload.targetPath === state.preview.guest.path && action.payload.user.username !== state.user.username
      ),
      map(([action]) => mainModelModifiedExternally(action.payload))
    )
  // endregion
] as CrafterCMSEpic[];
