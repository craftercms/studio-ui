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

import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { PopoverOrigin } from '@material-ui/core/Popover';
import { defineMessages } from 'react-intl';
import { useActiveSiteId, useSelection } from '../utils/hooks';
import { fetchWorkflowAffectedItems, getDetailedItem, getSandboxItem } from '../services/content';
import { popPiece } from '../utils/string';
import { LookupTable } from '../models/LookupTable';
import ContentInstance from '../models/ContentInstance';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../state/reducers/dialogs/error';
import { fetchItemVersions } from '../state/reducers/versions';
import {
  closeDeleteDialog,
  closeWorkflowCancellationDialog,
  showCodeEditorDialog,
  showDeleteDialog,
  showDependenciesDialog,
  showEditDialog,
  showHistoryDialog,
  showPublishDialog,
  showRejectDialog,
  showWorkflowCancellationDialog
} from '../state/actions/dialogs';
import { batchActions } from '../state/actions/misc';
import palette from '../styles/palette';
import ContextMenu, { SectionItem } from './ContextMenu';

const useStyles = makeStyles(() => createStyles({
  separator: {
    borderTop: `1px solid ${palette.gray.light3}`,
    borderBottom: `1px solid ${palette.gray.light3}`
  }
}));

export const translations = defineMessages({
  edit: {
    id: 'words.edit',
    defaultMessage: 'Edit'
  },
  schedule: {
    id: 'words.schedule',
    defaultMessage: 'Schedule'
  },
  publish: {
    id: 'words.publish',
    defaultMessage: 'Publish'
  },
  reject: {
    id: 'words.reject',
    defaultMessage: 'Reject'
  },
  history: {
    id: 'words.history',
    defaultMessage: 'History'
  },
  dependencies: {
    id: 'words.dependencies',
    defaultMessage: 'Dependencies'
  },
  delete: {
    id: 'words.delete',
    defaultMessage: 'Delete'
  },
  controller: {
    id: 'componentMenu.controller',
    defaultMessage: 'Edit Controller'
  },
  template: {
    id: 'componentMenu.template',
    defaultMessage: 'Edit Template'
  },
  infoSheet: {
    id: 'componentMenu.infoSheet',
    defaultMessage: 'Info Sheet.'
  },
  loading: {
    id: 'componentMenu.loading',
    defaultMessage: 'Loading...'
  }
});

const menuOptions = {
  loading: {
    id: 'loading',
    label: translations.loading
  },
  form: {
    id: 'form',
    label: translations.edit
  },
  schedule: {
    id: 'schedule',
    label: translations.schedule
  },
  publish: {
    id: 'schedule',
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
  delete: {
    id: 'delete',
    label: translations.delete
  },
  controller: {
    id: 'controller',
    label: translations.controller
  },
  template: {
    id: 'template',
    label: translations.template
  },
  infoSheet: {
    id: 'infoSheet',
    label: translations.infoSheet
  }
};

interface ComponentMenuProps {
  anchorEl: Element;
  site: string;
  modelId: string;
  embeddedParentPath?: string;
  anchorOrigin?: PopoverOrigin;

  handleClose(): void;
}

export default function ComponentMenu(props: ComponentMenuProps) {
  const classes = useStyles();
  const { anchorEl, site, modelId, handleClose, embeddedParentPath = null, anchorOrigin = undefined } = props;
  const models = useSelection<LookupTable<ContentInstance>>(state => state.preview.guest?.models);
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const authoringBase = useSelection<string>(state => state.env.authoringBase);
  const defaultSrc = `${authoringBase}/legacy/form?`;
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();

  const [sandboxItem, setSandboxItem] = useState(null);
  const [detailedItem, setDetailedItem] = useState(null);

  //region permissions
  const [options, setOptions] = useState<any>([[menuOptions.loading]]);
  const currentPath = models?.[modelId].craftercms.path;
  const permissions = useSelection((state) => state.content.permissions);
  const write = permissions?.[currentPath]?.['write'];
  const publish = permissions?.[currentPath]?.['publish'];
  const reject = permissions?.[currentPath]?.['cancel_publish'];
  const deleteContent = permissions?.[currentPath]?.['delete_content'];
  const editController = !embeddedParentPath && contentTypesBranch.byId?.[sandboxItem?.contentTypeId]?.type === 'page';
  //endregion

  useEffect(() => {
    if (sandboxItem) {
      let _optionsA = [];
      let _optionsB = [];
      if (write) {
        _optionsA.push(menuOptions.form);
        if (publish && !sandboxItem?.lockOwner && !sandboxItem?.isLive) {
          _optionsA.push(menuOptions.schedule);
          _optionsA.push(menuOptions.publish);
        }
        if (reject && (sandboxItem.stateMap.submitted || sandboxItem.stateMap.scheduled || sandboxItem.stateMap.deleted)) {
          _optionsA.push(menuOptions.reject);
        }

        // TODO: review this permissions;
        _optionsA.push(menuOptions.history);
        _optionsA.push(menuOptions.dependencies);

        if (deleteContent) {
          _optionsA.push(menuOptions.delete);
        }
        _optionsB.push(menuOptions.template);
        if (editController) {
          _optionsB.push(menuOptions.controller);
        }
      }
      setOptions(
        [
          [..._optionsA],
          [menuOptions.infoSheet],
          [..._optionsB]
        ]
      );
    }
  }, [write, publish, reject, deleteContent, editController, sandboxItem]);

  useEffect(() => {
    if (modelId && models && anchorEl && sandboxItem === null) {
      let path = models[modelId].craftercms.path;
      if (embeddedParentPath) path = embeddedParentPath;
      getSandboxItem(site, path).subscribe(
        (item) => {
          setSandboxItem(item);
        },
        (response) => {
          dispatch(showErrorDialog({
            error: response
          }));
        }
      );

      getDetailedItem(site, path).subscribe(
        (item) => {
          setDetailedItem(item);
        },
        (response) => {
          dispatch(showErrorDialog({
            error: response
          }));
        }
      );
    }
    return () => {
      if (anchorEl === null) {
        setSandboxItem(null);
        setDetailedItem(null);
      }
    };
  }, [models, modelId, site, embeddedParentPath, dispatch, sandboxItem, anchorEl]);

  const handleEdit = ({ id: type }: SectionItem) => {
    handleClose();
    switch (type) {
      case 'schedule': {
        dispatch(showPublishDialog({
          items: [detailedItem],
          scheduling: 'custom'
        }));
        break;
      }
      case 'publish': {
        dispatch(showPublishDialog({
          items: [detailedItem],
          scheduling: 'now'
        }));
        break;
      }
      case 'reject': {
        dispatch(showRejectDialog({
          items: [sandboxItem]
        }));
        break;
      }
      case 'history': {
        dispatch(batchActions([
          fetchItemVersions({ item: sandboxItem }),
          showHistoryDialog({})
        ]));
        break;
      }
      case 'dependencies' : {
        dispatch(showDependenciesDialog({
          item: sandboxItem
        }));
        break;
      }
      case 'delete': {
        dispatch(showDeleteDialog({
          items: [sandboxItem],
          onSuccess: closeDeleteDialog()
        }));
        break;
      }
      case 'form': {
        const path = embeddedParentPath ? embeddedParentPath : models[modelId].craftercms.path;
        const src = embeddedParentPath
          ? `${defaultSrc}site=${site}&path=${embeddedParentPath}&isHidden=true&modelId=${modelId}&type=form`
          : `${defaultSrc}site=${site}&path=${path}&type=${type}`;

        dispatch(showWorkflowCancellationDialog({
          items: null,
          onContinue: showEditDialog({ src })
        }));

        fetchWorkflowAffectedItems(siteId, path).subscribe(
          (items) => {
            if (items?.length > 0) {
              // update items state
              dispatch(showWorkflowCancellationDialog({ items }));
            } else {
              dispatch(
                closeWorkflowCancellationDialog()
              );
              dispatch(showEditDialog({ src }));
            }

          }
        );
        break;
      }
      case 'template':
      case 'controller': {
        const path = type === 'template'
          ? contentTypesBranch.byId[models[modelId].craftercms.contentTypeId].displayTemplate
          : `/scripts/pages/${popPiece(models[modelId].craftercms.contentTypeId, '/')}.groovy`;
        let src = `${defaultSrc}site=${site}&path=${path}&type=${type}`;

        dispatch(showWorkflowCancellationDialog({
          items: null,
          onContinue: showCodeEditorDialog({ src })
        }));

        fetchWorkflowAffectedItems(siteId, path).subscribe(
          (items) => {
            if (items?.length > 0) {
              // update items state
              dispatch(showWorkflowCancellationDialog({
                items
              }));
            } else {
              dispatch(
                closeWorkflowCancellationDialog()
              );
              dispatch(
                showCodeEditorDialog({ src })
              );
            }

          }
        );

        break;
      }
    }
  };

  return (
    <ContextMenu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      sections={options}
      onMenuItemClicked={(section) => handleEdit(section)}
      anchorOrigin={anchorOrigin}
    />
  );
}
