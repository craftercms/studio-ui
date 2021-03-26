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
  showRejectItemSuccessNotification
} from '../state/actions/system';
import {
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
  hasUploadAction
} from './content';
import { isNavigable } from '../components/PathNavigator/utils';
import React from 'react';
import { previewItem } from '../state/actions/preview';

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
  publishRequest: {
    id: 'publishRequest',
    label: translations.publishRequest
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
  if (hasCreateAction(item.availableActions)) {
    sectionA.push(menuOptions.createContent);
  }
  if (hasCreateFolderAction(item.availableActions)) {
    sectionA.push(menuOptions.createFolder);
  }
  if (hasContentDeleteAction(item.availableActions)) {
    sectionA.push(menuOptions.delete);
  }
  if (hasGetDependenciesAction(item.availableActions)) {
    sectionA.push(menuOptions.dependencies);
  }
  if (hasRenameAction(item.availableActions)) {
    sectionA.push(menuOptions.rename);
  }
  if (hasReadHistoryAction(item.availableActions)) {
    sectionA.push(menuOptions.history);
  }
  if (hasChangeTypeAction(item.availableActions)) {
    sectionA.push(menuOptions.changeContentType);
  }
  if (isNavigable(item)) {
    sectionA.push(menuOptions.preview);
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
      sectionB.push(menuOptions.duplicate);
    } else {
      sectionB.push(menuOptions.duplicateAsset);
    }
  }
  if (hasUploadAction(item.availableActions)) {
    sectionB.push(menuOptions.upload);
  }
  // endregion

  // region Section C
  if (hasPublishAction(item.availableActions)) {
    sectionC.push(menuOptions.publish);
  }
  if (hasPublishRequestAction(item.availableActions)) {
    sectionC.push(menuOptions.publishRequest);
  }
  if (hasApprovePublishAction(item.availableActions)) {
    sectionC.push(menuOptions.approve);
  }
  if (hasSchedulePublishAction(item.availableActions)) {
    sectionC.push(menuOptions.schedule);
  }
  if (hasPublishRejectAction(item.availableActions)) {
    sectionC.push(menuOptions.reject);
  }
  // endregion

  // region Section D
  if (hasEditControllerAction(item.availableActions)) {
    sectionD.push(menuOptions.editController);
  }
  if (hasDeleteControllerAction(item.availableActions)) {
    sectionD.push(menuOptions.deleteController);
  }
  if (hasEditTemplateAction(item.availableActions)) {
    sectionD.push(menuOptions.editTemplate);
  }
  if (hasDeleteTemplateAction(item.availableActions)) {
    sectionD.push(menuOptions.deleteTemplate);
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
  items: DetailedItem[],
  formatMessage: IntlFormatters['formatMessage']
): ContextMenuOption[] {
  let publish = true;
  let requestPublish = true;
  let approvePublish = true;
  let schedulePublish = true;
  let deleteItem = true;
  let reject = true;
  let options = [];
  const menuOptions = toContextMenuOptionsLookup(unparsedMenuOptions, formatMessage);

  items.forEach((item) => {
    publish = publish && hasPublishAction(item.availableActions);
    requestPublish = requestPublish && hasPublishRequestAction(item.availableActions);
    approvePublish = approvePublish && hasApprovePublishAction(item.availableActions);
    schedulePublish = schedulePublish && hasSchedulePublishAction(item.availableActions);
    deleteItem = deleteItem && hasContentDeleteAction(item.availableActions);
    reject = reject && hasPublishRejectAction(item.availableActions);
  });

  if (publish) {
    options.push(menuOptions.publish);
  }
  if (schedulePublish) {
    options.push(menuOptions.schedule);
  }
  if (requestPublish) {
    options.push(menuOptions.publishRequest);
  }
  if (approvePublish) {
    options.push(menuOptions.approve);
  }
  if (deleteItem) {
    options.push(menuOptions.delete);
  }
  if (reject) {
    options.push(menuOptions.reject);
  }

  return options;
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
  option: string;
  authoringBase: string;
  dispatch;
  formatMessage;
  clipboard;
  onActionSuccess?: any;
  event: React.MouseEvent<Element, MouseEvent>;
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
            path: withoutIndex(item.path),
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
        let src = `${authoringBase}/legacy/form?site=${site}&path=${encodeURIComponent(item.path)}&type=asset`;
        dispatch(showCodeEditorDialog({ src }));
        break;
      }
      case 'viewCodeEditor': {
        let src = `${authoringBase}/legacy/form?site=${site}&path=${encodeURIComponent(
          item.path
        )}&type=asset&readonly=true`;
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
      case 'preview': {
        dispatch(previewItem({ item: item, newTab: event.ctrlKey || event.metaKey }));
        break;
      }
      case 'cancel':
      default:
        break;
    }
  }
  // actions that support multiple items
  switch (option) {
    case 'deleteTemplate':
    case 'deleteController':
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
    case 'approve':
    case 'publish':
    case 'schedule':
    case 'publishRequest': {
      const items = Array.isArray(item) ? item : [item];
      dispatch(
        showPublishDialog({
          items,
          scheduling: option === 'schedule' ? 'custom' : 'now',
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
