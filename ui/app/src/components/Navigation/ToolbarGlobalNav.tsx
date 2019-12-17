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

import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import AppsRounded from '@material-ui/icons/AppsRounded';
import Avatar from '@material-ui/core/Avatar';
import GlobalNav from './GlobalNav';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { palette } from "../../styles/theme";
import { useIntl, defineMessages } from "react-intl";
import Typography from '@material-ui/core/Typography';
import Link from "@material-ui/core/Link";

const useStyles = makeStyles(() => ({
  avatarClickable: {
    cursor: 'pointer',
    textTransform: 'uppercase',
    '&:hover': {
      backgroundColor: palette.gray.medium3,
    }
  },
  bold: {
    fontWeight: 600
  },
  userInfo: {
    padding: '10px 16px'
  },
  anchor: {
    '&:hover':{
      textDecoration: 'none',
      color: 'inherit'
    }
  }
}));

const messages = defineMessages({
  settings: {
    id: 'toolbarGlobalNav.settings',
    defaultMessage: 'Settings'
  },
  signOut: {
    id: 'toolbarGlobalNav.signOut',
    defaultMessage: 'Sign Out'
  }
});

interface ToolBarGlobalNavProps {
  // TODO: Remove line 👇🏻 once props are defined.
  [prop: string]: any;
}

export default function ToolbarGlobalNav(props: ToolBarGlobalNavProps) {
  const [anchor, setAnchor] = useState<Element>();
  const [anchorAvatar, setAnchorAvatar] = useState<Element>();
  const onMenuClick = (e) => setAnchor(e.target);
  const onAvatarClick = (e) => setAnchorAvatar(e.target);
  const onAvatarClose = () => setAnchorAvatar(null);
  const onMenuClose = () => setAnchor(null);
  const user = props.user;
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  return (
    <>
      <IconButton
        aria-label="Open drawer"
        onClick={onMenuClick}
      >
        <AppsRounded/>
      </IconButton>
      <Avatar onClick={onAvatarClick} className={classes.avatarClickable}>{user.firstName[0]}{user.lastName[0]}</Avatar>
      <Menu
        id="options-menu"
        anchorEl={anchorAvatar}
        keepMounted
        open={!!anchorAvatar}
        onClose={() => onAvatarClose()}
      >
        <div className={classes.userInfo}>
          <Typography variant="subtitle2" gutterBottom className={classes.bold}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="subtitle2">
            {user.email}
          </Typography>
        </div>
        <MenuItem><Link href="/studio/#/settings" color="textPrimary" className={classes.anchor}>{formatMessage(messages.settings)}</Link></MenuItem>
        <MenuItem id="acn-logout-link" className="hide">{formatMessage(messages.signOut)}</MenuItem>
      </Menu>
      <GlobalNav anchor={anchor} onMenuClose={onMenuClose} roles={user.role}/>
    </>
  )
}
