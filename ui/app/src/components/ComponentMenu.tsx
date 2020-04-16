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
import { createStyles, makeStyles, Menu, PopoverOrigin, Theme } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { FormattedMessage } from 'react-intl';
import EmbeddedLegacyEditors from '../modules/Preview/EmbeddedLegacyEditors';
import { palette } from '../styles/theme';
import { useSelection, useSpreadState } from '../utils/hooks';
import { getLegacyItem } from '../services/content';
import { popPiece } from '../utils/string';
import { LookupTable } from '../models/LookupTable';
import ContentInstance from '../models/ContentInstance';
import { useDispatch } from 'react-redux';
import { showPublishDialog } from '../state/reducers/dialogs/publish';
import { closeDeleteDialog, showDeleteDialog } from '../state/reducers/dialogs/delete';
import { showErrorDialog } from '../state/reducers/dialogs/error';
import { showDependenciesDialog } from '../state/reducers/dialogs/dependencies';

const useStyles = makeStyles((theme: Theme) => createStyles({
  separator: {
    borderTop: `1px solid ${palette.gray.light3}`,
    borderBottom: `1px solid ${palette.gray.light3}`
  }
}));

interface ComponentMenuProps {
  anchorEl: Element;
  site: string;
  modelId: string;
  parentId?: string;
  embeddedParentPath?: string;
  anchorOrigin?: PopoverOrigin;

  handleClose(): void;
}

export default function ComponentMenu(props: ComponentMenuProps) {
  const classes = useStyles({});
  const { anchorEl, site, modelId, parentId, handleClose, embeddedParentPath = null, anchorOrigin = undefined } = props;
  const models = useSelection<LookupTable<ContentInstance>>(state => state.preview.guest?.models);
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const AUTHORING_BASE = useSelection<string>(state => state.env.AUTHORING_BASE);
  const defaultSrc = `${AUTHORING_BASE}/legacy/form?`;
  const dispatch = useDispatch();
  const [dialogConfig, setDialogConfig] = useSpreadState({
    open: false,
    src: null,
    type: null,
    inProgress: true
  });

  const [publishDialog, setPublishDialog] = useState({
    items: null
  });

  const [dependenciesDialog, setDependenciesDialog] = useSpreadState({
    item: null,
    dependenciesShown: 'depends-on'
  });

  const [deleteDialog, setDeleteDialog] = useState({
    items: []
  });

  // Effect used to open the publish Dialog
  useEffect(() => {
    if (models && modelId && publishDialog.items === null) {
      let path = models[modelId].craftercms.path;
      if (embeddedParentPath) path = models[parentId].craftercms.path;
      getLegacyItem(site, path).subscribe(
        (item) => {
          setPublishDialog({ items: [item] });
          setDependenciesDialog({ item })
          setDeleteDialog({ items: [item] });
        },
        (response) => {
          dispatch(showErrorDialog({
            error: response
          }))
        }
      );
    }
  }, [models, modelId, setPublishDialog, setDependenciesDialog, setDeleteDialog, site, embeddedParentPath, parentId, publishDialog.items, dispatch]);

  const handleEdit = (type: string) => {
    handleClose();
    switch (type) {
      case 'schedule': {
        dispatch(showPublishDialog({
          items: publishDialog.items,
          scheduling: 'custom'
        }));
        break;
      }
      case 'publish': {
        dispatch(showPublishDialog({
          items: publishDialog.items,
          scheduling: 'now'
        }));
        break;
      }
      case 'dependencies' : {
        dispatch(showDependenciesDialog({
          item: dependenciesDialog.item,
          dependenciesShown: dependenciesDialog.dependenciesShown
        }));

        break;
      }
      case 'delete': {
        dispatch(showDeleteDialog({
          items: deleteDialog.items,
          onSuccess: closeDeleteDialog
        }));
        break;
      }
      case 'form':
      case 'template':
      case 'controller': {
        let src = `${defaultSrc}site=${site}&path=${getPath(type)}&type=${type}`;
        if (embeddedParentPath && type === 'form') {
          src = `${defaultSrc}site=${site}&path=${embeddedParentPath}&isHidden=true&modelId=${modelId}&type=form`;
        }
        setDialogConfig(
          {
            open: true,
            src,
            type
          });
        break;
      }
    }
  };

  const getPath = (type?: string) => {
    switch (type) {
      case 'publish':
      case 'form': {
        if (embeddedParentPath) return embeddedParentPath;
        return models[modelId].craftercms.path;
      }
      case 'template': {
        return contentTypesBranch.byId[models[modelId].craftercms.contentType].displayTemplate;
      }
      case 'controller': {
        let pageName = popPiece(models[modelId].craftercms.contentType, '/');
        return `/scripts/pages/${pageName}.groovy`;
      }
      default: {
        return models[modelId].craftercms.path;
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
          (publishDialog.items && !publishDialog.items?.lockOwner && !publishDialog.items?.isLive) &&
          <MenuItem onClick={() => handleEdit('schedule')}>
            <FormattedMessage
              id="previewToolBar.menu.schedule"
              defaultMessage="Schedule"
            />
          </MenuItem>
        }
        {
          (publishDialog.items && !publishDialog.items?.lockOwner && !publishDialog.items?.isLive) &&
          <MenuItem onClick={() => handleEdit('publish')}>
            <FormattedMessage
              id="previewToolBar.menu.publish"
              defaultMessage="Publish"
            />
          </MenuItem>
        }
        <MenuItem onClick={handleClose}>
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
          publishDialog.items && !embeddedParentPath && contentTypesBranch.byId?.[publishDialog.items.contentType]?.type === 'page' &&
          <MenuItem onClick={() => handleEdit('controller')}>
            <FormattedMessage
              id="previewToolBar.menu.editController"
              defaultMessage="Edit Controller"
            />
          </MenuItem>
        }
      </Menu>
      {
        dialogConfig.open &&
        <EmbeddedLegacyEditors
          dialogConfig={dialogConfig}
          setDialogConfig={setDialogConfig}
          getPath={getPath}
          showController={!embeddedParentPath && contentTypesBranch.byId?.[publishDialog.items.contentType]?.type === 'page'}
        />
      }
    </>
  );
}
