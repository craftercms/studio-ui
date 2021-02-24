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
import { filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  completeDetailedItem,
  duplicateAsset,
  duplicateItem,
  duplicateWithPolicyValidation,
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
  pasteItemWithPolicyValidation,
  reloadDetailedItem,
  unlockItem,
  unSetClipBoard
} from '../actions/content';
import { catchAjaxError } from '../../utils/ajax';
import {
  duplicate,
  fetchDetailedItem as fetchDetailedItemService,
  fetchQuickCreateList,
  paste,
  unlock
} from '../../services/content';
import { GUEST_CHECK_IN } from '../actions/preview';
import { getUserPermissions } from '../../services/security';
import { merge, NEVER, of } from 'rxjs';
import { closeConfirmDialog, showCodeEditorDialog, showConfirmDialog, showEditDialog } from '../actions/dialogs';
import { isEditableAsset } from '../../utils/content';
import {
  emitSystemEvent,
  itemDuplicated,
  itemsPasted,
  itemUnlocked,
  showDuplicatedItemSuccessNotification,
  showPasteItemSuccessNotification,
  showSystemNotification,
  showUnlockItemSuccessNotification
} from '../actions/system';
import { batchActions } from '../actions/misc';
import { getParentPath, isValidCutPastePath, withoutIndex } from '../../utils/path';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { validateActionPolicy } from '../../services/sites';
import { defineMessages } from 'react-intl';
import { CrafterCMSEpic } from '../store';
import { popDialog, pushDialog } from '../reducers/dialogs/minimizedDialogs';

export const sitePolicyMessages = defineMessages({
  itemPastePolicyConfirm: {
    id: 'pastePolicy.confirm',
    defaultMessage:
      'The selected {action} target goes against site policies for the destination directory. • Original path: "{path}", • Suggested path is: "{modifiedPath}". Would you like to use the suggested path?'
  },
  itemPastePolicyError: {
    id: 'pastePolicy.error',
    defaultMessage: 'The selected {action} target goes against site policies for the destination directory.'
  }
});

export const itemFailureMessages = defineMessages({
  itemPasteToChildNotAllowed: {
    id: 'item.itemPasteToChildNotAllowed',
    defaultMessage: 'Pasting to a child item is not allowed for cut'
  }
});

const inProgressMessages = defineMessages({
  pasting: {
    id: 'item.pasting',
    defaultMessage: 'Pasting...'
  }
});

const content: CrafterCMSEpic[] = [
  // region Quick Create
  (action$, $state) =>
    action$.pipe(
      ofType(fetchQuickCreateListAction.type),
      withLatestFrom($state),
      switchMap(([, { sites: { active } }]) =>
        fetchQuickCreateList(active).pipe(map(fetchQuickCreateListComplete), catchAjaxError(fetchQuickCreateListFailed))
      )
    ),
  // endregion
  // region getUserPermissions
  (action$, state$) =>
    action$.pipe(
      ofType(GUEST_CHECK_IN, fetchUserPermissions.type),
      filter(({ payload }) => !payload.__CRAFTERCMS_GUEST_LANDING__),
      withLatestFrom(state$),
      filter(([{ payload }, state]) => !state.content.items.permissionsByPath?.[payload.path]),
      mergeMap(([{ payload }, state]) =>
        getUserPermissions(state.sites.active, payload.path).pipe(
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
  (action$, state$) =>
    action$.pipe(
      ofType(fetchDetailedItem.type, reloadDetailedItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload, type }, state]) => {
        if (type !== reloadDetailedItem.type && state.content.items.byPath?.[payload.path]) {
          return NEVER;
        } else {
          return fetchDetailedItemService(state.sites.active, payload.path).pipe(
            map((item) => fetchDetailedItemComplete(item)),
            catchAjaxError(fetchDetailedItemFailed)
          );
        }
      })
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(completeDetailedItem.type),
      withLatestFrom(state$),
      mergeMap(([{ payload, type }, state]) => {
        if (state.content.items.byPath?.[payload.path]?.live) {
          return NEVER;
        } else {
          return fetchDetailedItemService(state.sites.active, payload.path).pipe(
            map((item) => fetchDetailedItemComplete(item)),
            catchAjaxError(fetchDetailedItemFailed)
          );
        }
      })
    ),
  // endregion
  // region Item Duplicate
  (action$, state$) =>
    action$.pipe(
      ofType(duplicateItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return duplicate(state.sites.active, payload.path).pipe(
          map(({ item: path }) =>
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
  (action$, state$) =>
    action$.pipe(
      ofType(unlockItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return unlock(state.sites.active, payload.path).pipe(
          map(() =>
            batchActions([emitSystemEvent(itemUnlocked({ target: payload.path })), showUnlockItemSuccessNotification()])
          )
        );
      })
    ),
  // endregion
  // region Asset Duplicate
  (action$, state$) =>
    action$.pipe(
      ofType(duplicateAsset.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return duplicate(state.sites.active, payload.path).pipe(
          map(({ item: path }) => {
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
  // region Duplicate with validation policy
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(duplicateWithPolicyValidation.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return validateActionPolicy(state.sites.active, {
          type: 'COPY',
          target: payload.path,
          source: getParentPath(withoutIndex(payload.path))
        }).pipe(
          map(({ allowed, modifiedValue, target }) => {
            if (allowed && modifiedValue) {
              return showConfirmDialog({
                body: getIntl().formatMessage(sitePolicyMessages.itemPastePolicyConfirm, {
                  action: 'duplicate',
                  path: target,
                  modifiedPath: modifiedValue
                }),
                onCancel: closeConfirmDialog(),
                onOk: batchActions([
                  ...(payload.type === 'item'
                    ? [
                        duplicateItem({
                          path: payload.path,
                          onSuccess: showDuplicatedItemSuccessNotification()
                        })
                      ]
                    : [
                        duplicateAsset({
                          path: payload.path,
                          onSuccess: showDuplicatedItemSuccessNotification()
                        })
                      ]),
                  closeConfirmDialog()
                ])
              });
            } else if (allowed) {
              return payload.type === 'item'
                ? duplicateItem({
                    path: payload.path,
                    onSuccess: showDuplicatedItemSuccessNotification()
                  })
                : duplicateAsset({
                    path: payload.path,
                    onSuccess: showDuplicatedItemSuccessNotification()
                  });
            } else {
              return showConfirmDialog({
                body: getIntl().formatMessage(sitePolicyMessages.itemPastePolicyError, { action: duplicate })
              });
            }
          })
        );
      })
    ),
  // endregion
  // region Item Paste
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(pasteItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        if (isValidCutPastePath(payload.path, state.content.clipboard.sourcePath)) {
          // return merge (of pushDialog, paste....)
          return merge(
            of(
              pushDialog({
                minimized: true,
                id: `pasting-${state.content.clipboard.sourcePath}-${payload.path}`,
                status: 'indeterminate',
                title: getIntl().formatMessage(inProgressMessages.pasting),
                showMaximizeButton: false
              })
            ),
            paste(state.sites.active, payload.path, state.content.clipboard).pipe(
              map(({ items }) => {
                return batchActions([
                  emitSystemEvent(itemsPasted({ target: payload.path, clipboard: state.content.clipboard })),
                  unSetClipBoard(),
                  showPasteItemSuccessNotification(),
                  popDialog({
                    id: `pasting-${state.content.clipboard.sourcePath}-${payload.path}`
                  })
                ]);
              })
            )
          );
        } else {
          const hostToHost$ = getHostToHostBus();
          hostToHost$.next(
            showSystemNotification({
              message: getIntl().formatMessage(itemFailureMessages.itemPasteToChildNotAllowed),
              options: {
                variant: 'error'
              }
            })
          );
          return NEVER;
        }
      })
    ),
  // endregion
  // region Item Paste with validation policy
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(pasteItemWithPolicyValidation.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return validateActionPolicy(state.sites.active, {
          type: state.content.clipboard.type === 'CUT' ? 'MOVE' : 'COPY',
          target: payload.path,
          source: state.content.clipboard.sourcePath
        }).pipe(
          map(({ allowed, modifiedValue, target }) => {
            if (allowed && modifiedValue) {
              return showConfirmDialog({
                body: getIntl().formatMessage(sitePolicyMessages.itemPastePolicyConfirm, {
                  action: state.content.clipboard.type === 'CUT' ? 'cut' : 'copy',
                  path: target,
                  modifiedPath: modifiedValue
                }),
                onCancel: closeConfirmDialog(),
                onOk: batchActions([pasteItem({ path: payload.path }), closeConfirmDialog()])
              });
            } else if (allowed) {
              return pasteItem({
                path: payload.path
              });
            } else {
              return showConfirmDialog({
                body: getIntl().formatMessage(sitePolicyMessages.itemPastePolicyError, {
                  action: state.content.clipboard.type === 'CUT' ? 'cut' : 'copy'
                })
              });
            }
          })
        );
      })
    )
  // endregion
];

export default content;
