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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { FormattedMessage } from 'react-intl';
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

const useStyles = makeStyles(() => createStyles({
  separator: {
    borderTop: `1px solid ${palette.gray.light3}`,
    borderBottom: `1px solid ${palette.gray.light3}`
  }
}));

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

  const handleEdit = (type: string) => {
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
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
      >
        <MenuItem onClick={() => handleEdit('form')}>
          <FormattedMessage
            id="previewToolBar.menu.edit"
            defaultMessage="Edit"
          />
        </MenuItem>
        {
          (sandboxItem && !sandboxItem?.lockOwner && !sandboxItem?.isLive) &&
          <MenuItem onClick={() => handleEdit('schedule')}>
            <FormattedMessage
              id="previewToolBar.menu.schedule"
              defaultMessage="Schedule"
            />
          </MenuItem>
        }
        {
          (sandboxItem && !sandboxItem?.lockOwner && !sandboxItem?.isLive) &&
          <MenuItem onClick={() => handleEdit('publish')}>
            <FormattedMessage
              id="previewToolBar.menu.publish"
              defaultMessage="Publish"
            />
          </MenuItem>
        }
        {
          (sandboxItem && (sandboxItem.stateMap.submitted || sandboxItem.stateMap.scheduled || sandboxItem.stateMap.deleted)) &&
          <MenuItem onClick={() => handleEdit('reject')}>
            <FormattedMessage
              id="previewToolBar.menu.reject"
              defaultMessage="Reject"
            />
          </MenuItem>
        }
        <MenuItem onClick={() => handleEdit('history')}>
          <FormattedMessage
            id="previewToolBar.menu.history"
            defaultMessage="History"
          />
        </MenuItem>
        <MenuItem onClick={() => handleEdit('dependencies')}>
          <FormattedMessage
            id="previewToolBar.menu.dependencies"
            defaultMessage="Dependencies"
          />
        </MenuItem>
        <MenuItem onClick={() => handleEdit('delete')}>
          <FormattedMessage
            id="previewToolBar.menu.delete"
            defaultMessage="Delete"
          />
        </MenuItem>
        <MenuItem onClick={handleClose} className={classes.separator}>
          <FormattedMessage
            id="previewToolBar.menu.infoSheet"
            defaultMessage="Info Sheet"
          />
        </MenuItem>
        <MenuItem onClick={() => handleEdit('template')}>
          <FormattedMessage
            id="previewToolBar.menu.editTemplate"
            defaultMessage="Edit Template"
          />
        </MenuItem>
        {
          sandboxItem && !embeddedParentPath && contentTypesBranch.byId?.[sandboxItem.contentTypeId]?.type === 'page' &&
          <MenuItem onClick={() => handleEdit('controller')}>
            <FormattedMessage
              id="previewToolBar.menu.editController"
              defaultMessage="Edit Controller"
            />
          </MenuItem>
        }
      </Menu>
    </>
  );
}
