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

import { ActionsObservable, ofType } from 'redux-observable';
import { filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  clearClipboard,
  completeDetailedItem,
  conditionallyUnlockItem,
  duplicateAsset,
  duplicateItem,
  duplicateWithPolicyValidation,
  fetchDetailedItem,
  fetchDetailedItemComplete,
  fetchDetailedItemFailed,
  fetchQuickCreateList as fetchQuickCreateListAction,
  fetchQuickCreateListComplete,
  fetchQuickCreateListFailed,
  fetchSandboxItem,
  fetchSandboxItemComplete,
  fetchSandboxItemFailed,
  FetchSandboxItemPayload,
  pasteItem,
  pasteItemWithPolicyValidation,
  reloadDetailedItem,
  unlockItem
} from '../actions/content';
import { catchAjaxError } from '../../utils/ajax';
import {
  duplicate,
  fetchDetailedItem as fetchDetailedItemService,
  fetchQuickCreateList,
  fetchSandboxItem as fetchSandboxItemService,
  paste,
  unlock
} from '../../services/content';
import { merge, of } from 'rxjs';
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
import { getParentPath, isValidCutPastePath, withIndex, withoutIndex } from '../../utils/path';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { validateActionPolicy } from '../../services/sites';
import { defineMessages } from 'react-intl';
import { CrafterCMSEpic } from '../store';
import { popDialog, pushDialog } from '../reducers/dialogs/minimizedDialogs';
import { nanoid as uuid } from 'nanoid';
import StandardAction from '../../models/StandardAction';

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
  // region Items fetchDetailedItem
  (action$, state$) =>
    action$.pipe(
      ofType(fetchDetailedItem.type, reloadDetailedItem.type),
      withLatestFrom(state$),
      filter(
        ([{ payload, type }, state]) =>
          // Only fetch if the item isn't already in state or it is an explicit re-fetch
          // request (via reloadDetailedItem action)
          !state.content.itemsByPath[payload.path] || type === reloadDetailedItem.type
      ),
      switchMap(([{ payload }, state]) =>
        fetchDetailedItemService(state.sites.active, payload.path).pipe(
          map(fetchDetailedItemComplete),
          catchAjaxError(fetchDetailedItemFailed)
        )
      )
    ),
  (action$, state$) =>
    action$.pipe(
      ofType(completeDetailedItem.type),
      withLatestFrom(state$),
      // Only fetch if the item isn't fully loaded (i.e. it's a parsed SandboxItem and need the DetailedItems)
      filter(([{ payload }, state]) => !state.content.itemsByPath?.[payload.path]?.live),
      mergeMap(([{ payload }, state]) =>
        fetchDetailedItemService(state.sites.active, payload.path).pipe(
          map((item) => fetchDetailedItemComplete(item)),
          catchAjaxError(fetchDetailedItemFailed)
        )
      )
    ),
  // endregion
  // region fetchSandboxItem
  (action$: ActionsObservable<StandardAction<FetchSandboxItemPayload>>, state$) =>
    action$.pipe(
      ofType(fetchSandboxItem.type),
      withLatestFrom(state$),
      // Only fetch if force is true or the item isn't loaded
      filter(
        ([
          {
            payload: { path, force }
          },
          state
        ]) => force || !state.content.itemsByPath[path]
      ),
      mergeMap(([{ payload }, state]) =>
        fetchSandboxItemService(state.sites.active, payload.path).pipe(
          map((item) => fetchSandboxItemComplete({ item })),
          catchAjaxError(fetchSandboxItemFailed)
        )
      )
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
                site: state.sites.active,
                path,
                authoringBase: state.env.authoringBase,
                onSaveSuccess: payload.onSuccess
              })
            ])
          )
        );
      })
    ),
  // endregion
  // region unlockItem
  (action$, state$) =>
    action$.pipe(
      ofType(unlockItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        return unlock(state.sites.active, payload.path).pipe(
          map(() =>
            payload.notify === false
              ? emitSystemEvent(itemUnlocked({ target: payload.path }))
              : batchActions([
                  emitSystemEvent(itemUnlocked({ target: payload.path })),
                  showUnlockItemSuccessNotification()
                ])
          )
        );
      })
    ),
  // endregion
  // region conditionallyUnlockItem
  (action$, state$) =>
    action$.pipe(
      ofType(conditionallyUnlockItem.type),
      withLatestFrom(state$),
      filter(
        ([{ payload }, state]) =>
          !state.content.itemsByPath[payload.path].lockOwner ||
          state.content.itemsByPath[payload.path].lockOwner === state.user.username
      ),
      switchMap(([{ payload }, state]) => {
        return unlock(state.sites.active, payload.path).pipe(
          map(() =>
            payload.notify === false
              ? emitSystemEvent(itemUnlocked({ target: payload.path }))
              : batchActions([
                  emitSystemEvent(itemUnlocked({ target: payload.path })),
                  showUnlockItemSuccessNotification()
                ])
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
              return batchActions([
                emitSystemEvent(itemDuplicated({ target: payload.path, resultPath: path })),
                showCodeEditorDialog({
                  authoringBase: state.env.authoringBase,
                  site: state.sites.active,
                  path,
                  type: 'asset',
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
      filter(([{ payload }, state]) => {
        if (isValidCutPastePath(payload.path, state.content.clipboard.sourcePath)) {
          return true;
        } else {
          getHostToHostBus().next(
            showSystemNotification({
              message: getIntl().formatMessage(itemFailureMessages.itemPasteToChildNotAllowed),
              options: { variant: 'error' }
            })
          );
          return false;
        }
      }),
      switchMap(([{ payload }, state]) => {
        const id = uuid();
        return merge(
          of(
            pushDialog({
              minimized: true,
              id,
              status: 'indeterminate',
              title: getIntl().formatMessage(inProgressMessages.pasting),
              onMaximized: null
            })
          ),
          paste(state.sites.active, payload.path, state.content.clipboard).pipe(
            map(() =>
              batchActions([
                emitSystemEvent(itemsPasted({ target: payload.path, clipboard: state.content.clipboard })),
                clearClipboard(),
                showPasteItemSuccessNotification(),
                popDialog({ id })
              ])
            )
          )
        );
      })
    ),
  // endregion
  // region Item Paste with validation policy
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(pasteItemWithPolicyValidation.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        let fileName = withoutIndex(state.content.clipboard.sourcePath)
          .split('/')
          .pop();
        if (
          state.content.clipboard.sourcePath.startsWith('/site/website') &&
          state.content.clipboard.sourcePath.endsWith('index.xml')
        ) {
          fileName = withIndex(fileName);
        }
        return validateActionPolicy(state.sites.active, {
          type: state.content.clipboard.type === 'CUT' ? 'MOVE' : 'COPY',
          target: `${withoutIndex(payload.path)}/${fileName}`,
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
