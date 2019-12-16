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

import React, { ElementType, useState } from 'react';
import { defineMessages, useIntl } from "react-intl";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { palette } from "../../styles/theme";
import { fetchSites } from "../../services/sites";
import Popover from "@material-ui/core/Popover";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import SiteCard from "./SiteCard";
import HomeIcon from '@material-ui/icons/Home';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { getDOM, getGlobalMenuitems } from '../../services/configuration';
import Cookies from "js-cookie";
import ErrorState from "../SystemStatus/ErrorState";
import { useOnMount } from '../../utils/helpers';
import Preview from '../Icons/Preview';
import Link from '@material-ui/core/Link';
import IconButton from "@material-ui/core/IconButton";
import LoadingState from "../SystemStatus/LoadingState";

const useStyles = makeStyles(() => ({
  popover: {
    maxWidth: '920px',
    width: '100%',
    maxHeight: '656px',
    backgroundColor: palette.white,
    borderRadius: '20px',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25), 0px 0px 4px rgba(0, 0, 0, 0.25)'
  },
  sitesPanel: {
    backgroundColor: palette.gray.light1,
    padding: '30px 24px 30px 30px',
    height: '600px',
    overflow: 'auto',
  },
  sitesContent: {
    backgroundColor: palette.white,
    padding: '86px 24px 30px 30px',
  },
  title: {
    textTransform: 'uppercase',
    color: palette.gray.dark1,
    fontWeight: 600,
  },
  titleCard: {
    marginBottom: '20px',
  },
  sitesApps: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  tile: {
    padding: '10px',
    width: '120px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    color: palette.gray.dark1,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
      '& .MuiTypography-root': {
        textDecoration: 'underline'
      }
    }
  },
  icon: {
    fontSize: '35px',
    color: palette.gray.dark1
  },
  tileTitle: {
    color: palette.gray.dark1
  },
  errorPaperRoot: {
    height: '100%'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px'
  },
  simpleGear: {
    margin: 'auto'
  },
  loadingContainer: {
    height: '600px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}));

const messages = defineMessages({
  mySites: {
    id: 'globalMenu.mySites',
    defaultMessage: 'My Sites'
  },
  myDashboard: {
    id: 'globalMenu.myDashboard',
    defaultMessage: 'My Dashboard'
  },
  apps: {
    id: 'globalMenu.apps',
    defaultMessage: 'Apps'
  },
  preview: {
    id: 'globalMenu.preview',
    defaultMessage: 'Preview'
  },
  siteConfig: {
    id: 'globalMenu.siteConfig',
    defaultMessage: 'Site Config'
  },
  sites: {
    id: 'globalMenu.sites',
    defaultMessage: 'Sites'
  },
  users: {
    id: 'globalMenu.users',
    defaultMessage: 'Users'
  },
  groups: {
    id: 'globalMenu.groups',
    defaultMessage: 'Groups'
  },
  cluster: {
    id: 'globalMenu.cluster',
    defaultMessage: 'Cluster'
  },
  audit: {
    id: 'globalMenu.audit',
    defaultMessage: 'Audit'
  },
  loggingLevels: {
    id: 'globalMenu.loggingLevels',
    defaultMessage: 'Logging Levels'
  },
  logConsole: {
    id: 'globalMenu.logConsole',
    defaultMessage: 'Log Console'
  },
  globalConfig: {
    id: 'globalMenu.globalConfig',
    defaultMessage: 'Global Config'
  },
  dashboard: {
    id: 'globalMenu.dashboard',
    defaultMessage: 'Dashboard'
  },
  remove: {
    id: 'globalMenu.remove',
    defaultMessage: 'Remove'
  },
  ok: {
    id: 'globalMenu.ok',
    defaultMessage: 'Ok'
  },
  cancel: {
    id: 'globalMenu.cancel',
    defaultMessage: 'Cancel'
  },
  removeSite: {
    id: 'globalMenu.removeSite',
    defaultMessage: 'Remove site'
  },
  removeSiteConfirm: {
    id: 'globalMenu.removeSiteConfirm',
    defaultMessage: 'Do you want to remove {site}?'
  }
});

const globalNavUrlMapping = {
  'home.globalMenu.logging-levels': '/#/globalMenu/logging',
  'home.globalMenu.log-console': '/#/globalMenu/log',
  'home.globalMenu.users': '/#/globalMenu/users',
  'home.globalMenu.sites': '/#/globalMenu/sites',
  'home.globalMenu.audit': '/#/globalMenu/audit',
  'home.globalMenu.groups': '/#/globalMenu/groups',
  'home.globalMenu.globalConfig': '/#/globalMenu/global-config',
  'home.globalMenu.cluster': '/#/globalMenu/cluster',
  'preview': '/preview',
  'siteConfig': '/site-config',
};

interface TileProps {
  icon: ElementType<any> | string;
  title: string;
  link?: string;
}

function Tile(props: TileProps) {
  const {title, icon: Icon, link} = props;
  const classes = useStyles({});

  return (
    <Link className={classes.tile} href={link}>
      {
        typeof Icon === 'string'
          ? <i className={clsx(classes.icon, `fa ${Icon}`)}></i>
          : <Icon className={classes.icon}/>
      }
      <Typography variant="subtitle1" color="textSecondary" className={classes.tileTitle}>
        {title}
      </Typography>
    </Link>
  )
}

interface GlobalNavProps {
  anchor: Element;
  onMenuClose: (e: React.MouseEvent<any>) => void;
}

export default function GlobalNav(props: GlobalNavProps) {
  const {anchor, onMenuClose} = props;
  const [open, setOpen] = useState(true);
  const classes = useStyles({});
  const [sites, setSites] = useState(null);
  const [menuItems, setMenuItems] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const {formatMessage} = useIntl();

  const cardActions = [
    {
      name: formatMessage(messages.preview),
      onClick: onPreviewClick
    },
    {
      name: formatMessage(messages.dashboard),
      onClick: onDashboardClick
    },
  ];

  function handleClose(event) {
    setOpen(false);
    onMenuClose(event)
  }

  function handleErrorBack() {
    setApiState({...apiState, error: false});
  }

  useOnMount(() => {
    fetchSites().subscribe(
      ({response}) => {
        setSites(response.sites);
      },
      ({response}) => {
        setApiState({error: true, errorResponse: response});
      }
    );
    getGlobalMenuitems().subscribe(
      ({response}) => {
        setMenuItems(response.menuItems);
      },
      ({response}) => {
        setApiState({error: true, errorResponse: response});
      }
    );
    getDOM(Cookies.get('crafterSite'), '/context-nav/sidebar.xml', 'studio').subscribe(
      (xml) => {
        if (xml) {
          let modules = xml.querySelectorAll('modulehook');
          modules.forEach((module) => {
            if (module.querySelector('name').innerHTML === 'site-config') {
              module.querySelectorAll('role').forEach((role) => {
                if (role.innerHTML === 'admin') {
                  setSiteConfig(true);
                }
              });
            }
          })
        }
      }
    );
  });

  return (
    <Popover
      open={open}
      anchorEl={anchor}
      onClose={(e) => handleClose(e)}
      classes={{paper: classes.popover}}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={(event) => handleClose(event)}
      >
        <CloseIcon/>
      </IconButton>
      {
        apiState.error ? (
          <ErrorState
            classes={{root: classes.errorPaperRoot}}
            error={apiState.errorResponse}
            onBack={handleErrorBack}
          />
        ) : (sites && siteConfig && menuItems) ? (
          <Grid container spacing={0}>
            <Grid item xs={5} className={classes.sitesPanel}>
              <Typography variant="subtitle1" component="h2" className={classes.title} style={{marginBottom: '24px'}}>
                {formatMessage(messages.mySites)}
              </Typography>
              {
                sites &&
                sites.map((site, i) =>
                  <SiteCard
                    key={i}
                    title={site.siteId}
                    options={true}
                    classes={{root: classes.titleCard}}
                    onCardClick={onPreviewClick}
                    cardActions={cardActions}
                  />
                )
              }
            </Grid>
            <Grid item xs={7} className={classes.sitesContent}>
              <SiteCard
                title={formatMessage(messages.myDashboard)}
                icon={HomeIcon}
                onCardClick={onDashboardClick}
              />
              <Typography variant="subtitle1" component="h2" className={classes.title}
                          style={{margin: '34px 0 10px 0'}}>
                {formatMessage(messages.apps)}
              </Typography>
              <nav className={classes.sitesApps}>
                {
                  (siteConfig && menuItems) &&
                  <>
                    <Tile
                      title={formatMessage(messages.preview)}
                      icon={Preview}
                      link={getLink('preview')}
                    />
                    <Tile
                      title={formatMessage(messages.siteConfig)}
                      icon='fa fa-sliders'
                      link={getLink('siteConfig')}
                    />
                    {
                      menuItems.map((item, i) =>
                        <Tile key={i} title={item.label} icon={item.icon} link={getLink(item.id)}/>
                      )
                    }
                  </>
                }
              </nav>
            </Grid>
          </Grid>
        ) : (
          <div className={classes.loadingContainer}>
            <LoadingState title=''/>
          </div>
        )
      }
    </Popover>
  )
}


function getLink(id: string) {
  const base = window.location.host.replace('3000', '8080');
  return `//${base}/studio${globalNavUrlMapping[id]}`;
}

function onPreviewClick(id: string, type: string) {
  if (type === 'option') {
    Cookies.set('crafterSite', id, {
      domain: window.location.hostname.includes('.') ? window.location.hostname : '',
      path: '/'
    });
  }
  const url = '/studio/preview/';
  const base = window.location.host.replace('3000', '8080');
  window.location.href = `//${base}${url}`;
}

function onDashboardClick(id: string, type: string) {
  if (type === 'option') {
    Cookies.set('crafterSite', id, {
      domain: window.location.hostname.includes('.') ? window.location.hostname : '',
      path: '/'
    });
  }
  const url = '/studio/site-dashboard';
  const base = window.location.host.replace('3000', '8080');
  window.location.href = `//${base}${url}`;
}
