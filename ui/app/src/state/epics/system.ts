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
import { filter, ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { itemSuccessMessages } from '../../utils/i18n-legacy';
import {
  emitSystemEvent,
  fetchGlobalPreferences as fetchGlobalPreferencesAction,
  fetchGlobalPreferencesComplete,
  fetchSitePreferences as fetchSitePreferencesAction,
  deletePreferences as deletePreferencesAction,
  fetchSitePreferencesComplete,
  deletePreferencesComplete,
  showCopyItemSuccessNotification,
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
import { deletePreferences, fetchGlobalPreferences, fetchSitePreferences } from '../../services/users';
import { NEVER, fromEvent } from 'rxjs';

const systemEpics: CrafterCMSEpic[] = [
  (action$) =>
    action$.pipe(
      ofType(emitSystemEvent.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(payload);
      }),
      ignoreElements()
    ),
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
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showPublishItemSuccessNotification.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        const hostToHost$ = getHostToHostBus();
        const isAdmin = state.user.rolesBySite[state.sites.active].includes('admin');
        hostToHost$.next(
          showSystemNotification({
            message:
              payload.schedule === 'now'
                ? getIntl().formatMessage(
                    isAdmin ? itemSuccessMessages.itemPublishedNow : itemSuccessMessages.itemRequestedToPublishNow,
                    {
                      count: payload.items.length,
                      environment: payload.environment
                    }
                  )
                : getIntl().formatMessage(
                    isAdmin
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
  (action$) =>
    action$.pipe(
      ofType(showSystemNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(showSystemNotification(payload));
      }),
      ignoreElements()
    ),
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
  (action$, state$, { systemBroadcastChannel }) =>
    // @ts-ignore
    action$.pipe(
      // When store is initialized...
      ofType(storeInitialized.type),
      // ...if the browser supports Broadcast Channels,
      // ...begin listening for system events sent through the broadcast channel.
      switchMap(() =>
        [
          // TODO: Not working
          // Boolean(systemBroadcastChannel) && fromEvent<MessageEvent>(systemBroadcastChannel, 'message').pipe(filter((e) => e.data && e.data.type)),
          fetchGlobalPreferencesAction(),
          fetchSitePreferencesAction()
        ].filter(Boolean)
      )
      // This mechanism has been added to support multi-tab UX on studio with the JWT mechanics since,
      // when other tabs are opened, refreshToken API is called, invalidating the token of other tabs.
      // The idea, however, is that this mechanics are now available for other purposes.
    ),
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(fetchGlobalPreferencesAction.type),
      switchMap(() => fetchGlobalPreferences().pipe(map(fetchGlobalPreferencesComplete)))
    ),
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(fetchSitePreferencesAction.type),
      withLatestFrom(state$),
      switchMap(([, state]) =>
        state.sites.active ? fetchSitePreferences(state.sites.active).pipe(map(fetchSitePreferencesComplete)) : NEVER
      )
    ),
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(deletePreferencesAction.type),
      switchMap((action) => deletePreferences(action.payload.siteId).pipe(map(deletePreferencesComplete)))
    )
];

export default systemEpics;
