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

import React, { Suspense } from 'react';
import { ContextMenuItems, SectionItem } from '../ContextMenu';
import { Resource } from '../../models/Resource';
import { DetailedItem, LegacyItem } from '../../models/Item';
import { LookupTable } from '../../models/LookupTable';
import { useActiveSiteId, useLogicResource, useSelection } from '../../utils/hooks';
import { generateMenuOptions } from './utils';
import Menu from '@material-ui/core/Menu';
import { PopoverOrigin, Typography } from '@material-ui/core';
import {
  closeConfirmDialog,
  closeCopyDialog,
  closeCreateFileDialog,
  closeCreateFolderDialog,
  closeDeleteDialog,
  closeNewContentDialog,
  closeUploadDialog,
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
  showPublishDialog,
  showUploadDialog,
  showWorkflowCancellationDialog
} from '../../state/actions/dialogs';
import {
  copy,
  cut,
  duplicate,
  fetchWorkflowAffectedItems,
  getPages,
  paste
} from '../../services/content';
import { useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { translations } from '../Navigation/PathNavigator/translations';
import { batchActions, changeContentType, editTemplate } from '../../state/actions/misc';
import { fetchItemVersions } from '../../state/reducers/versions';
import StandardAction from '../../models/StandardAction';
import { withoutIndex } from '../../utils/path';
import { setClipBoard, unSetClipBoard } from '../../state/actions/content';
import { popPiece } from '../../utils/string';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';

interface ItemMenuProps {
  path: string;
  open: boolean;
  anchorEl: Element;
  classes?: Partial<Record<'paper' | 'itemRoot' | 'menuList' | 'helperText', string>>;
  anchorOrigin?: PopoverOrigin;
  onClose(): void;
  onItemMenuActionSuccessCreator?(args: object): StandardAction;
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
      display: 'flex',
      padding: '0px 10px',
      alignItems: 'center',
      '& > p': {
        marginLeft: '10px'
      }
    }
  }));

export function ItemMenu(props: ItemMenuProps) {
  const { path, onClose, onItemMenuActionSuccessCreator } = props;
  const classes = useStyles({});
  const site = useActiveSiteId();
  const permissions = useSelection((state) => state.content.permissions);
  const items = useSelection((state) => state.content.items);
  const hasClipboard = useSelection((state) => state.content.clipboard);
  const item = items.byId?.[path];
  const itemPermissions = permissions?.[path];
  const authoringBase = useSelection<string>(state => state.env.authoringBase);
  const defaultSrc = `${authoringBase}/legacy/form?`;
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
    onClose();
    switch (option.id) {
      case 'view':
      case 'edit': {
        const path = item.path;
        const src = `${defaultSrc}site=${site}&path=${path}&type=form&${option.id === 'view' && 'readonly=true'}`;
        // TODO: open a embedded neeeds the following:
        //src = `${defaultSrc}site=${site}&path=${embeddedParentPath}&isHidden=true&modelId=${modelId}&type=form`

        fetchWorkflowAffectedItems(site, path).subscribe(
          (items) => {
            if (items?.length > 0) {
              dispatch(showWorkflowCancellationDialog({
                items,
                onContinue: showEditDialog({ src })
              }));
            } else {
              dispatch(showEditDialog({ src }));
            }

          }
        );
        break;
      }
      case 'createFolder': {
        dispatch(showCreateFolderDialog({
          path: withoutIndex(item.path),
          allowBraces: item.path.startsWith('/scripts/rest'),
          onCreated: batchActions([
            closeCreateFolderDialog(),
            onItemMenuActionSuccessCreator?.({ item, option: option.id })
          ])
        }));
        break;
      }
      case 'createContent': {
        dispatch(
          showNewContentDialog({
            open: true,
            item,
            rootPath: item.path,
            compact: true,
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
            onSuccess: batchActions([
              onItemMenuActionSuccessCreator?.({ item, option: option.id }),
              closeDeleteDialog()
            ].filter(Boolean))
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
              showNewContentDialog({
                open: true,
                rootPath: path,
                item,
                type: 'change',
                selectedContentType: item.contentTypeId,
                onContentTypeSelected: batchActions([
                  closeNewContentDialog(),
                  changeContentType({ contentTypeId: item.contentTypeId, path })
                ])
              })
            ])
          })
        );
        break;
      }
      case 'cut': {
        cut(site, item).subscribe(
          ({ success }) => {
            if (success) {
              dispatch(setClipBoard({ path: item.path }));
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
      case 'copy': {
        getPages(site, item).subscribe(
          (legacyItem: LegacyItem) => {
            if (legacyItem.children.length) {
              dispatch(showCopyDialog({
                title: formatMessage(translations.copyDialogTitle),
                subtitle: formatMessage(translations.copyDialogSubtitle),
                item: legacyItem,
                onOk: batchActions([
                  closeCopyDialog(),
                  setClipBoard({ path: item.path })
                ])
              }));
            } else {
              copy(site, item).subscribe(
                (response) => {
                  if (response.success) {
                    dispatch(setClipBoard({ path: item.path }));
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
        paste(site, item).subscribe(
          () => {
            dispatch(unSetClipBoard());
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
      case 'duplicate': {
        // fetch or widgetShould dispatch FetchDetailedItem??
        //TODO: Where is the ParentITEM??
        const parentItem = null;
        dispatch(
          showConfirmDialog({
            title: formatMessage(translations.duplicate),
            body: formatMessage(translations.duplicateDialogBody),
            onCancel: closeConfirmDialog(),
            onOk: {
              type: 'DISPATCH_DOM_EVENT',
              payload: { id: option.id }
            }
          })
        );

        const callback = (e) => {
          duplicate(site, item, parentItem).subscribe((item: DetailedItem) => {
            //TODO: Open FORM
          });
          dispatch(closeConfirmDialog());
          document.removeEventListener(option.id, callback, false);
        };
        document.addEventListener(option.id, callback, true);
        break;
      }
      case 'schedule': {
        dispatch(showPublishDialog({
          items: [item],
          scheduling: 'custom'
        }));
        break;
      }
      case 'publish': {
        dispatch(showPublishDialog({
          items: [item],
          scheduling: 'now'
        }));
        break;
      }
      case 'history': {
        dispatch(batchActions([
          fetchItemVersions({ item }),
          showHistoryDialog({})
        ]));
        break;
      }
      case 'dependencies': {
        dispatch(showDependenciesDialog({ item }));
        break;
      }
      case 'translation': {
        //TODO: Pending Dialog
        break;
      }
      case 'editTemplate': {
        dispatch(editTemplate({ contentTypeId: item.contentTypeId }));
        break;
      }
      case 'editController': {
        const path = `/scripts/pages/${popPiece(item.contentTypeId, '/')}.groovy`;
        let src = `${defaultSrc}site=${site}&path=${path}&type=controller`;

        fetchWorkflowAffectedItems(site, path).subscribe(
          (items) => {
            if (items?.length > 0) {
              dispatch(showWorkflowCancellationDialog({
                items,
                onContinue: showCodeEditorDialog({ src })
              }));
            } else {
              dispatch(
                showCodeEditorDialog({ src })
              );
            }
          }
        );
        break;
      }
      case 'createTemplate': {
        dispatch(showCreateFileDialog({
          path: withoutIndex(item.path),
          type: 'template',
          onCreated: batchActions([
            closeCreateFileDialog(),
            onItemMenuActionSuccessCreator?.({ item, option: 'refresh' })
          ])
        }));
        break;
      }
      case 'createController': {
        dispatch(showCreateFileDialog({
          path: withoutIndex(item.path),
          type: 'controller',
          onCreated: batchActions([
            closeCreateFileDialog(),
            onItemMenuActionSuccessCreator?.({ item, option: 'refresh' })
          ])
        }));
        break;
      }
      case 'upload': {
        dispatch(showUploadDialog({
          path: item.path,
          site,
          onClose: batchActions([
            closeUploadDialog(),
            onItemMenuActionSuccessCreator?.({ item, option: 'upload' })
          ])
        }));
        break;
      }
      default:
        break;
    }
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
            <CircularProgress size={16} />
            <Typography variant="body2">
              <FormattedMessage id="words.loading" defaultMessage="Loading" />
            </Typography>
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

