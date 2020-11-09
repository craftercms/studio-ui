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

import React, { Fragment, Suspense, useState } from 'react';
import { ContextMenuItems, SectionItem } from '../ContextMenu';
import { Resource } from '../../models/Resource';
import { DetailedItem, LegacyItem } from '../../models/Item';
import { LookupTable } from '../../models/LookupTable';
import {
  useActiveSiteId,
  useEnv,
  useLogicResource,
  usePermissions,
  useSelection
} from '../../utils/hooks';
import { generateMenuOptions } from './utils';
import Menu from '@material-ui/core/Menu';
import { PopoverOrigin } from '@material-ui/core';
import {
  closeChangeContentTypeDialog,
  closeConfirmDialog,
  closeCopyDialog,
  closeCreateFileDialog,
  closeDeleteDialog,
  closePublishDialog,
  closeUploadDialog,
  showChangeContentTypeDialog,
  showCodeEditorDialog,
  showConfirmDialog,
  showCopyDialog,
  showCopyItemSuccessNotification,
  showCreateFileDialog,
  showCreateFolderDialog,
  showDeleteDialog,
  showDeleteItemSuccessNotification,
  showDependenciesDialog,
  showDuplicatedItemSuccessNotification,
  showEditDialog,
  showEditItemSuccessNotification,
  showHistoryDialog,
  showNewContentDialog,
  showPasteItemSuccessNotification,
  showPreviewDialog,
  showPublishDialog,
  showPublishItemSuccessNotification,
  showUploadDialog,
  showWorkflowCancellationDialog
} from '../../state/actions/dialogs';
import {
  copy,
  fetchWorkflowAffectedItems,
  getLegacyItemsTree,
  paste
} from '../../services/content';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { batchActions, changeContentType, editTemplate } from '../../state/actions/misc';
import { fetchItemVersions } from '../../state/reducers/versions';
import { getRootPath, withoutIndex } from '../../utils/path';
import {
  assetDuplicate,
  itemCut,
  itemDuplicate,
  reloadDetailedItem,
  setClipBoard,
  unSetClipBoard
} from '../../state/actions/content';
import { popPiece } from '../../utils/string';
import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';
import { translations } from './translations';
import ContentLoader from 'react-content-loader';
import { rand } from '../Navigation/PathNavigator/utils';
import { itemPasted } from '../../state/actions/systemEvents';

interface ItemMenuProps {
  path: string;
  open: boolean;
  anchorEl: Element;
  classes?: Partial<Record<'paper' | 'itemRoot' | 'menuList' | 'helperText', string>>;
  anchorOrigin?: PopoverOrigin;
  loaderItems?: number;
  onClose(): void;
}

interface ItemMenuUIProps {
  resource: { item: Resource<DetailedItem>; permissions: Resource<LookupTable<boolean>> };
  classes?: Partial<Record<'helperText' | 'itemRoot', string>>;
  hasClipboard?: boolean;
  onMenuItemClicked(section: SectionItem): void;
}

const useStyles = makeStyles(() =>
  createStyles({
    loadingWrapper: {
      width: '135px',
      padding: '0px 15px'
    }
  })
);

export function ItemMenu(props: ItemMenuProps) {
  const { path, onClose, loaderItems = 8 } = props;
  const classes = useStyles({});
  const site = useActiveSiteId();
  const permissions = usePermissions();
  const items = useSelection((state) => state.content.items);
  const hasClipboard = useSelection((state) => state.content.clipboard);
  const item = items.byPath?.[path];
  const itemPermissions = permissions?.[path];
  const { authoringBase } = useEnv();
  const legacyFormSrc = `${authoringBase}/legacy/form?`;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const resourceItem = useLogicResource<DetailedItem, DetailedItem>(item, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  const resourcePermissions = useLogicResource<LookupTable<boolean>, LookupTable<boolean>>(
    itemPermissions,
    {
      shouldResolve: (source) => Boolean(source),
      shouldReject: (source) => false,
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: (source) => source,
      errorSelector: (source) => null
    }
  );

  const onMenuItemClicked = (option: SectionItem) => {
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
        //src = `${defaultSrc}site=${site}&path=${embeddedParentPath}&isHidden=true&modelId=${modelId}&type=form`

        fetchWorkflowAffectedItems(site, path).subscribe((items) => {
          if (items?.length > 0) {
            dispatch(
              showWorkflowCancellationDialog({
                items,
                onContinue: showEditDialog({
                  src,
                  onSaveSuccess: batchActions([
                    showEditItemSuccessNotification(),
                    reloadDetailedItem({ path })
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
                  reloadDetailedItem({ path })
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
      case 'delete': {
        let items = [item];
        dispatch(
          showDeleteDialog({
            items,
            onSuccess: batchActions([showDeleteItemSuccessNotification(), closeDeleteDialog()])
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
                  changeContentType({ contentTypeId: item.contentTypeId, path: item.path })
                ])
              })
            ])
          })
        );
        break;
      }
      case 'cut': {
        fetchWorkflowAffectedItems(site, path).subscribe((items) => {
          if (items?.length > 0) {
            dispatch(
              showWorkflowCancellationDialog({
                items,
                onContinue: itemCut({ path })
              })
            );
          } else {
            dispatch(itemCut({ path }));
          }
        });
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
                    setClipBoard({ path: item.path }),
                    showCopyItemSuccessNotification()
                  ])
                })
              );
            } else {
              copy(site, item.path).subscribe(
                (response) => {
                  if (response.success) {
                    dispatch(
                      batchActions([
                        setClipBoard({ path: item.path }),
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
        paste(site, item.path).subscribe(
          (resultingPaths) => {
            dispatch(
              batchActions([
                itemPasted({ target: item.path, resultingPaths }),
                unSetClipBoard(),
                showPasteItemSuccessNotification()
              ])
            );
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
      case 'duplicateAsset': {
        dispatch(
          showConfirmDialog({
            title: formatMessage(translations.duplicate),
            body: formatMessage(translations.duplicateDialogBody),
            onCancel: closeConfirmDialog(),
            onOk: batchActions([
              closeConfirmDialog(),
              assetDuplicate({
                path: item.path,
                onSuccess: showDuplicatedItemSuccessNotification()
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
              itemDuplicate({
                path: item.path,
                onSuccess: showDuplicatedItemSuccessNotification()
              })
            ])
          })
        );
        break;
      }
      case 'schedule': {
        dispatch(
          showPublishDialog({
            items: [item],
            scheduling: 'custom',
            onSuccess: batchActions([
              showPublishItemSuccessNotification(),
              reloadDetailedItem({ path: item.path }),
              closePublishDialog()
            ])
          })
        );
        break;
      }
      case 'publish': {
        dispatch(
          showPublishDialog({
            items: [item],
            scheduling: 'now',
            onSuccess: batchActions([
              showPublishItemSuccessNotification(),
              reloadDetailedItem({ path: item.path }),
              closePublishDialog()
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
            onCreated: batchActions([closeCreateFileDialog()])
          })
        );
        break;
      }
      case 'createController': {
        dispatch(
          showCreateFileDialog({
            path: withoutIndex(item.path),
            type: 'controller',
            onCreated: batchActions([closeCreateFileDialog()])
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
        let src = `${legacyFormSrc}site=${site}&path=${encodeURIComponent(
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
            onClose: batchActions([closeUploadDialog()])
          })
        );
        break;
      }
      default:
        break;
    }
    onClose();
  };
  return (
    <Menu
      anchorEl={props.anchorEl}
      open={props.open}
      classes={{ paper: props.classes?.paper, list: props.classes?.menuList }}
      onClose={props.onClose}
      anchorOrigin={props.anchorOrigin}
    >
      <Suspense
        fallback={
          <div className={classes.loadingWrapper}>
            <Loader loaderItems={loaderItems} />
          </div>
        }
      >
        <ItemMenuUI
          resource={{ item: resourceItem, permissions: resourcePermissions }}
          classes={props.classes}
          onMenuItemClicked={onMenuItemClicked}
          hasClipboard={Boolean(hasClipboard)}
        />
      </Suspense>
    </Menu>
  );
}

function ItemMenuUI(props: ItemMenuUIProps) {
  const { resource, classes, onMenuItemClicked, hasClipboard } = props;
  const item = resource.item.read();
  let permissions = resource.permissions.read();
  const options = generateMenuOptions(item, { hasClipboard, ...permissions });

  return (
    <ContextMenuItems classes={classes} sections={options} onMenuItemClicked={onMenuItemClicked} />
  );
}

export function Loader(props) {
  const [items] = useState(() => {
    const numOfItems = props.loaderItems;
    const start = 20;
    return new Array(numOfItems).fill(null).map((_, i) => ({
      y: start + 32 * i,
      width: rand(85, 100)
    }));
  });
  return (
    <ContentLoader
      speed={2}
      width="100%"
      height={`${props.loaderItems * 32}`}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {items.map(({ y, width }, i) => (
        <Fragment key={i}>
          <rect x="0" y={y - 5} rx="5" ry="5" width={`${width}%`} height="10" />
        </Fragment>
      ))}
    </ContentLoader>
  );
}
