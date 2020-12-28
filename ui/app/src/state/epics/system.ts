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
import { filter, ignoreElements, switchMap, tap } from 'rxjs/operators';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { itemSuccessMessages } from '../../utils/i18n-legacy';
import {
  emitSystemEvent,
  showCopyItemSuccessNotification,
  showCutItemSuccessNotification,
  showDeleteItemSuccessNotification,
  showDuplicatedItemSuccessNotification,
  showEditItemSuccessNotification,
  showPasteItemSuccessNotification,
  showPublishItemSuccessNotification,
  showRevertItemSuccessNotification,
  showSystemNotification,
  showUnlockItemSuccessNotification,
  storeInitialized
} from '../actions/system';
import { CrafterCMSEpic } from '../store';
import { fromEvent } from 'rxjs';

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
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message:
              payload.schedule === 'now'
                ? getIntl().formatMessage(itemSuccessMessages.itemPublishedNow, {
                    count: payload.items.length,
                    environment: payload.environment
                  })
                : getIntl().formatMessage(itemSuccessMessages.itemSchedulePublished, {
                    count: payload.items.length,
                    environment: payload.environment
                  })
          })
        );
      }),
      ignoreElements()
    ),
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(showEditItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(itemSuccessMessages.itemEdited)
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
  (action$, state$, { systemBroadcastChannel }) =>
    action$.pipe(
      // When store is initialized...
      ofType(storeInitialized.type),
      // ...if the browser supports Broadcast Channels,
      filter(() => Boolean(systemBroadcastChannel)),
      // ...begin listening for system events sent through the broadcast channel.
      switchMap(() =>
        fromEvent<MessageEvent>(systemBroadcastChannel, 'message').pipe(filter((e) => e.data && e.data.type))
      )
      // This mechanism has been added to support multi-tab UX on studio with the JWT mechanics since,
      // when other tabs are opened, refreshToken API is called, invalidating the token of other tabs.
      // The idea, however, is that this mechanics are now available for other purposes.
    )
];

export default systemEpics;
