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

import { ofType } from 'redux-observable';
import { filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  clearClipboard,
  completeDetailedItem,
  conditionallyUnlockItem,
  deleteController,
  deleteTemplate,
  duplicateAsset,
  duplicateItem,
  duplicateWithPolicyValidation,
  fetchDetailedItem,
  fetchDetailedItemComplete,
  fetchDetailedItemFailed,
  fetchDetailedItems,
  fetchDetailedItemsComplete,
  fetchDetailedItemsFailed,
  fetchQuickCreateList as fetchQuickCreateListAction,
  fetchQuickCreateListComplete,
  fetchQuickCreateListFailed,
  fetchSandboxItem,
  fetchSandboxItemComplete,
  fetchSandboxItemFailed,
  FetchSandboxItemPayload,
  fetchSandboxItems,
  fetchSandboxItemsComplete,
  fetchSandboxItemsFailed,
  lockItem,
  lockItemCompleted,
  lockItemFailed,
  pasteItem,
  pasteItemWithPolicyValidation,
  reloadDetailedItem,
  sandboxItemsMissing,
  unlockItem
} from '../actions/content';
import { catchAjaxError } from '../../utils/ajax';
import {
  duplicate,
  fetchDetailedItem as fetchDetailedItemService,
  fetchDetailedItems as fetchDetailedItemsService,
  fetchItemByPath,
  fetchItemsByPath,
  fetchQuickCreateList,
  fetchSandboxItem as fetchSandboxItemService,
  lock,
  paste,
  unlock
} from '../../services/content';
import { merge, Observable, of } from 'rxjs';
import {
  closeConfirmDialog,
  closeDeleteDialog,
  showCodeEditorDialog,
  showConfirmDialog,
  showDeleteDialog,
  showEditDialog,
  showItemMegaMenu
} from '../actions/dialogs';
import { getEditorMode, isEditableAsset } from '../../utils/content';
import {
  blockUI,
  contentEvent,
  lockContentEvent,
  moveContentEvent,
  MoveContentEventPayload,
  showDeleteItemSuccessNotification,
  showDuplicatedItemSuccessNotification,
  showPasteItemSuccessNotification,
  showSystemNotification,
  showUnlockItemSuccessNotification,
  unblockUI
} from '../actions/system';
import { batchActions } from '../actions/misc';
import {
  getItemGroovyPath,
  getItemTemplatePath,
  getParentPath,
  isValidCopyPastePath,
  withIndex,
  withoutIndex
} from '../../utils/path';
import { getHostToHostBus } from '../../utils/subjects';
import { validateActionPolicy } from '../../services/sites';
import { defineMessages } from 'react-intl';
import { CrafterCMSEpic } from '../store';
import StandardAction from '../../models/StandardAction';
import { asArray } from '../../utils/array';
import { AjaxError } from 'rxjs/ajax';
import { showErrorDialog } from '../reducers/dialogs/error';
import { dissociateTemplate } from '../actions/preview';
import { isBlank } from '../../utils/string';
import SocketEvent from '../../models/SocketEvent';

export const sitePolicyMessages = defineMessages({
  itemPastePolicyConfirm: {
    id: 'pastePolicy.confirm',
    defaultMessage:
      'The selected {action} target goes against project policies for the destination directory ({detail}). • Original path: "{path}", • Suggested path is: "{modifiedPath}". Would you like to use the suggested path?'
  },
  itemPastePolicyError: {
    id: 'pastePolicy.error',
    defaultMessage: 'The selected {action} target goes against project policies for the destination directory: {detail}'
  },
  itemPasteValidating: {
    id: 'words.validating',
    defaultMessage: 'Validating'
  },
  duplicate: {
    id: 'words.duplicate',
    defaultMessage: 'Duplicate'
  }
});

export const itemFailureMessages = defineMessages({
  itemPasteToChildNotAllowed: {
    id: 'item.itemPasteToChildNotAllowed',
    defaultMessage: 'Pasting to a child item is not allowed for cut'
  },
  controllerNotFound: {
    id: 'item.controllerNotFound',
    defaultMessage: 'Controller not found.'
  },
  templateNotFound: {
    id: 'item.templateNotFound',
    defaultMessage: 'Template not found.'
  }
});

const inProgressMessages = defineMessages({
  pasting: {
    id: 'words.pasting',
    defaultMessage: 'Pasting'
  },
  processing: {
    id: 'words.processing',
    defaultMessage: 'Processing'
  },
  duplicating: {
    id: 'words.duplicating',
    defaultMessage: 'Duplicating'
  }
});

const content: CrafterCMSEpic[] = [
  // region fetchQuickCreateListAction
  (action$, $state) =>
    action$.pipe(
      ofType(fetchQuickCreateListAction.type),
      withLatestFrom($state),
      switchMap(
        ([
          ,
          {
            sites: { active }
          }
        ]) =>
          fetchQuickCreateList(active).pipe(
            map(fetchQuickCreateListComplete),
            catchAjaxError(fetchQuickCreateListFailed)
          )
      )
    ),
  // endregion
  // region showItemMegaMenu
  (action$) =>
    action$.pipe(
      ofType(showItemMegaMenu.type),
      map(({ payload }) => fetchSandboxItem({ path: payload.path }))
    ),
  // endregion
  // region fetchDetailedItem, reloadDetailedItem
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
      mergeMap(([{ payload }, state]) =>
        fetchDetailedItemService(state.sites.active, payload.path).pipe(
          map(fetchDetailedItemComplete),
          catchAjaxError(fetchDetailedItemFailed)
        )
      )
    ),
  // endregion
  // region fetchDetailedItems
  (action$, state$) =>
    action$.pipe(
      ofType(fetchDetailedItems.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        fetchDetailedItemsService(state.sites.active, payload.paths).pipe(
          map((items) => fetchDetailedItemsComplete({ items })),
          catchAjaxError(fetchDetailedItemsFailed)
        )
      )
    ),
  // endregion
  // region completeDetailedItem
  (action$, state$) =>
    action$.pipe(
      ofType(completeDetailedItem.type),
      withLatestFrom(state$),
      // Only fetch if the item isn't fully loaded (i.e. it's a parsed SandboxItem and need the DetailedItems)
      filter(([{ payload }, state]) => payload.force || !state.content.itemsByPath?.[payload.path]?.live),
      mergeMap(([{ payload }, state]) =>
        fetchDetailedItemService(state.sites.active, payload.path).pipe(
          map((item) => fetchDetailedItemComplete(item)),
          catchAjaxError(fetchDetailedItemFailed)
        )
      )
    ),
  // endregion
  // region fetchSandboxItem
  (action$: Observable<StandardAction<FetchSandboxItemPayload>>, state$) =>
    action$.pipe(
      ofType(fetchSandboxItem.type),
      withLatestFrom(state$),
      mergeMap(([{ payload }, state]) =>
        fetchSandboxItemService(state.sites.active, payload.path).pipe(
          map((item) => (item ? fetchSandboxItemComplete({ item }) : sandboxItemsMissing({ paths: [payload.path] }))),
          catchAjaxError(fetchSandboxItemFailed)
        )
      )
    ),
  // endregion
  // region fetchSandboxItems
  (action$, state$) =>
    action$.pipe(
      ofType(fetchSandboxItems.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        fetchItemsByPath(state.sites.active, payload.paths).pipe(
          map((items) => fetchSandboxItemsComplete({ items })),
          catchAjaxError(fetchSandboxItemsFailed)
        )
      )
    ),
  // endregion
  // region duplicateItem
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(duplicateItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        merge(
          of(
            blockUI({
              progress: 'indeterminate',
              message: `${getIntl().formatMessage(inProgressMessages.duplicating)}...`
            })
          ),
          duplicate(state.sites.active, payload.path).pipe(
            switchMap(({ item: path }) => [
              unblockUI(),
              showEditDialog({
                site: state.sites.active,
                path,
                authoringBase: state.env.authoringBase,
                onSaveSuccess: payload.onSuccess
              })
            ])
          )
        )
      ),
      catchAjaxError(
        () => unblockUI(),
        (error) => showErrorDialog({ error: error.response })
      )
    ),
  // endregion
  // region unlockItem
  (action$, state$) =>
    action$.pipe(
      ofType(unlockItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        unlock(state.sites.active, payload.path).pipe(
          // Not using the boolean return of the service. If the item it's already unlocked,
          // notify anyway of successful unlock as not notifying can be confusing (i.e. "what happened?").
          filter(() => payload.notify),
          map(() => showUnlockItemSuccessNotification())
        )
      )
    ),
  // endregion
  // region lockItem
  (action$, state$) =>
    action$.pipe(
      ofType(lockItem.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        lock(state.sites.active, payload.path).pipe(
          map(() => lockItemCompleted({ path: payload.path, username: state.user.username })),
          catchAjaxError((r) => {
            console.error(r);
            return lockItemFailed();
          })
        )
      )
    ),
  // endregion
  // region conditionallyUnlockItem
  (action$, state$) =>
    action$.pipe(
      ofType(conditionallyUnlockItem.type),
      withLatestFrom(state$),
      filter(
        ([{ payload }, state]) => state.content.itemsByPath[payload.path].lockOwner?.username === state.user.username
      ),
      map(([{ payload }]) => unlockItem(payload))
    ),
  // endregion
  // region duplicateAsset
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(duplicateAsset.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        merge(
          of(
            blockUI({
              progress: 'indeterminate',
              message: `${getIntl().formatMessage(inProgressMessages.duplicating)}...`
            })
          ),
          duplicate(state.sites.active, payload.path).pipe(
            switchMap(({ item: path }) => {
              const mode = getEditorMode(state.content.itemsByPath[payload.path].mimeType);
              const editableAsset = isEditableAsset(payload.path);
              return [
                unblockUI(),
                ...(editableAsset
                  ? [
                      showCodeEditorDialog({
                        authoringBase: state.env.authoringBase,
                        site: state.sites.active,
                        path,
                        mode,
                        onSuccess: payload.onSuccess
                      })
                    ]
                  : [])
              ];
            }),
            catchAjaxError(
              () => unblockUI(),
              (error) => showErrorDialog({ error: error.response })
            )
          )
        )
      )
    ),
  // endregion
  // region duplicateWithPolicyValidation
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(duplicateWithPolicyValidation.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        validateActionPolicy(state.sites.active, {
          type: 'COPY',
          target: payload.path,
          source: getParentPath(withoutIndex(payload.path))
        }).pipe(
          map(({ allowed, modifiedValue, target, message }) => {
            if (allowed && modifiedValue) {
              return showConfirmDialog({
                body: getIntl().formatMessage(sitePolicyMessages.itemPastePolicyConfirm, {
                  action: getIntl().formatMessage(sitePolicyMessages.duplicate),
                  path: target,
                  modifiedPath: modifiedValue,
                  detail: message
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
                body: getIntl().formatMessage(sitePolicyMessages.itemPastePolicyError, {
                  action: getIntl().formatMessage(sitePolicyMessages.duplicate),
                  detail: message
                })
              });
            }
          })
        )
      )
    ),
  // endregion
  // region pasteItem
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(pasteItem.type),
      withLatestFrom(state$),
      filter(([{ payload }, state]) => {
        if (isValidCopyPastePath(payload.path, state.content.clipboard.sourcePath)) {
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
      switchMap(([{ payload }, state]) =>
        merge(
          of(
            blockUI({
              progress: 'indeterminate',
              message: `${getIntl().formatMessage(inProgressMessages.pasting)}...`
            })
          ),
          paste(state.sites.active, payload.path, state.content.clipboard).pipe(
            map(() => batchActions([unblockUI(), clearClipboard(), showPasteItemSuccessNotification()])),
            catchAjaxError(
              () => unblockUI(),
              (error) => showErrorDialog({ error: error.response })
            )
          )
        )
      )
    ),
  // endregion
  // region pasteItemWithPolicyValidation
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(pasteItemWithPolicyValidation.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        let fileName = withoutIndex(state.content.clipboard.sourcePath).split('/').pop();
        if (
          state.content.clipboard.sourcePath.startsWith('/site/website') &&
          state.content.clipboard.sourcePath.endsWith('index.xml')
        ) {
          fileName = withIndex(fileName);
        }
        return merge(
          of(
            blockUI({
              progress: 'indeterminate',
              message: `${getIntl().formatMessage(sitePolicyMessages.itemPasteValidating)}...`
            })
          ),
          validateActionPolicy(state.sites.active, {
            type: state.content.clipboard.type === 'CUT' ? 'MOVE' : 'COPY',
            target: `${withoutIndex(payload.path)}/${fileName}`,
            source: state.content.clipboard.sourcePath
          }).pipe(
            switchMap(({ allowed, modifiedValue, target, message }) => {
              if (allowed && modifiedValue) {
                return [
                  unblockUI(),
                  showConfirmDialog({
                    body: getIntl().formatMessage(sitePolicyMessages.itemPastePolicyConfirm, {
                      action: state.content.clipboard.type === 'CUT' ? 'cut' : 'copy',
                      path: target,
                      modifiedPath: modifiedValue,
                      detail: message
                    }),
                    onCancel: closeConfirmDialog(),
                    onOk: batchActions([pasteItem({ path: payload.path }), closeConfirmDialog()])
                  })
                ];
              } else if (allowed) {
                return [
                  pasteItem({
                    path: payload.path
                  })
                ];
              } else {
                return [
                  unblockUI(),
                  showConfirmDialog({
                    body: getIntl().formatMessage(sitePolicyMessages.itemPastePolicyError, {
                      action: state.content.clipboard.type === 'CUT' ? 'cut' : 'copy',
                      detail: message
                    })
                  })
                ];
              }
            })
          )
        );
      })
    ),
  // endregion
  // region deleteController, deleteTemplate
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(deleteController.type, deleteTemplate.type),
      withLatestFrom(state$),
      switchMap(([{ type, payload }, state]) => {
        const { item, onSuccess } = payload;
        const path =
          type === 'DELETE_CONTROLLER' ? getItemGroovyPath(item) : getItemTemplatePath(item, state.contentTypes.byId);

        // path may be empty string if the displayTemplate has not been set for a content type.
        if (isBlank(path)) {
          return of(
            showConfirmDialog({
              body: getIntl().formatMessage(
                itemFailureMessages[type === 'DELETE_CONTROLLER' ? 'controllerNotFound' : 'templateNotFound']
              )
            })
          );
        } else {
          return merge(
            of(blockUI({ message: `${getIntl().formatMessage(inProgressMessages.processing)}...` })),
            fetchItemByPath(state.sites.active, path).pipe(
              switchMap((itemToDelete) => [
                showDeleteDialog({
                  items: asArray(itemToDelete),
                  onSuccess: batchActions(
                    [
                      showDeleteItemSuccessNotification(),
                      type === 'DELETE_TEMPLATE' && dissociateTemplate({ contentTypeId: item.contentTypeId }),
                      closeDeleteDialog(),
                      onSuccess
                    ].filter(Boolean)
                  )
                }),
                unblockUI()
              ]),
              catchAjaxError((error: AjaxError) =>
                batchActions([
                  unblockUI(),
                  error.status === 404
                    ? showConfirmDialog({
                        body: getIntl().formatMessage(
                          itemFailureMessages[type === 'DELETE_CONTROLLER' ? 'controllerNotFound' : 'templateNotFound']
                        )
                      })
                    : showErrorDialog({ error: error.response ?? error })
                ])
              )
            )
          );
        }
      })
    ),
  // endregion
  // region lockContentEvent
  (action$, state$) =>
    action$.pipe(
      ofType(lockContentEvent.type),
      withLatestFrom(state$),
      filter(([{ payload }, state]) => Boolean(state.content.itemsByPath[payload.targetPath])),
      switchMap(([{ payload }, state]) =>
        fetchSandboxItemService(state.sites.active, payload.targetPath).pipe(
          map((item) => fetchSandboxItemComplete({ item })),
          catchAjaxError(fetchSandboxItemFailed)
        )
      )
    ),
  // endregion
  // region contentEvent
  (action$: Observable<StandardAction<SocketEvent>>, state$) =>
    action$.pipe(
      ofType(contentEvent.type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        const { targetPath } = action.payload;
        const parentPath = getParentPath(targetPath);
        const parentWithIndex = withIndex(parentPath);
        return [
          // If the item is in state, assume it got updated
          state.content.itemsByPath[targetPath] && fetchSandboxItem({ path: targetPath }),
          // If the parent of the item is in state, a new item may have been added, re-fetch to update its child count
          state.content.itemsByPath[parentPath] && fetchSandboxItem({ path: parentPath }),
          state.content.itemsByPath[parentWithIndex] && fetchSandboxItem({ path: parentWithIndex })
        ].filter(Boolean);
      })
    ),
  // endregion
  // region moveContentEvent
  (action$: Observable<StandardAction<MoveContentEventPayload>>, state$) =>
    action$.pipe(
      ofType(moveContentEvent.type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        const actions = [];
        const itemsByPath = state.content.itemsByPath;
        const { targetPath, sourcePath } = action.payload;
        const parentOfTarget = getParentPath(targetPath);
        const parentOfSource = getParentPath(sourcePath);
        // By this point, the reducer would have deleted the `sourcePath` from the state.
        // Re-fetch any items that are already on the state that were changed themselves or
        // where a child may have been added/removed.
        [targetPath, parentOfTarget, parentOfSource, withIndex(parentOfTarget), withIndex(parentOfSource)].forEach(
          (path) => {
            if (itemsByPath[path]) {
              actions.push(fetchSandboxItem({ path }));
            }
          }
        );
        return actions;
      })
    )
  // endregion
];

export default content;
