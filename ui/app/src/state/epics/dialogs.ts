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
import { ignoreElements, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { NEVER, Observable, of } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import { camelize, dasherize } from '../../utils/string';
import {
  closeCompareVersionsDialog,
  closeConfirmDialog,
  closeDeleteDialog,
  closeDependenciesDialog,
  closeHistoryDialog,
  closeNewContentDialog,
  closePublishDialog,
  closeViewVersionDialog,
  fetchContentVersion,
  fetchContentVersionComplete,
  fetchContentVersionFailed,
  fetchDeleteDependencies,
  fetchDeleteDependenciesComplete,
  fetchDeleteDependenciesFailed,
  newContentCreationComplete,
  showCopyItemSuccessNotification,
  showDeleteItemSuccessNotification,
  showEditItemSuccessNotification,
  showPublishItemSuccessNotification,
  showRevertItemSuccessNotification
} from '../actions/dialogs';
import { fetchDeleteDependencies as fetchDeleteDependenciesService } from '../../services/dependencies';
import { getVersion } from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import { batchActions } from '../actions/misc';
import StandardAction from '../../models/StandardAction';
import { asArray } from '../../utils/array';
import { changeCurrentUrl, showSystemNotification } from '../actions/preview';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { IntlShape } from 'react-intl';
import { itemSuccessMessages } from '../../utils/i18n-legacy';

function getDialogNameFromType(type: string): string {
  let name = getDialogActionNameFromType(type);
  return camelize(dasherize(name.toLowerCase()));
}

function getDialogActionNameFromType(type: string): string {
  return type.replace(/(CLOSE_)|(_DIALOG)/g, '');
}

function getDialogState(type: string, state: GlobalState): { onClose: StandardAction } {
  const stateName = getDialogNameFromType(type);
  const dialog = state.dialogs[stateName];
  if (!dialog) {
    console.error(`[epics/dialogs] Unable to retrieve dialog state from "${stateName}" action`);
  }
  return dialog;
}

export default [
  // region onClose Actions
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(
        closeConfirmDialog.type,
        closePublishDialog.type,
        closeDeleteDialog.type,
        closeNewContentDialog.type,
        closeHistoryDialog.type,
        closeViewVersionDialog.type,
        closeCompareVersionsDialog.type,
        closeDependenciesDialog.type
      ),
      withLatestFrom(state$),
      map(([{ type, payload }, state]) => {
        // Setting both onDismiss & onClose to the "CLOSE_*_DIALOG" action, allows escape
        // and backdrop click to work. MUI dialogs will call onClose either when escape is
        // pressed or the backdrop is clicked which is fine. When onDismiss is called, however
        // the MUI dialog would later also call the onClose action and this causes a infinite
        // "loop" of "CLOSE_*_DIALOG" actions. The filter insures the actions to be called
        // don't include the "CLOSE_*_DIALOG" action to avoid said loop.
        const onClose = getDialogState(type, state)?.onClose;

        return [
          // In the case of batch actions, save the additional BATCH_ACTIONS action itself
          // and jump straight to the actions to dispatch.
          ...asArray(payload?.type === batchActions.type ? payload.payload : payload),
          ...asArray(onClose?.type === batchActions.type ? onClose.payload : onClose)
        ].filter((action) => Boolean(action) && action.type && action.type !== type);
      }),
      switchMap((actions) => (actions.length ? actions : NEVER))
    ),
  // endregion
  // region View Version Dialog
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(fetchContentVersion.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        getVersion(state.sites.active, payload.path, payload.versionNumber).pipe(
          map(fetchContentVersionComplete),
          catchAjaxError(fetchContentVersionFailed)
        )
      )
    ),
  // endregion
  (action$, state$: Observable<GlobalState>) => action$.pipe(
    ofType(newContentCreationComplete.type),
    switchMap(({ payload }) => (payload.item?.isPage ? of(changeCurrentUrl(payload.redirectUrl)) : NEVER))
  ),
  (action$, state$, { intl }: { intl: IntlShape }) => action$.pipe(
    ofType(showDeleteItemSuccessNotification.type),
    tap(({ payload }) => {
      const hostToHost$ = getHostToHostBus();
      hostToHost$.next(showSystemNotification({
        message: intl.formatMessage(itemSuccessMessages.itemDeleted, {
          count: payload.items.length
        })
      }));
    }),
    ignoreElements()
  ),
  (action$, state$, { intl }: { intl: IntlShape }) => action$.pipe(
    ofType(showPublishItemSuccessNotification.type),
    tap(({ payload }) => {
      const hostToHost$ = getHostToHostBus();
      hostToHost$.next(showSystemNotification({
        message: payload.schedule === 'now' ? intl.formatMessage(itemSuccessMessages.itemPublishedNow, {
          count: payload.items.length,
          environment: payload.environment
        }) : intl.formatMessage(itemSuccessMessages.itemSchedulePublished, {
          count: payload.items.length,
          environment: payload.environment
        })
      }));
    }),
    ignoreElements()
  ),
  (action$, state$, { intl }: { intl: IntlShape }) => action$.pipe(
    ofType(showEditItemSuccessNotification.type),
    tap(({ payload }) => {
      const hostToHost$ = getHostToHostBus();
      hostToHost$.next(showSystemNotification({
        message: intl.formatMessage(itemSuccessMessages.itemEdited)
      }));
    }),
    ignoreElements()
  ),
  (action$, state$, { intl }: { intl: IntlShape }) => action$.pipe(
    ofType(showCopyItemSuccessNotification.type),
    tap(({ payload }) => {
      const hostToHost$ = getHostToHostBus();
      hostToHost$.next(showSystemNotification({
        message: intl.formatMessage(itemSuccessMessages.itemCopied, { count: payload?.children.length ?? 1 })
      }));
    }),
    ignoreElements()
  ),
  (action$, state$, { intl }: { intl: IntlShape }) => action$.pipe(
    ofType(showRevertItemSuccessNotification.type),
    tap(({ payload }) => {
      const hostToHost$ = getHostToHostBus();
      hostToHost$.next(showSystemNotification({
        message: intl.formatMessage(itemSuccessMessages.itemReverted)
      }));
    }),
    ignoreElements()
  ),
  (action$, state$) => action$.pipe(
    ofType(fetchDeleteDependencies.type),
    withLatestFrom(state$),
    switchMap(([{ payload: items }, state]) =>
      fetchDeleteDependenciesService(state.sites.active, items).pipe(
        map(fetchDeleteDependenciesComplete),
        catchAjaxError(fetchDeleteDependenciesFailed)
      )
    )
  )
] as Epic[];
