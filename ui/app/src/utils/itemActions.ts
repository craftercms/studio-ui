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

import { translations } from '../components/ItemActionsMenu/translations';
import { AllItemActions, DetailedItem } from '../models/Item';
import { ContextMenuOption } from '../components/ContextMenu';
import { getControllerPath, getRootPath, withoutIndex } from './path';
import {
  closeChangeContentTypeDialog,
  closeCodeEditorDialog,
  closeConfirmDialog,
  closeCopyDialog,
  closeCreateFileDialog,
  closeCreateFolderDialog,
  closeDeleteDialog,
  closePublishDialog,
  closeRejectDialog,
  closeUploadDialog,
  showChangeContentTypeDialog,
  showCodeEditorDialog,
  showConfirmDialog,
  showCopyDialog,
  showCreateFileDialog,
  showCreateFolderDialog,
  showDeleteDialog,
  showDependenciesDialog,
  showEditDialog,
  showHistoryDialog,
  showNewContentDialog,
  showPreviewDialog,
  showPublishDialog,
  showRejectDialog,
  showUploadDialog,
  showWorkflowCancellationDialog
} from '../state/actions/dialogs';
import { fetchSandboxItem, fetchWorkflowAffectedItems } from '../services/content';
import {
  batchActions,
  changeContentType,
  editContentTypeTemplate,
  editController,
  editTemplate
} from '../state/actions/misc';
import {
  blockUI,
  emitSystemEvent,
  itemCut,
  showCopyItemSuccessNotification,
  showCreateFolderSuccessNotification,
  showCreateItemSuccessNotification,
  showCutItemSuccessNotification,
  showDeleteItemSuccessNotification,
  showEditItemSuccessNotification,
  showPublishItemSuccessNotification,
  showRejectItemSuccessNotification,
  unblockUI
} from '../state/actions/system';
import {
  conditionallyUnlockItem,
  deleteController,
  deleteTemplate,
  duplicateWithPolicyValidation,
  pasteItem,
  pasteItemWithPolicyValidation,
  reloadDetailedItem,
  setClipboard,
  unlockItem
} from '../state/actions/content';
import { showErrorDialog } from '../state/reducers/dialogs/error';
import { fetchItemVersions } from '../state/reducers/versions';
import { popPiece } from './string';
import { IntlFormatters, MessageDescriptor } from 'react-intl';
import {
  hasApprovePublishAction,
  hasChangeTypeAction,
  hasContentDeleteAction,
  hasCopyAction,
  hasCreateAction,
  hasCreateFolderAction,
  hasCutAction,
  hasDeleteControllerAction,
  hasDeleteTemplateAction,
  hasDuplicateAction,
  hasEditAction,
  hasEditControllerAction,
  hasEditTemplateAction,
  hasGetDependenciesAction,
  hasPasteAction,
  hasPublishAction,
  hasPublishRejectAction,
  hasPublishRequestAction,
  hasReadAction,
  hasReadHistoryAction,
  hasRenameAction,
  hasSchedulePublishAction,
  hasUnlockAction,
  hasUploadAction,
  parseSandBoxItemToDetailedItem
} from './content';
import { getEditorMode, isNavigable } from '../components/PathNavigator/utils';
import React from 'react';
import { previewItem } from '../state/actions/preview';
import { asArray, createPresenceTable } from './array';
import { fetchPublishingStatus } from '../state/actions/publishingStatus';
import { Clipboard } from '../models/GlobalState';

export type ContextMenuOptionDescriptor<ID extends string = string> = {
  id: ID;
  label: MessageDescriptor;
  values?: any;
};

const unparsedMenuOptions: Record<AllItemActions, ContextMenuOptionDescriptor<AllItemActions>> = {
  // region ItemActions
  edit: {
    id: 'edit',
    label: translations.edit
  },
  unlock: {
    id: 'unlock',
    label: translations.unlock
  },
  view: {
    id: 'view',
    label: translations.viewForm
  },
  createContent: {
    id: 'createContent',
    label: translations.createContent
  },
  createFolder: {
    id: 'createFolder',
    label: translations.createFolder
  },
  rename: {
    id: 'rename',
    label: translations.rename
  },
  delete: {
    id: 'delete',
    label: translations.delete
  },
  deleteController: {
    id: 'deleteController',
    label: translations.deleteController
  },
  deleteTemplate: {
    id: 'deleteTemplate',
    label: translations.deleteTemplate
  },
  changeContentType: {
    id: 'changeContentType',
    label: translations.changeContentType
  },
  cut: {
    id: 'cut',
    label: translations.cut
  },
  copy: {
    id: 'copy',
    label: translations.copy
  },
  paste: {
    id: 'paste',
    label: translations.paste
  },
  upload: {
    id: 'upload',
    label: translations.upload
  },
  duplicate: {
    id: 'duplicate',
    label: translations.duplicate
  },
  schedulePublish: {
    id: 'schedulePublish',
    label: translations.schedule
  },
  publish: {
    id: 'publish',
    label: translations.publish
  },
  requestPublish: {
    id: 'requestPublish',
    label: translations.publish
  },
  approvePublish: {
    id: 'approvePublish',
    label: translations.publish
  },
  rejectPublish: {
    id: 'rejectPublish',
    label: translations.reject
  },
  history: {
    id: 'history',
    label: translations.history
  },
  dependencies: {
    id: 'dependencies',
    label: translations.dependencies
  },
  editController: {
    id: 'editController',
    label: translations.editController
  },
  editTemplate: {
    id: 'editTemplate',
    label: translations.editTemplate
  },
  revert: {
    id: 'revert',
    label: translations.revert
  },
  // endregion
  // region AssessRemovalItemActions
  viewImage: {
    id: 'viewImage',
    label: translations.view
  },
  duplicateAsset: {
    id: 'duplicateAsset',
    label: translations.duplicate
  },
  createController: {
    id: 'createController',
    label: translations.createController
  },
  createTemplate: {
    id: 'createTemplate',
    label: translations.createTemplate
  },
  // endregion
  // region VirtualItemActions
  editCode: {
    id: 'editCode',
    label: translations.edit
  },
  viewCode: {
    id: 'viewCode',
    label: translations.view
  },
  preview: {
    id: 'preview',
    label: translations.preview
  }
  // endregion
};

// `unparsedMenuOptions` is just used as a convenient way of dynamically getting all the actions,
// not using it for any other reason other than getting the full list of item actions.
export const allItemActions = Object.keys(unparsedMenuOptions);

export function toContextMenuOptionsLookup<Keys extends string = AllItemActions>(
  menuOptionDescriptors: Record<Keys, ContextMenuOptionDescriptor>,
  formatMessage: IntlFormatters['formatMessage']
): Record<Keys, ContextMenuOption> {
  const menuOptions: any = {};
  // @ts-ignore - not sure why the type system is not picking up that the "values" are ContextMenuOptionDescriptor
  Object.entries(menuOptionDescriptors).forEach(([key, { id, label }]) => {
    menuOptions[key] = { id, label: formatMessage(label) };
  });
  return menuOptions;
}

export function generateSingleItemOptions(
  item: DetailedItem,
  formatMessage: IntlFormatters['formatMessage'],
  options?: Partial<{
    hasClipboard: boolean;
    includeOnly: AllItemActions[];
  }>
): ContextMenuOption[][] {
  const actionsToInclude = createPresenceTable(options?.includeOnly ?? allItemActions) as Record<
    AllItemActions,
    boolean
  >;

  let sections: ContextMenuOption[][] = [];
  let sectionA: ContextMenuOption[] = [];
  let sectionB: ContextMenuOption[] = [];
  let sectionC: ContextMenuOption[] = [];
  let sectionD: ContextMenuOption[] = [];

  if (!item) {
    return sections;
  }

  const type = item.systemType;
  const isImage = item.mimeType?.startsWith('image/');
  const isTemplate = item.path.startsWith('/templates');
  const isController = item.path.startsWith('/scripts');
  const isStaticAssets = item.path.startsWith('/static-assets');
  const menuOptions: Record<AllItemActions, ContextMenuOption> = toContextMenuOptionsLookup(
    unparsedMenuOptions,
    formatMessage
  );

  // region Section A
  if (hasEditAction(item.availableActions) && actionsToInclude.edit) {
    if (['page', 'component', 'taxonomy', 'levelDescriptor'].includes(type)) {
      sectionA.push(menuOptions.edit);
    } else {
      sectionA.push(menuOptions.editCode);
    }
  }
  if (hasUnlockAction(item.availableActions) && actionsToInclude.unlock) {
    sectionA.push(menuOptions.unlock);
  }
  if (
    !isStaticAssets &&
    !isController &&
    !isTemplate &&
    hasCreateAction(item.availableActions) &&
    actionsToInclude.createContent
  ) {
    sectionA.push(menuOptions.createContent);
  }
  if (hasUploadAction(item.availableActions) && actionsToInclude.upload) {
    sectionB.push(menuOptions.upload);
  }
  if (hasCreateFolderAction(item.availableActions) && actionsToInclude.createFolder) {
    sectionA.push(menuOptions.createFolder);
  }
  if (hasContentDeleteAction(item.availableActions) && actionsToInclude.delete) {
    sectionA.push(menuOptions.delete);
  }
  if (hasGetDependenciesAction(item.availableActions) && actionsToInclude.dependencies) {
    sectionA.push(menuOptions.dependencies);
  }
  if (hasRenameAction(item.availableActions) && actionsToInclude.rename) {
    sectionA.push(menuOptions.rename);
  }
  if (hasReadHistoryAction(item.availableActions) && actionsToInclude.history) {
    sectionA.push(menuOptions.history);
  }
  if (hasChangeTypeAction(item.availableActions) && actionsToInclude.changeContentType) {
    sectionA.push(menuOptions.changeContentType);
  }
  if (isNavigable(item) && actionsToInclude.preview) {
    sectionA.push(menuOptions.preview);
  }
  if (hasReadAction(item.availableActions) && actionsToInclude.view) {
    if (['page', 'component', 'taxonomy', 'levelDescriptor'].includes(type)) {
      sectionA.push(menuOptions.view);
    } else if (isImage) {
      sectionA.push(menuOptions.viewImage);
    } else {
      sectionA.push(menuOptions.viewCode);
    }
  }
  // endregion

  // region Section B
  if (hasCutAction(item.availableActions) && actionsToInclude.cut) {
    sectionB.push(menuOptions.cut);
  }
  if (hasCopyAction(item.availableActions) && actionsToInclude.copy) {
    sectionB.push(menuOptions.copy);
  }
  if (hasPasteAction(item.availableActions) && options?.hasClipboard && actionsToInclude.paste) {
    sectionB.push(menuOptions.paste);
  }
  if (hasDuplicateAction(item.availableActions) && actionsToInclude.duplicate) {
    if (['page', 'component', 'taxonomy', 'levelDescriptor'].includes(type)) {
      sectionB.push(menuOptions.duplicate);
    } else {
      sectionB.push(menuOptions.duplicateAsset);
    }
  }
  // endregion

  // region Section C
  if (
    (hasPublishAction(item.availableActions) && actionsToInclude.publish) ||
    (hasPublishRequestAction(item.availableActions) && actionsToInclude.requestPublish) ||
    (hasApprovePublishAction(item.availableActions) && actionsToInclude.approvePublish) ||
    (hasSchedulePublishAction(item.availableActions) && actionsToInclude.schedulePublish)
  ) {
    if (hasApprovePublishAction(item.availableActions) && actionsToInclude.approvePublish) {
      sectionC.push(menuOptions.approvePublish);
    } else {
      sectionC.push(menuOptions.publish);
    }
  }
  if (hasPublishRejectAction(item.availableActions) && actionsToInclude.rejectPublish) {
    sectionC.push(menuOptions.rejectPublish);
  }
  // endregion

  // region Section D
  if (hasEditControllerAction(item.availableActions) && actionsToInclude.editController) {
    sectionD.push(menuOptions.editController);
  }
  if (hasDeleteControllerAction(item.availableActions) && actionsToInclude.deleteController) {
    sectionD.push(menuOptions.deleteController);
  }
  if (hasEditTemplateAction(item.availableActions) && actionsToInclude.editTemplate) {
    sectionD.push(menuOptions.editTemplate);
  }
  if (hasDeleteTemplateAction(item.availableActions) && actionsToInclude.deleteTemplate) {
    sectionD.push(menuOptions.deleteTemplate);
  }
  if (isTemplate && hasCreateAction(item.availableActions) && actionsToInclude.createTemplate) {
    sectionD.push(menuOptions.createTemplate);
  }
  if (isController && hasCreateAction(item.availableActions) && actionsToInclude.createController) {
    sectionD.push(menuOptions.createController);
  }
  // endregion

  if (sectionA.length) {
    sections.push(sectionA);
  }
  if (sectionB.length) {
    sections.push(sectionB);
  }
  if (sectionC.length) {
    sections.push(sectionC);
  }
  if (sectionD.length) {
    sections.push(sectionD);
  }

  return sections;
}

export function generateMultipleItemOptions(
  items: DetailedItem[],
  formatMessage: IntlFormatters['formatMessage'],
  options?: {
    includeOnly: AllItemActions[];
  }
): ContextMenuOption[] {
  let publish = true;
  let requestPublish = true;
  let approvePublish = true;
  let schedulePublish = true;
  let deleteItem = true;
  let reject = true;
  let sections = [];
  const menuOptions = toContextMenuOptionsLookup(unparsedMenuOptions, formatMessage);

  const actionsToInclude = createPresenceTable(options?.includeOnly ?? allItemActions) as Record<
    AllItemActions,
    boolean
  >;

  items.forEach((item) => {
    publish = publish && hasPublishAction(item.availableActions);
    requestPublish = requestPublish && hasPublishRequestAction(item.availableActions);
    approvePublish = approvePublish && hasApprovePublishAction(item.availableActions);
    schedulePublish = schedulePublish && hasSchedulePublishAction(item.availableActions);
    deleteItem = deleteItem && hasContentDeleteAction(item.availableActions);
    reject = reject && hasPublishRejectAction(item.availableActions);
  });

  if (
    (publish && actionsToInclude.publish) ||
    (schedulePublish && actionsToInclude.schedulePublish) ||
    (requestPublish && actionsToInclude.rejectPublish) ||
    (approvePublish && actionsToInclude.approvePublish)
  ) {
    sections.push(menuOptions.publish);
  }
  if (deleteItem && actionsToInclude.delete) {
    sections.push(menuOptions.delete);
  }
  if (reject && actionsToInclude.rejectPublish) {
    sections.push(menuOptions.rejectPublish);
  }

  return sections;
}

export const itemActionDispatcher = ({
  site,
  item,
  option,
  authoringBase,
  dispatch,
  formatMessage,
  clipboard,
  onActionSuccess,
  event
}: {
  site: string;
  item: DetailedItem | DetailedItem[];
  option: AllItemActions;
  authoringBase: string;
  dispatch;
  formatMessage;
  clipboard?: Clipboard;
  onActionSuccess?: any;
  event?: React.MouseEvent<Element, MouseEvent>;
}) => {
  // actions that support only one item
  if (!Array.isArray(item)) {
    switch (option) {
      case 'view': {
        const path = item.path;
        dispatch(showEditDialog({ site, path, authoringBase, readonly: true }));
        break;
      }
      case 'edit': {
        // TODO: Editing embedded components is not currently supported as to edit them,
        //  we need the modelId that's not supplied to this function.
        // const src = `${defaultSrc}site=${site}&path=${embeddedParentPath}&isHidden=true&modelId=${modelId}&type=form`
        const path = item.path;
        fetchWorkflowAffectedItems(site, path).subscribe((items) => {
          if (items?.length > 0) {
            dispatch(
              showWorkflowCancellationDialog({
                items,
                onContinue: showEditDialog({
                  site,
                  path,
                  authoringBase,
                  onSaveSuccess: batchActions([
                    showEditItemSuccessNotification(),
                    reloadDetailedItem({ path }),
                    ...(onActionSuccess ? [onActionSuccess] : [])
                  ])
                })
              })
            );
          } else {
            dispatch(
              showEditDialog({
                site,
                path,
                authoringBase,
                onSaveSuccess: batchActions([
                  showEditItemSuccessNotification(),
                  reloadDetailedItem({ path }),
                  ...(onActionSuccess ? [onActionSuccess] : [])
                ])
              })
            );
          }
        });
        break;
      }
      case 'createFolder': {
        dispatch(
          showCreateFolderDialog({
            path: item.path,
            allowBraces: item.path.startsWith('/scripts/rest'),
            onCreated: batchActions([closeCreateFolderDialog(), showCreateFolderSuccessNotification()])
          })
        );
        break;
      }
      case 'rename': {
        // TODO: handle rename of different item types
        dispatch(
          showCreateFolderDialog({
            path: item.path,
            allowBraces: item.path.startsWith('/scripts/rest'),
            rename: true,
            value: item.label
          })
        );
        break;
      }
      case 'createContent': {
        dispatch(
          showNewContentDialog({
            item,
            rootPath: getRootPath(item.path),
            // @ts-ignore - required attributes of `showEditDialog` are submitted by new content dialog `onContentTypeSelected` callback and injected into the showEditDialog action by the GlobalDialogManger
            onContentTypeSelected: showEditDialog({})
          })
        );
        break;
      }
      case 'changeContentType': {
        dispatch(
          showConfirmDialog({
            title: formatMessage(translations.changeContentType),
            body: formatMessage(translations.changeContentTypeBody),
            onCancel: closeConfirmDialog(),
            onOk: batchActions([
              closeConfirmDialog(),
              showChangeContentTypeDialog({
                item,
                rootPath: getRootPath(item.path),
                selectedContentType: item.contentTypeId,
                onContentTypeSelected: batchActions([
                  closeChangeContentTypeDialog(),
                  changeContentType({ originalContentTypeId: item.contentTypeId, path: item.path })
                ])
              })
            ])
          })
        );
        break;
      }
      case 'cut': {
        dispatch(
          batchActions([
            setClipboard({
              type: 'CUT',
              paths: [item.path],
              sourcePath: item.path
            }),
            emitSystemEvent(itemCut({ target: item.path })),
            showCutItemSuccessNotification()
          ])
        );
        break;
      }
      case 'copy': {
        dispatch(
          blockUI({
            progress: 'indeterminate',
            message: `${formatMessage(translations.processing)}...`
          })
        );
        fetchSandboxItem(site, item.path).subscribe({
          next(item) {
            dispatch(unblockUI());
            if (item.childrenCount) {
              dispatch(
                showCopyDialog({
                  site,
                  item: parseSandBoxItemToDetailedItem(item),
                  onOk: batchActions([
                    closeCopyDialog(),
                    setClipboard({
                      type: 'COPY',
                      sourcePath: item.path
                    }),
                    showCopyItemSuccessNotification()
                  ])
                })
              );
            } else {
              dispatch(
                batchActions([
                  setClipboard({
                    type: 'COPY',
                    paths: [item.path],
                    sourcePath: item.path
                  }),
                  showCopyItemSuccessNotification()
                ])
              );
            }
          },
          error(response) {
            dispatch(
              showErrorDialog({
                error: response
              })
            );
          }
        });
        break;
      }
      case 'paste': {
        if (clipboard.type === 'CUT') {
          dispatch(
            blockUI({
              progress: 'indeterminate',
              title: `${formatMessage(translations.processing)}...`
            })
          );
          fetchWorkflowAffectedItems(site, clipboard.sourcePath).subscribe((items) => {
            dispatch(unblockUI());
            if (items?.length > 0) {
              dispatch(
                showWorkflowCancellationDialog({
                  items,
                  onContinue: pasteItem({ path: item.path })
                })
              );
            } else {
              dispatch(pasteItem({ path: item.path }));
            }
          });
        } else {
          dispatch(pasteItemWithPolicyValidation({ path: item.path }));
        }
        break;
      }
      case 'duplicateAsset': {
        dispatch(
          showConfirmDialog({
            title: formatMessage(translations.duplicate),
            body: formatMessage(translations.duplicateDialogBody),
            onCancel: closeConfirmDialog(),
            onOk: batchActions([
              closeConfirmDialog(),
              duplicateWithPolicyValidation({
                path: item.path,
                type: 'asset'
              })
            ])
          })
        );
        break;
      }
      case 'duplicate': {
        dispatch(
          showConfirmDialog({
            title: formatMessage(translations.duplicate),
            body: formatMessage(translations.duplicateDialogBody),
            onCancel: closeConfirmDialog(),
            onOk: batchActions([
              closeConfirmDialog(),
              duplicateWithPolicyValidation({
                path: item.path,
                type: 'item'
              })
            ])
          })
        );
        break;
      }
      case 'history': {
        dispatch(
          batchActions([
            fetchItemVersions({
              item,
              rootPath: getRootPath(item.path)
            }),
            showHistoryDialog({})
          ])
        );
        break;
      }
      case 'dependencies': {
        dispatch(showDependenciesDialog({ item, rootPath: getRootPath(item.path) }));
        break;
      }
      case 'editTemplate': {
        dispatch(editContentTypeTemplate({ contentTypeId: item.contentTypeId }));
        break;
      }
      case 'editController': {
        dispatch(
          editController({
            path: getControllerPath(item.systemType),
            fileName: `${popPiece(item.contentTypeId, '/')}.groovy`,
            mode: 'groovy',
            contentType: item.contentTypeId
          })
        );
        break;
      }
      case 'createTemplate':
      case 'createController': {
        dispatch(
          showCreateFileDialog({
            path: withoutIndex(item.path),
            type: option === 'createController' ? 'controller' : 'template',
            allowBraces: option === 'createController' ? item.path.startsWith('/scripts/rest') : false,
            onCreated: batchActions([
              closeCreateFileDialog(),
              showCreateItemSuccessNotification(),
              option === 'createController' ? editController() : editTemplate()
            ])
          })
        );
        break;
      }
      case 'editCode': {
        const path = item.path;
        dispatch(
          blockUI({
            progress: 'indeterminate',
            title: formatMessage(translations.verifyingAffectedWorkflows)
          })
        );
        fetchWorkflowAffectedItems(site, path).subscribe((items) => {
          if (items?.length > 0) {
            dispatch(
              batchActions([
                unblockUI(),
                showWorkflowCancellationDialog({
                  items,
                  onContinue: showCodeEditorDialog({
                    path: item.path,
                    mode: getEditorMode(item),
                    onClose: batchActions([closeCodeEditorDialog(), conditionallyUnlockItem({ path: item.path })])
                  })
                })
              ])
            );
          } else {
            dispatch(
              batchActions([
                unblockUI(),
                showCodeEditorDialog({
                  path: item.path,
                  mode: getEditorMode(item),
                  onClose: batchActions([closeCodeEditorDialog(), conditionallyUnlockItem({ path: item.path })])
                })
              ])
            );
          }
        });
        break;
      }
      case 'viewCode': {
        dispatch(
          showCodeEditorDialog({
            path: item.path,
            mode: getEditorMode(item),
            readonly: true
          })
        );
        break;
      }
      case 'viewImage': {
        dispatch(
          showPreviewDialog({
            type: 'image',
            title: item.label,
            url: item.path
          })
        );
        break;
      }
      case 'upload': {
        dispatch(
          showUploadDialog({
            path: item.path,
            site,
            onClose: closeUploadDialog()
          })
        );
        break;
      }
      case 'unlock': {
        dispatch(
          unlockItem({
            path: item.path
          })
        );
        break;
      }
      case 'preview': {
        dispatch(previewItem({ item: item, newTab: event.ctrlKey || event.metaKey }));
        break;
      }
      default:
        break;
    }
  }
  // actions that support multiple items
  switch (option) {
    case 'delete': {
      let items = asArray(item);
      dispatch(
        showDeleteDialog({
          items,
          onSuccess: batchActions([
            showDeleteItemSuccessNotification(),
            closeDeleteDialog(),
            ...(onActionSuccess ? [onActionSuccess] : [])
          ])
        })
      );
      break;
    }
    case 'deleteController': {
      dispatch(deleteController({ item: item as DetailedItem, onSuccess: onActionSuccess }));
      break;
    }
    case 'deleteTemplate': {
      dispatch(deleteTemplate({ item: item as DetailedItem, onSuccess: onActionSuccess }));
      break;
    }
    case 'approvePublish':
    case 'publish':
    case 'schedulePublish':
    case 'requestPublish': {
      const items = Array.isArray(item) ? item : [item];
      const schedulingMap = {
        approvePublish: null,
        schedulePublish: 'custom',
        requestPublish: 'now',
        publish: 'now'
      };
      dispatch(
        showPublishDialog({
          items,
          scheduling: schedulingMap[option],
          onSuccess: batchActions([
            showPublishItemSuccessNotification(),
            ...items.map((item) => reloadDetailedItem({ path: item.path })),
            closePublishDialog(),
            fetchPublishingStatus(),
            ...(onActionSuccess ? [onActionSuccess] : [])
          ])
        })
      );
      break;
    }
    case 'rejectPublish': {
      let items = Array.isArray(item) ? item : [item];
      dispatch(
        showRejectDialog({
          items,
          onRejectSuccess: batchActions([
            showRejectItemSuccessNotification({
              count: items.length
            }),
            closeRejectDialog(),
            ...(onActionSuccess ? [onActionSuccess] : [])
          ])
        })
      );
      break;
    }
  }
};
