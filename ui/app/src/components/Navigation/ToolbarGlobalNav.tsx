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

import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import CrafterChevron from '../Icons/CrafterChevron';
import Avatar from '@material-ui/core/Avatar';
import GlobalNav from './GlobalNav';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { getLogoutInfoURL, logout } from '../../services/auth';
import Cookies from 'js-cookie';
import GlobalState from '../../models/GlobalState';
import { useEnv, useMount, useSelection } from '../../utils/hooks';
import palette from '../../styles/palette';

const useStyles = makeStyles(() => ({
  avatarClickable: {
    cursor: 'pointer',
    textTransform: 'uppercase',
    backgroundColor: palette.red.main,
    '&:hover': {
      backgroundColor: palette.red.shade
    }
  },
  bold: {
    fontWeight: 600
  },
  userInfo: {
    padding: '10px 16px'
  },
  anchor: {
    '&:hover': {
      textDecoration: 'none',
      color: 'inherit'
    }
  },
  appsButton: {
    padding: '5px',
  },
  crafterIcon: {
    fontSize: '1.4em'
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
  },
  openDrawer: {
    id: 'toolbarGlobalNav.openMenuButtonText',
    defaultMessage: 'Open Menu'
  }
});

interface ToolBarGlobalNavProps {
  authHeaders?: string;
  authSaml?: string;
}

export default function ToolbarGlobalNav(props: ToolBarGlobalNavProps) {
  const user = useSelection<GlobalState['user']>(state => state.user);
  const [anchor, setAnchor] = useState<Element>();
  const [anchorAvatar, setAnchorAvatar] = useState<Element>();
  const onMenuClick = (e) => setAnchor(e.target);
  const onAvatarClick = (e) => setAnchorAvatar(e.target);
  const onAvatarClose = () => setAnchorAvatar(null);
  const onMenuClose = () => setAnchor(null);
  const [logoutInfo, setLogoutInfo] = useState({ url: null, show: false });
  const { authHeaders = 'AUTH_HEADERS', authSaml = 'SAML' } = props;
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();

  useMount(() => {
    if (user.authType === authHeaders || user.authType === authSaml) {
      getLogoutInfoURL().subscribe((response) => {
        setLogoutInfo({
          url: response.logoutUrl ?? false,
          show: !!response.logoutUrl
        });
      });
    } else {
      setLogoutInfo({ url: false, show: true });
    }
  });

  function onLogout() {
    setAnchorAvatar(null);
    logout().subscribe(() => {
      Cookies.set('userSession', null);
      if (logoutInfo.url) {
        window.location.href = logoutInfo.url;
      } else {
        window.location.href = '/studio';
      }
    });
  }

  return (
    <>
      <IconButton
        aria-label={formatMessage(messages.openDrawer)}
        onClick={onMenuClick}
        className={classes.appsButton}
      >
        <CrafterChevron className={classes.crafterIcon} />
      </IconButton>
      <Avatar onClick={onAvatarClick} className={classes.avatarClickable}>
        {user.firstName[0]}{user.lastName[0]}
      </Avatar>
      <Menu
        anchorEl={anchorAvatar}
        open={!!anchorAvatar}
        onClose={() => onAvatarClose()}
        disableEnforceFocus={true}
      >
        <div className={classes.userInfo}>
          <Typography variant="subtitle2" gutterBottom className={classes.bold}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="subtitle2">
            {user.email}
          </Typography>
        </div>
        <MenuItem
          component={Link}
          href={`${authoringBase}/#/settings`}
          color="textPrimary"
          className={classes.anchor}
        >
          {formatMessage(messages.settings)}
        </MenuItem>
        {
          logoutInfo.show &&
          <MenuItem onClick={onLogout}>{formatMessage(messages.signOut)}</MenuItem>
        }
      </Menu>
      <GlobalNav anchor={anchor} onMenuClose={onMenuClose} rolesBySite={user.rolesBySite} />
    </>
  );
}
