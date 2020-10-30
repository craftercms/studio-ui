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
import GlobalNav from './GlobalNav';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { defineMessages, useIntl } from 'react-intl';
import { getLogoutInfoURL } from '../../services/auth';
import GlobalState from '../../models/GlobalState';
import {
  useActiveSiteId,
  useEnv,
  useMount,
  useSelection,
  useSiteList,
  useSiteNavLinks,
  useSystemVersion
} from '../../utils/hooks';
import palette from '../../styles/palette';
import Tooltip from '@material-ui/core/Tooltip';
import { useDispatch } from 'react-redux';
import { fetchSites } from '../../state/reducers/sites';

const useStyles = makeStyles((theme) => ({
  avatarClickable: {
    width: 43,
    height: 43,
    fontSize: '1em',
    cursor: 'pointer',
    boxShadow: 'none',
    color: palette.white,
    textTransform: 'uppercase',
    padding: theme.spacing(1),
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
    padding: '5px'
  },
  crafterIcon: {
    fontSize: '1.4em'
  }
}));

const messages = defineMessages({
  menu: {
    id: 'words.menu',
    defaultMessage: 'Menu'
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
  const onMenuClick = (e) => setAnchor(e.target);
  const onMenuClose = () => setAnchor(null);
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { authHeaders = 'AUTH_HEADERS', authSaml = 'SAML' } = props;
  const [logoutUrl, setLogoutUrl] = useState<string>('/studio');
  const { authoringBase } = useEnv();
  const siteNavLinks = useSiteNavLinks();
  const version = useSystemVersion();
  const sites = useSiteList();
  const dispatch = useDispatch();

  useMount(() => {
    if (user.authType === authHeaders || user.authType === authSaml) {
      getLogoutInfoURL().subscribe((response) => {
        setLogoutUrl(response.logoutUrl ?? null);
      });
    }
    if (sites === null) {
      dispatch(fetchSites());
    }
  });

  return (
    <>
      <Tooltip title={formatMessage(messages.menu)}>
        <IconButton
          aria-label={formatMessage(messages.openDrawer)}
          onClick={onMenuClick}
          className={classes.appsButton}
        >
          <CrafterChevron className={classes.crafterIcon} />
        </IconButton>
      </Tooltip>
      <GlobalNav
        site={useActiveSiteId()}
        sites={sites}
        anchor={anchor}
        user={user}
        version={version}
        logoutUrl={logoutUrl}
        authoringUrl={authoringBase}
        onMenuClose={onMenuClose}
        rolesBySite={user.rolesBySite}
        siteNavLinks={siteNavLinks}
      />
    </>
  );
}
