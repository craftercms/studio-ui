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

import { translations } from '../components/ItemMenu/translations';
import { DetailedItem, LegacyItem } from '../models/Item';
import LookupTable from '../models/LookupTable';
import { SectionItem } from '../components/ContextMenu';
import { getRootPath, isRootPath, withoutIndex } from './path';
import {
  CloseChangeContentTypeDialog,
  closeConfirmDialog,
  closeCopyDialog,
  closeCreateFileDialog,
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
import { fetchWorkflowAffectedItems, getLegacyItemsTree } from '../services/content';
import { batchActions, changeContentType, editTemplate } from '../state/actions/misc';
import {
  emitSystemEvent,
  itemCut,
  showCopyItemSuccessNotification,
  showCutItemSuccessNotification,
  showDeleteItemSuccessNotification,
  showDuplicatedItemSuccessNotification,
  showEditItemSuccessNotification,
  showPublishItemSuccessNotification,
  showRejectItemSuccessNotification
} from '../state/actions/system';
import {
  duplicateAsset,
  duplicateItem,
  pasteItem,
  reloadDetailedItem,
  setClipBoard,
  unlockItem
} from '../state/actions/content';
import { showErrorDialog } from '../state/reducers/dialogs/error';
import { fetchItemVersions } from '../state/reducers/versions';
import { popPiece } from './string';
const menuOptions = {
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
    label: translations.view
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
  reject: {
    id: 'reject',
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
  }
};

export function generateSingleItemOptions(item: DetailedItem, permissions: LookupTable<boolean>): SectionItem[][] {
  let options: SectionItem[][] = [];
  const write = permissions.write;
  const read = permissions.read;
  const publish = permissions.publish;
  const reject = permissions.cancel_publish;
  const deleteItem = permissions.delete;
  const createFolder = permissions.create_folder;
  const createContent = permissions.create_content;
  const changeContentType = permissions.change_content_type;
  const hasClipboard = permissions.hasClipboard;
  const isAsset = ['/templates', '/static-assets', '/scripts'].some((str) => item.path.includes(str));
  const isTemplate = item.path.includes('/templates');
  const isController = item.path.includes('/scripts');
  const isImage = item.mimeType.startsWith('image/');
  const isRootFolder = isRootPath(item.path);
  const translation = false;
  const isLocked = item.lockOwner;
  let type = item.systemType;

  switch (type) {
    case 'page': {
      let _optionsA = [];
      if (write) {
        _optionsA.push(menuOptions.edit);
        if (read) {
          _optionsA.push(menuOptions.view);
        }
        if (createFolder) {
          _optionsA.push(menuOptions.createFolder);
        }
        if (createContent) {
          _optionsA.push(menuOptions.createContent);
        }
        if (deleteItem && !isRootFolder) {
          _optionsA.push(menuOptions.delete);
        }
        if (changeContentType && !isRootFolder) {
          _optionsA.push(menuOptions.changeContentType);
        }
        if (!isRootFolder) {
          _optionsA.push(menuOptions.cut);
          _optionsA.push(menuOptions.copy);
          _optionsA.push(menuOptions.duplicate);
        }
        if (hasClipboard) {
          _optionsA.push(menuOptions.paste);
        }
        if (isLocked) {
          _optionsA.push(menuOptions.unlock);
        }
        if (publish && !isLocked && !item.stateMap.live) {
          _optionsA.push(menuOptions.schedule);
        }
        if (!isLocked && !item.stateMap.live) {
          _optionsA.push(menuOptions.publish); // this will show even when no publish permissions (shows request publish)
        }
        if (
          reject &&
          (item.stateMap.staged || item.stateMap.scheduled || item.stateMap.deleted || item.stateMap.submitted)
        ) {
          _optionsA.push(menuOptions.reject);
        }
        _optionsA.push(menuOptions.history);
        _optionsA.push(menuOptions.dependencies);
        if (translation) {
          _optionsA.push(menuOptions.translation);
        }
        _optionsA.push(menuOptions.editTemplate);
        _optionsA.push(menuOptions.editController);
      } else if (read) {
        _optionsA.push(menuOptions.view);
        _optionsA.push(menuOptions.history);
      }
      options.push(_optionsA);
      return options;
    }
    case 'folder': {
      let _optionsA = [];
      if (write) {
        if (createContent && !isAsset) {
          _optionsA.push(menuOptions.createContent);
        }
        if (createFolder) {
          _optionsA.push(menuOptions.createFolder);
        }
        if (!isRootFolder) {
          _optionsA.push(menuOptions.renameFolder);
        }
        if (deleteItem && !isRootFolder) {
          _optionsA.push(menuOptions.delete);
          _optionsA.push(menuOptions.cut);
        }
        _optionsA.push(menuOptions.copy);
        if (hasClipboard) {
          _optionsA.push(menuOptions.paste);
        }
        if (isAsset) {
          _optionsA.push(menuOptions.upload);
        }
        if (isTemplate) {
          _optionsA.push(menuOptions.createTemplate);
        }
        if (isController) {
          _optionsA.push(menuOptions.createController);
        }
      }
      options.push(_optionsA);
      return options;
    }
    case 'taxonomy':
    case 'component':
    case 'template':
    case 'script':
    case 'asset': {
      let _optionsA = [];
      if (write) {
        if (type === 'taxonomy' || type === 'component') {
          _optionsA.push(menuOptions.edit);
          if (read) {
            _optionsA.push(menuOptions.view);
          }
        } else if (isImage) {
          _optionsA.push(menuOptions.viewImage);
        } else {
          _optionsA.push(menuOptions.codeEditor);
          _optionsA.push(menuOptions.viewCodeEditor);
        }
        if (deleteItem) {
          _optionsA.push(menuOptions.delete);
        }
        if (type === 'taxonomy' || type === 'component') {
          _optionsA.push(menuOptions.changeContentType);
        }
        _optionsA.push(menuOptions.cut);
        _optionsA.push(menuOptions.copy);
        _optionsA.push(menuOptions.duplicateAsset);
        if (hasClipboard) {
          _optionsA.push(menuOptions.paste);
        }
        if (publish && !item.lockOwner && !item.stateMap.live) {
          _optionsA.push(menuOptions.schedule);
        }
        if (!isLocked && !item.stateMap.live) {
          _optionsA.push(menuOptions.publish); // this will show even when no publish permissions (shows request publish)
        }
        if (
          reject &&
          (item.stateMap.staged || item.stateMap.scheduled || item.stateMap.deleted || item.stateMap.submitted)
        ) {
          _optionsA.push(menuOptions.reject);
        }
        _optionsA.push(menuOptions.history);
        _optionsA.push(menuOptions.dependencies);
      } else if (read) {
        _optionsA.push(menuOptions.view);
        _optionsA.push(menuOptions.history);
      }
      options.push(_optionsA);
      return options;
    }
    default: {
      return options;
    }
  }
}

export function generateMultipleItemOptions(itemsDetails): SectionItem[] {
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

  if (publish) {
    const itemsPublish = itemsDetails.filter(({ item }) => {
      return !item.isLocked && !item.stateMap.live;
    });

    if (itemsPublish.length === itemsDetails.length) {
      options.push(menuOptions.publish);
      options.push(menuOptions.schedule);
    }
  }
  if (deleteItem) {
    const itemsDelete = itemsDetails.filter(({ item }) => !item.isRootFolder);

    if (itemsDelete.length === itemsDetails.length) {
      options.push(menuOptions.delete);
    }
  }
  if (reject) {
    const itemsReject = itemsDetails.filter(({ item }) => {
      return item.stateMap.staged || item.stateMap.scheduled || item.stateMap.deleted || item.stateMap.submitted;
    });

    if (itemsReject.length === itemsDetails.length) {
      options.push(menuOptions.reject);
    }
  }

  return options;
}

export const itemActionDispatcher = (
  site: string,
  item: DetailedItem | DetailedItem[],
  option: SectionItem,
  legacyFormSrc: string,
  dispatch,
  formatMessage,
  clipboard,
  onActionSuccess?: any
) => {
  // actions that support only one item
  if (!Array.isArray(item)) {
    switch (option.id) {
      case 'view': {
        const path = item.path;
        const src = `${legacyFormSrc}site=${site}&path=${path}&type=form&readonly=true`;
        dispatch(showEditDialog({ src }));
        break;
      }
      case 'edit': {
        const path = item.path;
        const src = `${legacyFormSrc}site=${site}&path=${path}&type=form`;
        // TODO: open a embedded form needs the following:
        // src = `${defaultSrc}site=${site}&path=${embeddedParentPath}&isHidden=true&modelId=${modelId}&type=form`

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
            allowBraces: item.path.startsWith('/scripts/rest')
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
        getLegacyItemsTree(site, item.path, { depth: 1000, order: 'default' }).subscribe(
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
          dispatch(pasteItem({ path: item.path }));
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
              duplicateAsset({
                path: item.path,
                onSuccess: batchActions([
                  showDuplicatedItemSuccessNotification(),
                  ...(onActionSuccess ? [onActionSuccess] : [])
                ])
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
              duplicateItem({
                path: item.path,
                onSuccess: batchActions([
                  showDuplicatedItemSuccessNotification(),
                  ...(onActionSuccess ? [onActionSuccess] : [])
                ])
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
        dispatch(editTemplate({ contentTypeId: item.contentTypeId }));
        break;
      }
      case 'editController': {
        const path = `/scripts/pages/${popPiece(item.contentTypeId, '/')}.groovy`;
        let src = `${legacyFormSrc}site=${site}&path=${path}&type=controller`;

        fetchWorkflowAffectedItems(site, path).subscribe((items) => {
          if (items?.length > 0) {
            dispatch(
              showWorkflowCancellationDialog({
                items,
                onContinue: showCodeEditorDialog({ src })
              })
            );
          } else {
            dispatch(showCodeEditorDialog({ src }));
          }
        });
        break;
      }
      case 'createTemplate': {
        dispatch(
          showCreateFileDialog({
            path: withoutIndex(item.path),
            type: 'template',
            onCreated: closeCreateFileDialog()
          })
        );
        break;
      }
      case 'createController': {
        dispatch(
          showCreateFileDialog({
            path: withoutIndex(item.path),
            type: 'controller',
            onCreated: closeCreateFileDialog()
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
      default:
        break;
    }
  }

  // actions that support multiple items
  switch (option.id) {
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
