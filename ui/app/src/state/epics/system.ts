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

import { ofType } from 'redux-observable';
import {
  exhaustMap,
  filter,
  ignoreElements,
  map,
  mapTo,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { itemSuccessMessages } from '../../utils/i18n-legacy';
import {
  emitSystemEvent,
  fetchGlobalMenu,
  fetchGlobalMenuComplete,
  fetchGlobalMenuFailed,
  fetchUseLegacyPreviewPreference,
  fetchUseLegacyPreviewPreferenceComplete,
  fetchUseLegacyPreviewPreferenceFailed,
  messageSharedWorker,
  showCopyItemSuccessNotification,
  showCreateFolderSuccessNotification,
  showCreateItemSuccessNotification,
  showCutItemSuccessNotification,
  showDeleteItemSuccessNotification,
  showDuplicatedItemSuccessNotification,
  showEditItemSuccessNotification,
  showPasteItemSuccessNotification,
  showPublishItemSuccessNotification,
  showRejectItemSuccessNotification,
  showRevertItemSuccessNotification,
  showSystemNotification,
  showUnlockItemSuccessNotification,
  storeInitialized
} from '../actions/system';
import { CrafterCMSEpic } from '../store';
import {
  fetchPublishingStatus,
  fetchPublishingStatusComplete,
  fetchPublishingStatusFailed,
  startPublishingStatusFetcher,
  stopPublishingStatusFetcher
} from '../actions/publishingStatus';
import { fetchStatus } from '../../services/publishing';
import { catchAjaxError } from '../../utils/ajax';
import { changeSite } from '../reducers/sites';
import { interval } from 'rxjs';
import { sessionTimeout } from '../actions/user';
import { sharedWorkerUnauthenticated } from '../actions/auth';
import {
  fetchGlobalMenuItems,
  fetchUseLegacyPreviewPreference as fetchUseLegacyPreviewPreferenceService
} from '../../services/configuration';
import { fetchSiteConfig } from '../actions/configuration';
import { getStoredShowToolsPanel } from '../../utils/state';
import { closeToolsPanel, openToolsPanel } from '../actions/preview';

const systemEpics: CrafterCMSEpic[] = [
  // region storeInitialized
  (action$, state$) =>
    action$.pipe(
      ofType(storeInitialized.type),
      withLatestFrom(state$),
      switchMap(([, state]) => {
        const showToolsPanel = getStoredShowToolsPanel(state.sites.byId[state.sites.active].uuid, state.user.username);
        return [
          fetchGlobalMenu(),
          ...(Boolean(state.sites.active)
            ? [
                startPublishingStatusFetcher(),
                fetchSiteConfig(),
                showToolsPanel === null || state.preview.showToolsPanel === (showToolsPanel === 'true')
                  ? false
                  : state.preview.showToolsPanel
                  ? closeToolsPanel()
                  : openToolsPanel()
              ].filter(Boolean)
            : [])
        ];
      })
    ),
  // endregion
  // region changeSite
  (action$) =>
    action$.pipe(
      ofType(changeSite.type),
      switchMap(() => [startPublishingStatusFetcher(), fetchSiteConfig()])
    ),
  // endregion
  // region emitSystemEvent
  (action$) =>
    action$.pipe(
      ofType(emitSystemEvent.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(payload);
      }),
      ignoreElements()
    ),
  // endregion
  // region showDeleteItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showDeleteItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemDeleted, {
              count: payload.items.length
            })
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showPublishItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showPublishItemSuccessNotification.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        const hostToHost$ = getHostToHostBus();
        const { type } = payload;
        hostToHost$.next(
          showSystemNotification({
            message:
              payload.schedule === 'now'
                ? getIntl().formatMessage(
                    type === 'publish'
                      ? itemSuccessMessages.itemPublishedNow
                      : itemSuccessMessages.itemRequestedToPublishNow,
                    {
                      count: payload.items.length,
                      environment: payload.environment
                    }
                  )
                : getIntl().formatMessage(
                    type === 'publish'
                      ? itemSuccessMessages.itemSchedulePublished
                      : itemSuccessMessages.itemRequestedToSchedulePublish,
                    {
                      count: payload.items.length,
                      environment: payload.environment
                    }
                  )
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showEditItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showEditItemSuccessNotification.type),
      tap(({ payload: { action } }) => {
        let message;
        if (action === 'save') {
          message = getIntl().formatMessage(itemSuccessMessages.itemSavedAsDraft);
        } else {
          message = getIntl().formatMessage(itemSuccessMessages.itemEdited);
        }
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showCreateItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showCreateItemSuccessNotification.type),
      tap(({ payload: { action } }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemCreated)
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showCreateFolderSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showCreateFolderSuccessNotification.type),
      tap(({ payload: { action } }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.folderCreated)
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showCopyItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showCopyItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemCopied, {
              count: payload?.paths.length ?? 1
            })
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showCutItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showCutItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemCut)
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showPasteItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showPasteItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemPasted)
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showUnlockItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showUnlockItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemUnlocked)
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showDuplicatedItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showDuplicatedItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemDuplicated)
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showRevertItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showRevertItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemReverted)
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region showSystemNotification
  (action$) =>
    action$.pipe(
      ofType(showSystemNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(showSystemNotification(payload));
      }),
      ignoreElements()
    ),
  // endregion
  // region showRejectItemSuccessNotification
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showRejectItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemRejected, { count: payload?.count ?? 1 })
          })
        );
      }),
      ignoreElements()
    ),
  // endregion
  // region messageSharedWorker
  (action$, state$, { worker }) =>
    action$.pipe(
      ofType(messageSharedWorker.type),
      tap((action) => {
        worker.port.postMessage(action.payload);
      }),
      ignoreElements()
    ),
  // endregion
  // region fetchPublishingStatus
  (action$, state$) =>
    action$.pipe(
      ofType(fetchPublishingStatus.type),
      withLatestFrom(state$),
      filter(([, state]) => Boolean(state.sites.active)),
      exhaustMap(([, state]) =>
        fetchStatus(state.sites.active).pipe(
          map((response) => fetchPublishingStatusComplete(response)),
          catchAjaxError(fetchPublishingStatusFailed)
        )
      )
    ),
  // endregion
  // region startPublishingStatusFetcher
  (action$, state$) =>
    action$.pipe(
      ofType(startPublishingStatusFetcher.type),
      withLatestFrom(state$),
      filter(([, state]) => Boolean(state.sites.active)),
      switchMap(() =>
        interval(150000).pipe(
          startWith(0), // To fetch status immediately
          mapTo(fetchPublishingStatus()),
          takeUntil(
            action$.pipe(
              ofType(stopPublishingStatusFetcher.type, sessionTimeout.type, sharedWorkerUnauthenticated.type)
            )
          )
        )
      )
    ),
  // endregion
  // region fetchGlobalMenu
  (action$) =>
    action$.pipe(
      ofType(fetchGlobalMenu.type),
      exhaustMap(() => fetchGlobalMenuItems().pipe(map(fetchGlobalMenuComplete), catchAjaxError(fetchGlobalMenuFailed)))
    ),
  // endregion
  // region fetchUseLegacyPreviewPreference
  (action$, state$) =>
    action$.pipe(
      ofType(fetchUseLegacyPreviewPreference.type),
      withLatestFrom(state$),
      filter(([action, state]) => Boolean(state.sites.active || action.payload?.site)),
      exhaustMap(([action, state]) =>
        fetchUseLegacyPreviewPreferenceService(action.payload?.site || state.sites.active).pipe(
          map((useLegacyPreview) =>
            fetchUseLegacyPreviewPreferenceComplete({
              useLegacyPreview,
              site: action.payload?.site || state.sites.active
            })
          ),
          catchAjaxError(fetchUseLegacyPreviewPreferenceFailed)
        )
      )
    )
  // endregion
];

export default systemEpics;
