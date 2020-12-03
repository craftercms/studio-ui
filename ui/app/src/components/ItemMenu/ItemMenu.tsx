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

import React, { PropsWithChildren, Suspense } from 'react';
import { ContextMenuItems, SectionItem } from '../ContextMenu';
import { Resource } from '../../models/Resource';
import { DetailedItem, LegacyItem } from '../../models/Item';
import { LookupTable } from '../../models/LookupTable';
import { useActiveSiteId, useEnv, useLogicResource, usePermissions, useSelection } from '../../utils/hooks';
import { generateMenuOptions } from './utils';
import Menu from '@material-ui/core/Menu';
import { PopoverOrigin, PopoverPosition, PopoverReference } from '@material-ui/core';
import {
  CloseChangeContentTypeDialog,
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
  showCreateFileDialog,
  showCreateFolderDialog,
  showDeleteDialog,
  showDependenciesDialog,
  showEditDialog,
  showHistoryDialog,
  showNewContentDialog,
  showPreviewDialog,
  showPublishDialog,
  showUploadDialog,
  showWorkflowCancellationDialog
} from '../../state/actions/dialogs';
import { fetchWorkflowAffectedItems, getLegacyItemsTree } from '../../services/content';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { batchActions, changeContentType, editTemplate } from '../../state/actions/misc';
import { fetchItemVersions } from '../../state/reducers/versions';
import { getRootPath, isValidCutPastePath, withoutIndex } from '../../utils/path';
import {
  duplicateAsset,
  duplicateItem,
  pasteItem,
  reloadDetailedItem,
  setClipBoard
} from '../../state/actions/content';
import { popPiece } from '../../utils/string';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { translations } from './translations';
import { rand } from '../Navigation/PathNavigator/utils';
import {
  emitSystemEvent,
  itemCut,
  showCopyItemSuccessNotification,
  showCutItemSuccessNotification,
  showDeleteItemSuccessNotification,
  showDuplicatedItemSuccessNotification,
  showEditItemSuccessNotification,
  showPublishItemSuccessNotification
} from '../../state/actions/system';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import { Clipboard } from '../../models/GlobalState';
import StandardAction from '../../models/StandardAction';

interface ItemMenuBaseProps {
  path: string;
  open: boolean;
  classes?: Partial<Record<'paper' | 'itemRoot' | 'menuList' | 'helperText', string>>;
  anchorOrigin?: PopoverOrigin;
  anchorReference?: PopoverReference;
  anchorPosition?: PopoverPosition;
  loaderItems?: number;
}

export type ItemMenuProps = PropsWithChildren<
  ItemMenuBaseProps & {
    anchorEl?: Element;
    onClose?(): void;
  }
>;

interface ItemMenuUIProps {
  resource: { item: Resource<DetailedItem>; permissions: Resource<LookupTable<boolean>> };
  classes?: Partial<Record<'helperText' | 'itemRoot', string>>;
  clipboard: Clipboard;
  onMenuItemClicked(section: SectionItem): void;
}

export interface ItemMenuStateProps extends ItemMenuBaseProps {
  onClose?: StandardAction;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    loadingWrapper: {
      width: '135px',
      padding: '0px 15px'
    },
    typo: {
      padding: '6px 0'
    }
  })
);

export default function ItemMenu(props: ItemMenuProps) {
  const {
    open,
    path,
    onClose,
    loaderItems = 8,
    classes,
    anchorEl,
    anchorOrigin,
    anchorReference = 'anchorEl',
    anchorPosition
  } = props;
  const site = useActiveSiteId();
  const permissions = usePermissions();
  const items = useSelection((state) => state.content.items);
  const clipboard = useSelection((state) => state.content.clipboard);
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

  const resourcePermissions = useLogicResource<LookupTable<boolean>, LookupTable<boolean>>(itemPermissions, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

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
        // src = `${defaultSrc}site=${site}&path=${embeddedParentPath}&isHidden=true&modelId=${modelId}&type=form`

        fetchWorkflowAffectedItems(site, path).subscribe((items) => {
          if (items?.length > 0) {
            dispatch(
              showWorkflowCancellationDialog({
                items,
                onContinue: showEditDialog({
                  src,
                  onSaveSuccess: batchActions([showEditItemSuccessNotification(), reloadDetailedItem({ path })])
                })
              })
            );
          } else {
            dispatch(
              showEditDialog({
                src,
                onSaveSuccess: batchActions([showEditItemSuccessNotification(), reloadDetailedItem({ path })])
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
              duplicateItem({
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
      default:
        break;
    }
    onClose();
  };
  return (
    <Menu
      open={open}
      classes={{ paper: classes?.paper, list: classes?.menuList }}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      anchorPosition={anchorPosition}
      anchorReference={anchorReference}
    >
      <Suspense fallback={<Loader numOfItems={loaderItems} />}>
        <ItemMenuUI
          resource={{ item: resourceItem, permissions: resourcePermissions }}
          classes={classes}
          onMenuItemClicked={onMenuItemClicked}
          clipboard={clipboard}
        />
      </Suspense>
    </Menu>
  );
}

function ItemMenuUI(props: ItemMenuUIProps) {
  const { resource, classes, onMenuItemClicked, clipboard } = props;
  const item = resource.item.read();
  let permissions = resource.permissions.read();
  const hasClipboard =
    clipboard?.paths.length &&
    getRootPath(clipboard.sourcePath) === getRootPath(item.path) &&
    isValidCutPastePath(item.path, clipboard.sourcePath);
  const options = generateMenuOptions(item, { hasClipboard, ...permissions });

  return <ContextMenuItems classes={classes} sections={options} onMenuItemClicked={onMenuItemClicked} />;
}

export const Loader = React.memo((props: { numOfItems?: number }) => {
  const { numOfItems = 5 } = props;
  const classes = useStyles();
  const items = new Array(numOfItems).fill(null);
  return (
    <div className={classes.loadingWrapper}>
      {items.map((value, i) => (
        <Typography key={i} variant="body2" className={classes.typo} style={{ width: `${rand(85, 100)}%` }}>
          <Skeleton animation="wave" width="100%" />
        </Typography>
      ))}
    </div>
  );
});
