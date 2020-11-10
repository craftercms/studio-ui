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
import { ignoreElements, tap } from 'rxjs/operators';
import { showSystemNotification } from '../actions/preview';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { IntlShape } from 'react-intl';
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
  showRevertItemSuccessNotification
} from '../actions/system';

export default [
  (action$) =>
    action$.pipe(
      ofType(emitSystemEvent.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(payload);
      }),
      ignoreElements()
    ),
  (action$, state$, { intlRef: { current: intl } }: { intlRef: { current: IntlShape } }) =>
    action$.pipe(
      ofType(showDeleteItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: intl.formatMessage(itemSuccessMessages.itemDeleted, {
              count: payload.items.length
            })
          })
        );
      }),
      ignoreElements()
    ),
  (action$, state$, { intlRef: { current: intl } }: { intlRef: { current: IntlShape } }) =>
    action$.pipe(
      ofType(showPublishItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message:
              payload.schedule === 'now'
                ? intl.formatMessage(itemSuccessMessages.itemPublishedNow, {
                    count: payload.items.length,
                    environment: payload.environment
                  })
                : intl.formatMessage(itemSuccessMessages.itemSchedulePublished, {
                    count: payload.items.length,
                    environment: payload.environment
                  })
          })
        );
      }),
      ignoreElements()
    ),
  (action$, state$, { intlRef: { current: intl } }: { intlRef: { current: IntlShape } }) =>
    action$.pipe(
      ofType(showEditItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: intl.formatMessage(itemSuccessMessages.itemEdited)
          })
        );
      }),
      ignoreElements()
    ),
  (action$, state$, { intlRef: { current: intl } }: { intlRef: { current: IntlShape } }) =>
    action$.pipe(
      ofType(showCopyItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: intl.formatMessage(itemSuccessMessages.itemCopied, {
              count: payload?.children.length ?? 1
            })
          })
        );
      }),
      ignoreElements()
    ),
  (action$, state$, { intlRef: { current: intl } }: { intlRef: { current: IntlShape } }) =>
    action$.pipe(
      ofType(showCutItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: intl.formatMessage(itemSuccessMessages.itemCut)
          })
        );
      }),
      ignoreElements()
    ),
  (action$, state$, { intlRef: { current: intl } }: { intlRef: { current: IntlShape } }) =>
    action$.pipe(
      ofType(showPasteItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: intl.formatMessage(itemSuccessMessages.itemPasted)
          })
        );
      }),
      ignoreElements()
    ),
  (action$, state$, { intlRef: { current: intl } }: { intlRef: { current: IntlShape } }) =>
    action$.pipe(
      ofType(showDuplicatedItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: intl.formatMessage(itemSuccessMessages.itemDuplicated)
          })
        );
      }),
      ignoreElements()
    ),
  (action$, state$, { intlRef: { current: intl } }: { intlRef: { current: IntlShape } }) =>
    action$.pipe(
      ofType(showRevertItemSuccessNotification.type),
      tap(({ payload }) => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: intl.formatMessage(itemSuccessMessages.itemReverted)
          })
        );
      }),
      ignoreElements()
    )
] as Epic[];
