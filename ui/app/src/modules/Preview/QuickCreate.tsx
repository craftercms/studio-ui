/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
  useSelection
} from '../../utils/hooks';
import EmbeddedLegacyEditors from './EmbeddedLegacyEditors';

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

export default function QuickCreate() {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const siteId = useActiveSiteId();
  const AUTHORING_BASE = useSelection<string>(
    state => state.env.AUTHORING_BASE
  );
  const defaultFormSrc = `${AUTHORING_BASE}/legacy/form`;
  const [anchorEl, setAnchorEl] = useState(null);
  const [quickCreateContentList, setQuickCreateContentList] = useState(null);
  const [dialogConfig, setDialogConfig] = useSpreadState({
    open: false,
    src: defaultFormSrc,
    type: 'form',
    inProgress: false
  });

  const handleClick = e => setAnchorEl(e.currentTarget);

  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    if (siteId) {
      getQuickCreateContentList(siteId).subscribe(data =>
        setQuickCreateContentList(data.items)
      );
    }
  }, [siteId]);

  const handleFormDisplay = srcData => {
    const { contentTypeId, path } = srcData;
    const today = new Date();
    const formatPath = path.replace(
      '{year}',
      today.getFullYear()
    ).replace(
      '{month}',
      ('0' + (today.getMonth() + 1)).slice(-2)
    );
    const src = `${defaultFormSrc}?isNewContent=true&contentTypeId=${contentTypeId}&path=${formatPath}&type=form`;

    setDialogConfig({
      open: true,
      src
    });
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label={formatMessage(translations.quickCreateBtnLabel)}
        className={classes.addBtn}
        size="small"
      >
        <AddCircleIcon fontSize="large" className={classes.addIcon} />
      </IconButton>
      <Menu
        className={classes.menu}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem className={classes.menuTitle}>
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
            onClick={() => {
              handleMenuClose();
              handleFormDisplay(item);
            }}
            className={classes.menuItem}
          >
            {item.label}
          </MenuItem>
        )}
      </Menu>
      <EmbeddedLegacyEditors
        showTabs={false}
        showController={false}
        dialogConfig={dialogConfig}
        setDialogConfig={setDialogConfig}
      />
    </>
  );
}
