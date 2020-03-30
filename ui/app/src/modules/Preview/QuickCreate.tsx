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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircleRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { palette } from '../../styles/theme';
import { getQuickCreateContentList } from '../../services/content';
import {
  useActiveSiteId,
  useSpreadState,
  useSelection, usePreviewState
} from '../../utils/hooks';
import EmbeddedLegacyEditors from './EmbeddedLegacyEditors';
import NewContentDialog from '../Content/Authoring/NewContentDialog';

const translations = defineMessages({
  quickCreateBtnLabel: {
    id: 'quickCreateBtnLabel.label',
    defaultMessage: 'Open quick create menu'
  }
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addBtn: {
      padding: 0
    },

    addIcon: {
      width: 30,
      height: 30,
      fill: palette.green.main
    },

    menu: {
      transform: 'translate(20px, 15px)',
      '& ul': {
        paddingTop: 0,
        minWidth: '140px'
      }
    },

    menuItem: {
      fontSize: 14
    },

    menuTitle: {
      fontSize: 14
    },

    menuSectionTitle: {
      fontSize: 12,
      backgroundColor: palette.gray.light0,
      color: palette.gray.medium3,
      padding: '5px 16px',
      '&:hover': {
        backgroundColor: palette.gray.light0,
        cursor: 'text'
      }
    }
  })
);

export function QuickCreateMenu({ anchorEl, onMenuClose, path }) {
  const classes = useStyles({});
  const [quickCreateContentList, setQuickCreateContentList] = useState(null);
  const [displayNewContentDialog, setDisplayNewContentDialog] = useState(false);
  const siteId = useActiveSiteId();
  const AUTHORING_BASE = useSelection<string>(
    state => state.env.AUTHORING_BASE
  );

  const defaultFormSrc = `${AUTHORING_BASE}/legacy/form`;
  const [dialogConfig, setDialogConfig] = useSpreadState({
    open: false,
    src: defaultFormSrc,
    type: 'form',
    inProgress: false
  });

  const onNewContentClick = () => {
    onMenuClose();
    setDisplayNewContentDialog(true);
  };

  const onFormDisplay = srcData => () => {
    const { contentTypeId, path: _path } = srcData;
    const today = new Date();
    const formatPath = _path.replace(
      '{year}',
      today.getFullYear()
    ).replace(
      '{month}',
      ('0' + (today.getMonth() + 1)).slice(-2)
    );

    onMenuClose();

    setDialogConfig({
      open: true,
      src: `${defaultFormSrc}?isNewContent=true&contentTypeId=${contentTypeId}&path=${formatPath}&type=form`
    });
  };

  const onDialogClose = () => {
    setDisplayNewContentDialog(false);
  };

  const onTypeOpen = (srcData, contextPath: string) => () => {
    const { form } = srcData;
    const defaultPath = '/site/website/';
    const _path = !contextPath ? defaultPath : contextPath;

    setDialogConfig({
      open: true,
      src: `${defaultFormSrc}?isNewContent=true&contentTypeId=${form}&path=${_path}&type=form`
    });

    setDisplayNewContentDialog(false);
  };

  useEffect(() => {
    if (siteId) {
      getQuickCreateContentList(siteId).subscribe(data =>
        setQuickCreateContentList(data.items)
      );
    }
  }, [siteId]);

  return (
    <>
      <Menu
        className={classes.menu}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
      >
        <MenuItem
          className={classes.menuTitle}
          onClick={onNewContentClick}>
          <FormattedMessage
            id="quickCreateMenu.title"
            defaultMessage="New Content"
          />
        </MenuItem>
        <Divider />
        <Typography
          component="h4"
          className={classes.menuSectionTitle}
        >
          <FormattedMessage
            id="quickCreateMenu.sectionTitle"
            defaultMessage="Quick Create"
          />
        </Typography>

        {quickCreateContentList?.map(item =>
          <MenuItem
            key={item.path}
            onClick={onFormDisplay(item)}
            className={classes.menuItem}
          >
            {item.label}
          </MenuItem>
        )}
      </Menu>
      {
        dialogConfig.open &&
        <EmbeddedLegacyEditors
          showTabs={false}
          showController={false}
          dialogConfig={dialogConfig}
          setDialogConfig={setDialogConfig}
        />
      }
      {
        displayNewContentDialog &&
        <NewContentDialog
          open={displayNewContentDialog}
          onDialogClose={onDialogClose}
          onTypeOpen={onTypeOpen}
          site={siteId}
          path={path}
        />
      }
    </>
  );

}

export function QuickCreateMenuButton({ onMenuBtnClick }) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();

  return (
    <IconButton
      onClick={onMenuBtnClick}
      aria-label={formatMessage(translations.quickCreateBtnLabel)}
      className={classes.addBtn}
      size="small"
    >
      <AddCircleIcon fontSize="large" className={classes.addIcon} />
    </IconButton>
  );
}

export default function QuickCreate() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { computedUrl } = usePreviewState();

  const onMenuBtnClick = e => setAnchorEl(e.currentTarget);

  const onMenuClose = () => setAnchorEl(null);

  return (
    <>
      <QuickCreateMenuButton onMenuBtnClick={onMenuBtnClick} />
      <QuickCreateMenu
        anchorEl={anchorEl}
        onMenuClose={onMenuClose}
        path={computedUrl}
      />
    </>
  );
}
