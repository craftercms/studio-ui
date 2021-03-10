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
import { DetailedItem, LegacyItem } from '../models/Item';
import LookupTable from '../models/LookupTable';
import { ContextMenuOption } from '../components/ContextMenu';
import { getRootPath, withoutIndex } from './path';
import {
  CloseChangeContentTypeDialog,
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
import { fetchLegacyItemsTree, fetchWorkflowAffectedItems } from '../services/content';
import {
  batchActions,
  changeContentType,
  editContentTypeTemplate,
  editController,
  editTemplate
} from '../state/actions/misc';
import {
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
  showSystemNotification
} from '../state/actions/system';
import {
  duplicateWithPolicyValidation,
  pasteItem,
  pasteItemWithPolicyValidation,
  reloadDetailedItem,
  setClipBoard,
  unlockItem
} from '../state/actions/content';
import { showErrorDialog } from '../state/reducers/dialogs/error';
import { fetchItemVersions } from '../state/reducers/versions';
import { popPiece } from './string';
import { IntlFormatters, MessageDescriptor } from 'react-intl';
import {
  hasApprovePublishAction,
  hasCopyAction,
  hasCreateAction,
  hasCreateFolderAction,
  hasCutAction,
  hasDeleteAction,
  hasDependenciesAction,
  hasDuplicateAction,
  hasEditAction,
  hasEditControllerAction,
  hasEditTemplateAction,
  hasHistoryAction,
  hasPasteAction,
  hasReadAction,
  hasRenameAction,
  hasRequestPublishAction,
  hasSchedulePublishAction,
  hasUploadAction
} from './content';

export type ContextMenuOptionDescriptor = { id: string; label: MessageDescriptor; values?: any };

const unparsedMenuOptions: LookupTable<ContextMenuOptionDescriptor> = {
  edit: {
    id: 'edit',
    label: translations.edit
  },
  codeEditor: {
    id: 'codeEditor',
    label: translations.edit
  },
  view: {
    id: 'view',
    label: translations.viewForm
  },
  viewCodeEditor: {
    id: 'viewCodeEditor',
    label: translations.view
  },
  viewImage: {
    id: 'viewImage',
    label: translations.view
  },
  createContent: {
    id: 'createContent',
    label: translations.createContent
  },
  createFolder: {
    id: 'createFolder',
    label: translations.createFolder
  },
  renameFolder: {
    id: 'renameFolder',
    label: translations.renameFolder
  },
  delete: {
    id: 'delete',
    label: translations.delete
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
  duplicateAsset: {
    id: 'duplicateAsset',
    label: translations.duplicate
  },
  schedule: {
    id: 'schedule',
    label: translations.schedule
  },
  publish: {
    id: 'publish',
    label: translations.publish
  },
  approve: {
    id: 'approve',
    label: translations.approve
  },
  reject: {
    id: 'reject',
    label: translations.reject
  },
  cancel: {
    id: 'cancel',
    label: translations.cancel
  },
  bulkPublish: {
    id: 'bulkPublish',
    label: translations.bulkPublish
  },
  history: {
    id: 'history',
    label: translations.history
  },
  dependencies: {
    id: 'dependencies',
    label: translations.dependencies
  },
  translation: {
    id: 'translation',
    label: translations.translation
  },
  editController: {
    id: 'editController',
    label: translations.editController
  },
  editTemplate: {
    id: 'editTemplate',
    label: translations.editTemplate
  },
  createController: {
    id: 'createController',
    label: translations.createController
  },
  createTemplate: {
    id: 'createTemplate',
    label: translations.createTemplate
  },
  unlock: {
    id: 'unlock',
    label: translations.unlock
  },
  preview: {
    id: 'preview',
    label: translations.preview
  }
};

export function toContextMenuOptionsLookup(
  menuOptionDescriptors: LookupTable<ContextMenuOptionDescriptor>,
  formatMessage: IntlFormatters['formatMessage']
): { [prop: string]: ContextMenuOption } {
  const menuOptions: { [prop: string]: ContextMenuOption } = {};
  Object.entries(menuOptionDescriptors).forEach(([key, value]) => {
    menuOptions[key] = {
      id: value.id,
      label: formatMessage(value.label)
    };
  });
  return menuOptions;
}

export function generateSingleItemOptions(
  item: DetailedItem,
  formatMessage: IntlFormatters['formatMessage'],
  options?: {
    hasClipboard: boolean;
  }
): ContextMenuOption[][] {
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
  const isAsset = ['/templates', '/static-assets', '/scripts'].some((str) => item.path.includes(str));
  const isFolder = item.systemType === 'folder';
  const isTemplate = item.path.includes('/templates');
  const isController = item.path.includes('/scripts');
  const menuOptions: { [prop in keyof typeof unparsedMenuOptions]: ContextMenuOption } = toContextMenuOptionsLookup(
    unparsedMenuOptions,
    formatMessage
  );

  // region Section A
  if (hasEditAction(item.availableActions)) {
    if (['page', 'component', 'taxonomy', 'levelDescriptor'].includes(type)) {
      sectionA.push(menuOptions.edit);
    } else {
      sectionA.push(menuOptions.codeEditor);
    }
  }
  if (hasReadAction(item.availableActions)) {
    if (['page', 'component', 'taxonomy', 'levelDescriptor'].includes(type)) {
      sectionA.push(menuOptions.view);
    } else if (isImage) {
      sectionA.push(menuOptions.viewImage);
    } else {
      sectionA.push(menuOptions.viewCodeEditor);
    }
  }
  if (hasCreateAction(item.availableActions)) {
    sectionA.push(menuOptions.createContent);
  }
  if (hasCreateFolderAction(item.availableActions)) {
    sectionA.push(menuOptions.createFolder);
  }
  if (hasDeleteAction(item.availableActions)) {
    sectionA.push(menuOptions.delete);
  }
  if (hasDependenciesAction(item.availableActions)) {
    sectionA.push(menuOptions.dependencies);
  }
  if (hasRenameAction(item.availableActions)) {
    // isFolder??
    sectionA.push(menuOptions.renameFolder);
  }
  if (hasHistoryAction(item.availableActions)) {
    sectionA.push(menuOptions.history);
  }
  if (hasReadAction(item.availableActions)) {
    // TODO: Not Implemented
    sectionA.push(menuOptions.preview);
  }
  // endregion

  // region Section B
  if (hasCutAction(item.availableActions)) {
    sectionB.push(menuOptions.cut);
  }
  if (hasCopyAction(item.availableActions)) {
    sectionB.push(menuOptions.copy);
  }
  if (hasPasteAction(item.availableActions) && options?.hasClipboard) {
    sectionB.push(menuOptions.paste);
  }
  if (hasDuplicateAction(item.availableActions)) {
    if (['page', 'component', 'taxonomy', 'levelDescriptor'].includes(type)) {
      sectionA.push(menuOptions.duplicate);
    } else {
      sectionA.push(menuOptions.duplicateAsset);
    }
  }
  if (hasUploadAction(item.availableActions)) {
    // isFolder && isAsset??
    sectionA.push(menuOptions.upload);
  }
  // endregion

  // region Section C
  if (hasRequestPublishAction(item.availableActions)) {
    sectionC.push(menuOptions.publish);
  }
  if (hasApprovePublishAction(item.availableActions)) {
    sectionC.push(menuOptions.approve);
  }
  if (hasSchedulePublishAction(item.availableActions)) {
    sectionC.push(menuOptions.schedule);
  }
  // endregion

  // region Section D
  if (hasEditControllerAction(item.availableActions)) {
    sectionD.push(menuOptions.editController);
  }
  if (hasEditTemplateAction(item.availableActions)) {
    sectionD.push(menuOptions.editTemplate);
  }
  if (hasCreateAction(item.availableActions) && isTemplate) {
    sectionD.push(menuOptions.createTemplate);
  }
  if (hasCreateAction(item.availableActions) && isController) {
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
  itemsDetails: { permissions: LookupTable<boolean>; item: DetailedItem }[],
  formatMessage: IntlFormatters['formatMessage']
): ContextMenuOption[] {
  let publish = true;
  let deleteItem = true;
  let reject = true;
  let options = [];

  itemsDetails.forEach((details) => {
    const permissions = details.permissions;
    publish = publish ? permissions.publish : publish;
    deleteItem = deleteItem ? permissions.delete : deleteItem;
    reject = reject ? permissions.cancel_publish : reject;
  });

  const menuOptions = toContextMenuOptionsLookup(unparsedMenuOptions, formatMessage);

  if (publish) {
    const itemsPublish = itemsDetails.filter(({ item }) => !item.stateMap.userLocked && !item.stateMap.live);
    if (itemsPublish.length === itemsDetails.length) {
      options.push(menuOptions.publish);
      options.push(menuOptions.schedule);
    }
  }
  if (deleteItem) {
    const itemsDelete = itemsDetails.filter(({ item }) => withoutIndex(item.path) !== '/site/website');
    if (itemsDelete.length === itemsDetails.length) {
      options.push(menuOptions.delete);
    }
  }
  if (reject) {
    const itemsReject = itemsDetails.filter(
      ({ item }) => item.stateMap.staged || item.stateMap.scheduled || item.stateMap.deleted || item.stateMap.submitted
    );
    if (itemsReject.length === itemsDetails.length) {
      options.push(menuOptions.reject);
    }
  }

  return options;
}

export const itemActionDispatcher = ({
  site,
  item,
  option,
  legacyFormSrc,
  dispatch,
  formatMessage,
  clipboard,
  onActionSuccess
}: {
  site: string;
  item: DetailedItem | DetailedItem[];
  option: string;
  legacyFormSrc: string;
  dispatch;
  formatMessage;
  clipboard;
  onActionSuccess?: any;
}) => {
  // actions that support only one item
  if (!Array.isArray(item)) {
    switch (option) {
      case 'view': {
        const path = item.path;
        const src = `${legacyFormSrc}site=${site}&path=${path}&type=form&readonly=true`;
        dispatch(showEditDialog({ src }));
        break;
      }
      case 'edit': {
        // TODO: Editing embedded components is not currently supported as to edit them,
        //  we need the modelId that's not supplied to this function.
        // const src = `${defaultSrc}site=${site}&path=${embeddedParentPath}&isHidden=true&modelId=${modelId}&type=form`
        const path = item.path;
        const src = `${legacyFormSrc}site=${site}&path=${path}&type=form`;
        fetchWorkflowAffectedItems(site, path).subscribe((items) => {
          if (items?.length > 0) {
            dispatch(
              showWorkflowCancellationDialog({
                items,
                onContinue: showEditDialog({
                  src,
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
                src,
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
            path: withoutIndex(item.path),
            allowBraces: item.path.startsWith('/scripts/rest'),
            onCreated: batchActions([closeCreateFolderDialog(), showCreateFolderSuccessNotification()])
          })
        );
        break;
      }
      case 'renameFolder': {
        dispatch(
          showCreateFolderDialog({
            path: withoutIndex(item.path),
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
                  CloseChangeContentTypeDialog(),
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
            setClipBoard({
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
        fetchLegacyItemsTree(site, item.path, { depth: 1000, order: 'default' }).subscribe(
          (legacyItem: LegacyItem) => {
            if (legacyItem.children.length) {
              dispatch(
                showCopyDialog({
                  title: formatMessage(translations.copyDialogTitle),
                  subtitle: formatMessage(translations.copyDialogSubtitle),
                  item: legacyItem,
                  onOk: batchActions([
                    closeCopyDialog(),
                    setClipBoard({
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
                  setClipBoard({
                    type: 'COPY',
                    paths: [item.path],
                    sourcePath: item.path
                  }),
                  showCopyItemSuccessNotification()
                ])
              );
            }
          },
          (response) => {
            dispatch(
              showErrorDialog({
                error: response
              })
            );
          }
        );
        break;
      }
      case 'paste': {
        if (clipboard.type === 'CUT') {
          fetchWorkflowAffectedItems(site, clipboard.sourcePath).subscribe((items) => {
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
      case 'translation': {
        break;
      }
      case 'editTemplate': {
        dispatch(editContentTypeTemplate({ contentTypeId: item.contentTypeId }));
        break;
      }
      case 'editController': {
        dispatch(
          editController({
            path: '/scripts/pages',
            fileName: `${popPiece(item.contentTypeId, '/')}.groovy`
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
      case 'codeEditor': {
        let src = `${legacyFormSrc}site=${site}&path=${encodeURIComponent(item.path)}&type=asset`;
        dispatch(showCodeEditorDialog({ src }));
        break;
      }
      case 'viewCodeEditor': {
        let src = `${legacyFormSrc}site=${site}&path=${encodeURIComponent(item.path)}&type=asset&readonly=true`;
        dispatch(showCodeEditorDialog({ src }));
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
      case 'preview':
      case 'cancel':
      case 'bulkPublish': {
        dispatch(
          showSystemNotification({
            message: `${option} not implemented.`
          })
        );
        break;
      }
      default:
        break;
    }
  }
  // actions that support multiple items
  switch (option) {
    case 'delete': {
      let items = Array.isArray(item) ? item : [item];
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
    case 'schedule': {
      const items = Array.isArray(item) ? item : [item];
      dispatch(
        showPublishDialog({
          items,
          scheduling: 'custom',
          onSuccess: batchActions([
            showPublishItemSuccessNotification(),
            ...items.map((item) => reloadDetailedItem({ path: item.path })),
            closePublishDialog(),
            ...(onActionSuccess ? [onActionSuccess] : [])
          ])
        })
      );
      break;
    }
    case 'approve':
    case 'publish': {
      const items = Array.isArray(item) ? item : [item];
      dispatch(
        showPublishDialog({
          items,
          scheduling: 'now',
          onSuccess: batchActions([
            showPublishItemSuccessNotification(),
            ...items.map((item) => reloadDetailedItem({ path: item.path })),
            closePublishDialog(),
            ...(onActionSuccess ? [onActionSuccess] : [])
          ])
        })
      );
      break;
    }
    case 'reject': {
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
