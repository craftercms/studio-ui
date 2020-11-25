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

import { ActionsObservable, ofType, StateObservable } from 'redux-observable';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  completeDetailedItem,
  cutItem,
  duplicateAsset,
  duplicateItem,
  fetchDetailedItem,
  fetchDetailedItemComplete,
  fetchDetailedItemFailed,
  fetchQuickCreateList as fetchQuickCreateListAction,
  fetchQuickCreateListComplete,
  fetchQuickCreateListFailed,
  fetchUserPermissions,
  fetchUserPermissionsComplete,
  fetchUserPermissionsFailed,
  pasteItem,
  reloadDetailedItem,
  unSetClipBoard
} from '../actions/content';
import { catchAjaxError } from '../../utils/ajax';
import { cut, duplicate, fetchQuickCreateList, getDetailedItem, paste } from '../../services/content';
import StandardAction from '../../models/StandardAction';
import GlobalState from '../../models/GlobalState';
import { GUEST_CHECK_IN } from '../actions/preview';
import { getUserPermissions } from '../../services/security';
import { NEVER } from 'rxjs';
import { showCodeEditorDialog, showEditDialog } from '../actions/dialogs';
import { isEditableAsset } from '../../utils/content';
import {
  emitSystemEvent,
  itemDuplicated,
  itemsPasted,
  showCutItemSuccessNotification,
  showPasteItemSuccessNotification
} from '../actions/system';
import { batchActions } from '../actions/misc';

const content = [
  // region Quick Create
  (action$: ActionsObservable<StandardAction>, $state: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(fetchQuickCreateListAction.type),
      withLatestFrom($state),
      switchMap(([, { sites: { active } }]) =>
        fetchQuickCreateList(active).pipe(map(fetchQuickCreateListComplete), catchAjaxError(fetchQuickCreateListFailed))
      )
    ),
  // endregion
  // region getUserPermissions
  (action$: ActionsObservable<StandardAction>, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(GUEST_CHECK_IN, fetchUserPermissions.type),
      filter(({ payload }) => !payload.__CRAFTERCMS_GUEST_LANDING__),
      withLatestFrom(state$),
      filter(([{ payload }, state]) => !state.content.items.permissionsByPath?.[payload.path]),
      switchMap(([{ payload }, state]) =>
        getUserPermissions(state.sites.active, payload.path, state.user.username).pipe(
          map((permissions: string[]) =>
            fetchUserPermissionsComplete({
              path: payload.path,
              permissions
            })
          ),
          catchAjaxError(fetchUserPermissionsFailed)
        )
      )
    ),
  // endregion
  // region Items fetchDetailedItem
  (action$: ActionsObservable<StandardAction>, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(fetchDetailedItem.type, reloadDetailedItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload, type }, state]) => {
        if (type !== reloadDetailedItem.type && state.content.items.byPath?.[payload.path]) {
          return NEVER;
        } else {
          return getDetailedItem(state.sites.active, payload.path).pipe(
            map((item) => fetchDetailedItemComplete(item)),
            catchAjaxError(fetchDetailedItemFailed)
          );
        }
      })
    ),
  (action$: ActionsObservable<StandardAction>, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(completeDetailedItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload, type }, state]) => {
        if (state.content.items.byPath?.[payload.path]?.live) {
          return NEVER;
        } else {
          return getDetailedItem(state.sites.active, payload.path).pipe(
            map((item) => fetchDetailedItemComplete(item)),
            catchAjaxError(fetchDetailedItemFailed)
          );
        }
      })
    ),
  // endregion
  // region Item Duplicate
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(duplicateItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return duplicate(state.sites.active, payload.path).pipe(
          map((path) =>
            batchActions([
              emitSystemEvent(itemDuplicated({ target: payload.path, resultPath: path })),
              showEditDialog({
                src: `${state.env.authoringBase}/legacy/form?site=${state.sites.active}&path=${path}&type=form`,
                onSaveSuccess: payload.onSuccess
              })
            ])
          )
        );
      })
    ),
  // endregion
  // region Asset Duplicate
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(duplicateAsset.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return duplicate(state.sites.active, payload.path).pipe(
          map((path) => {
            const editableAsset = isEditableAsset(payload.path);
            if (editableAsset) {
              const src = `${state.env.authoringBase}/legacy/form?site=${state.sites.active}&path=${path}&type=asset`;
              return batchActions([
                emitSystemEvent(itemDuplicated({ target: payload.path, resultPath: path })),
                showCodeEditorDialog({
                  src,
                  onSuccess: payload.onSuccess
                })
              ]);
            } else {
              return emitSystemEvent(itemDuplicated({ target: payload.path, resultPath: path }));
            }
          })
        );
      })
    ),
  // endregion
  // region Item Cut
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(cutItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return cut(state.sites.active, payload.path).pipe(
          map(({ success }) => {
            if (success) {
              return showCutItemSuccessNotification();
            } else {
              return NEVER;
            }
          })
        );
      })
    ),
  // endregion
  // region Item Pasted
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(pasteItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return paste(state.sites.active, payload.path).pipe(
          map((resultingPaths) => {
            return batchActions([
              emitSystemEvent(itemsPasted({ target: payload.path, resultingPaths })),
              unSetClipBoard(),
              showPasteItemSuccessNotification()
            ]);
          })
        );
      })
    )
  // endregion
];

export default content;
