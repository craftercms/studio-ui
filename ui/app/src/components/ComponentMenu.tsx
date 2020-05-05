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
import { getLegacyItem, parseLegacyItemToSandBoxItem } from '../services/content';
import { popPiece } from '../utils/string';
import { LookupTable } from '../models/LookupTable';
import ContentInstance from '../models/ContentInstance';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../state/reducers/dialogs/error';
import { fetchItemVersions, resetVersionsState } from '../state/reducers/versions';
import {
  closeDeleteDialog,
  showDeleteDialog,
  showDependenciesDialog,
  showHistoryDialog,
  showPublishDialog
} from '../state/actions/dialogs';

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

  const [item, setItem] = useState(null);

  // Effect used to open the publish Dialog
  useEffect(() => {
    if (modelId && models && anchorEl && item === null) {
      let path = models[modelId].craftercms.path;
      if (embeddedParentPath) path = models[parentId].craftercms.path;
      getLegacyItem(site, path).subscribe(
        (item) => {
          setItem(item);
        },
        (response) => {
          dispatch(showErrorDialog({
            error: response
          }));
        }
      );
    }
  }, [models, modelId, site, embeddedParentPath, parentId, dispatch, item, anchorEl]);

  const handleEdit = (type: string) => {
    handleClose();
    switch (type) {
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
        const path = models[modelId].craftercms.path || models[parentId].craftercms.path;
        dispatch(fetchItemVersions({ path }));
        dispatch(showHistoryDialog({
          item: parseLegacyItemToSandBoxItem(item),
          onClose: resetVersionsState()
        }));
        break;
      }
      case 'dependencies' : {
        dispatch(showDependenciesDialog({
          item: item
        }));
        break;
      }
      case 'delete': {
        dispatch(showDeleteDialog({
          items: [item],
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
          (item && !item?.lockOwner && !item?.isLive) &&
          <MenuItem onClick={() => handleEdit('schedule')}>
            <FormattedMessage
              id="previewToolBar.menu.schedule"
              defaultMessage="Schedule"
            />
          </MenuItem>
        }
        {
          (item && !item?.lockOwner && !item?.isLive) &&
          <MenuItem onClick={() => handleEdit('publish')}>
            <FormattedMessage
              id="previewToolBar.menu.publish"
              defaultMessage="Publish"
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
          item && !embeddedParentPath && contentTypesBranch.byId?.[item.contentType]?.type === 'page' &&
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
          showController={!embeddedParentPath && contentTypesBranch.byId?.[item.contentType]?.type === 'page'}
        />
      }
    </>
  );
}
