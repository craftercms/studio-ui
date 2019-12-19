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

import React, { ElementType, useEffect, useState } from 'react';
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
import { getDOM, getGlobalMenuItems } from '../../services/configuration';
import Cookies from "js-cookie";
import ErrorState from "../SystemStatus/ErrorState";
import { useOnMount } from '../../utils/helpers';
import Preview from '../Icons/Preview';
import About from '../Icons/About';
import Docs from '../Icons/Docs';
import DevicesIcon from '@material-ui/icons/Devices';
import Link from '@material-ui/core/Link';
import IconButton from "@material-ui/core/IconButton";
import LoadingState from "../SystemStatus/LoadingState";
import Hidden from '@material-ui/core/Hidden';
import { Observable, forkJoin } from "rxjs";
import { LookupTable } from "../../models/LookupTable";
import { useSelector } from "react-redux";
import GlobalState from "../../models/GlobalState";
import { useActiveSiteId } from "../../utils/hooks";
import { forEach } from '../../utils/array';
import { getInnerHtml } from '../../utils/xml';
import { createStyles } from "@material-ui/core";

const tileStyles = makeStyles(() => createStyles({
  tile: {
    width: '120px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    color: palette.gray.medium5,
    cursor: 'pointer',
    textAlign: 'center',
    '&:hover': {
      textDecoration: 'none',
      '& .MuiTypography-root': {
        textDecoration: 'underline'
      }
    },
    '&.disabled': {
      opacity: '0.5',
      pointerEvents: 'none'
    }
  },
  icon: {
    fontSize: '35px !important',
    color: palette.gray.medium5
  },
  tileTitle: {
    color: palette.gray.medium5
  }
}));

const messages = defineMessages({
  mySites: {
    id: 'globalMenu.mySites',
    defaultMessage: 'My Sites'
  },
  site: {
    id: 'globalMenu.site',
    defaultMessage: 'Site'
  },
  global: {
    id: 'globalMenu.global',
    defaultMessage: 'Global'
  },
  preview: {
    id: 'globalMenu.preview',
    defaultMessage: 'Preview'
  },
  legacyPreview: {
    id: 'globalMenu.legacyPreview',
    defaultMessage: 'Legacy Preview'
  },
  about: {
    id: 'GlobalMenu.AboutUs',
    defaultMessage: 'About'
  },
  docs: {
    id: 'globalMenu.docs',
    defaultMessage: 'Documentation'
  },
  siteConfig: {
    id: 'globalMenu.siteConfig',
    defaultMessage: 'Site Config'
  },
  sites: {
    id: 'GlobalMenu.SitesEntryLabel',
    defaultMessage: 'Sites'
  },
  users: {
    id: 'GlobalMenu.UsersEntryLabel',
    defaultMessage: 'Users'
  },
  groups: {
    id: 'GlobalMenu.GroupsEntryLabel',
    defaultMessage: 'Groups'
  },
  cluster: {
    id: 'GlobalMenu.ClusterEntryLabel',
    defaultMessage: 'Cluster'
  },
  audit: {
    id: 'GlobalMenu.AuditEntryLabel',
    defaultMessage: 'Audit'
  },
  loggingLevels: {
    id: 'GlobalMenu.LoggingLevelsEntryLabel',
    defaultMessage: 'Logging Levels'
  },
  logConsole: {
    id: 'GlobalMenu.LogConsoleEntryLabel',
    defaultMessage: 'Log Console'
  },
  globalConfig: {
    id: 'GlobalMenu.GlobalConfigEntryLabel',
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

interface TileProps {
  icon: ElementType<any> | string;
  title: string;
  link?: string;
  target?: string;

  onClick?(id?: string, type?: string): any;

  disabled?: any;
}

function Tile(props: TileProps) {
  const { title, icon: Icon, link, target, onClick, disabled = false } = props;
  const classes = tileStyles({});

  return (
    <Link
      className={clsx(classes.tile, disabled && 'disabled')}
      href={disabled ? null : link}
      onClick={() => (!disabled && onClick) ? onClick() : null}
      target={target ? target : '_self'}
    >
      {
        typeof Icon === 'string'
          ? <i className={clsx(classes.icon, 'fa', Icon)}/>
          : <Icon className={classes.icon}/>
      }
      <Typography variant="subtitle1" color="textSecondary" className={classes.tileTitle}>
        {title}
      </Typography>
    </Link>
  )
}

const globalNavUrlMapping = {
  'home.globalMenu.logging-levels': '#/globalMenu/logging',
  'home.globalMenu.log-console': '#/globalMenu/log',
  'home.globalMenu.users': '#/globalMenu/users',
  'home.globalMenu.sites': '#/globalMenu/sites',
  'home.globalMenu.audit': '#/globalMenu/audit',
  'home.globalMenu.groups': '#/globalMenu/groups',
  'home.globalMenu.globalConfig': '#/globalMenu/global-config',
  'home.globalMenu.cluster': '#/globalMenu/cluster',
  'preview': '/preview',
  'about': '#/about-us',
  'legacy.preview': '/legacy/preview',
  'siteConfig': '/site-config',
};

const siteMenuKeys = {
  dashboard: 'dashboard',
  siteConfig: 'site-config'
};

const globalNavStyles = makeStyles(() => createStyles({
  popover: {
    maxWidth: '820px',
    width: 'calc(100% - 32px)',
    maxHeight: '550px',
    backgroundColor: palette.white,
    borderRadius: '20px',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25), 0px 0px 4px rgba(0, 0, 0, 0.25)'
  },
  sitesPanel: {
    backgroundColor: palette.gray.light1,
    padding: '30px 24px 30px 30px',
    height: '550px',
    overflow: 'auto',
  },
  sitesContent: {
    backgroundColor: palette.white,
    padding: '30px 24px 30px 30px',
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
    flexWrap: 'wrap'
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

interface GlobalNavProps {
  anchor: Element;
  onMenuClose: (e: any) => void;
  rolesBySite: LookupTable<string[]>;
}

export default function GlobalNav(props: GlobalNavProps) {
  const { anchor, onMenuClose, rolesBySite } = props;
  const classes = globalNavStyles({});
  const [sites, setSites] = useState(null);
  const [menuItems, setMenuItems] = useState(null);
  const [siteMenu, setSiteMenu] = useState(null);
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const { formatMessage } = useIntl();
  const { SITE_COOKIE } = useSelector<GlobalState, GlobalState['env']>(state => state.env);
  const crafterSite = useActiveSiteId();

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

  function handleErrorBack() {
    setApiState({ ...apiState, error: false });
  }

  function onPreviewClick(id: string = crafterSite) {
    if (!id) {
      id = sites[0].siteId;
    }
    Cookies.set(SITE_COOKIE, id, {
      domain: window.location.hostname.includes('.') ? window.location.hostname : '',
      path: '/'
    });
    const url = '/studio/preview/';
    const base = window.location.host.replace('3000', '8080');
    window.location.href = `//${base}${url}`;
  }

  function onDashboardClick(id: string = crafterSite) {
    if (!id) {
      id = sites[0].siteId;
    }
    Cookies.set(SITE_COOKIE, id, {
      domain: window.location.hostname.includes('.') ? window.location.hostname : '',
      path: '/'
    });
    const url = '/studio/site-dashboard';
    const base = window.location.host.replace('3000', '8080');
    window.location.href = `//${base}${url}`;
  }

  useEffect(() => {
    const requests: Observable<any>[] = [
      fetchSites(),
      getGlobalMenuItems()
    ];
    if (crafterSite) {
      requests.push(getDOM(crafterSite, '/context-nav/sidebar.xml', 'studio'));
    }
    forkJoin(requests).subscribe(
      ([sitesResponse, globalMenuItemsResponse, xml]: any) => {
        setSites(sitesResponse.response.sites);
        setMenuItems(globalMenuItemsResponse.response.menuItems);
        let roleFound = {
          [siteMenuKeys.dashboard]: false,
          [siteMenuKeys.siteConfig]: false,
        };
        if (xml) {
          forEach(
            xml.querySelectorAll('modulehook'),
            (module) => {
              if (getInnerHtml(module.querySelector('name')) === siteMenuKeys.siteConfig || getInnerHtml(module.querySelector('name')) === siteMenuKeys.dashboard) {
                const roles = module.querySelectorAll('role');
                roleFound[getInnerHtml(module.querySelector('name'))] = roles.length? forEach(
                  roles,
                  (role) => {
                    if (
                      rolesBySite[crafterSite] &&
                      rolesBySite[crafterSite].includes(getInnerHtml(role))
                    ) {
                      return true
                    }
                  },
                  false
                ) : true;
              }
            }
          );
        }
        setSiteMenu(roleFound);
      },
      (error) => {
        if (error.response) {
          const _response = { ...error.response, code: '', documentationUrl: '', remedialAction: '' };
          setApiState({ error: true, errorResponse: _response });
        }
      },
    )
  }, [crafterSite]);

  return (
    <Popover
      open={!!anchor}
      anchorEl={anchor}
      onClose={(e) => onMenuClose(e)}
      classes={{ paper: classes.popover }}
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
        onClick={(event) => onMenuClose(event)}
      >
        <CloseIcon/>
      </IconButton>
      {
        apiState.error ? (
          <ErrorState
            classes={{ root: classes.errorPaperRoot }}
            error={apiState.errorResponse}
            onBack={handleErrorBack}
          />
        ) : (sites !== null && siteMenu !== null && menuItems !== null) ? (
          <Grid container spacing={0}>
            <Hidden only={['xs', 'sm']}>
              <Grid item md={4} className={classes.sitesPanel}>
                <Typography
                  variant="subtitle1"
                  component="h2"
                  className={classes.title}
                  style={{ marginBottom: '24px' }}
                >
                  {formatMessage(messages.mySites)}
                </Typography>
                {
                  sites.map((site, i) =>
                    <SiteCard
                      key={i}
                      title={site.siteId}
                      value={site.siteId}
                      options={true}
                      classes={{ root: classes.titleCard }}
                      onCardClick={onPreviewClick}
                      cardActions={cardActions}
                    />
                  )
                }
              </Grid>
            </Hidden>
            <Grid item xs={12} md={8} className={classes.sitesContent}>
              <Typography
                variant="subtitle1"
                component="h2"
                className={classes.title}
                style={{ margin: '0px 0 10px 0' }}
              >
                {formatMessage(messages.global)}
              </Typography>
              <nav className={classes.sitesApps}>
                {
                  menuItems.map((item, i) =>
                    <Tile key={i} title={item.label} icon={item.icon} link={getLink(item.id)}/>
                  )
                }
                <Tile
                  title={formatMessage(messages.docs)}
                  icon={Docs}
                  link="https://docs.craftercms.org/en/3.1/index.html"
                  target="_blank"
                />
                <Tile
                  title={formatMessage(messages.about)}
                  icon={About}
                  link={getLink('about')}
                  target="_blank"
                />
              </nav>
              <Typography
                variant="subtitle1"
                component="h2"
                className={classes.title}
                style={{ margin: '34px 0 10px 0' }}
              >
                {formatMessage(messages.site)}
              </Typography>
              <nav className={classes.sitesApps}>
                <Tile
                  title={formatMessage(messages.preview)}
                  icon={Preview}
                  onClick={onPreviewClick}
                />
                <Tile
                  title={formatMessage(messages.legacyPreview)}
                  icon={DevicesIcon}
                  link={getLink('legacy.preview')}
                  disabled={!crafterSite}
                />
                {
                  siteMenu?.[siteMenuKeys.dashboard] &&
                  <Tile
                    title={formatMessage(messages.dashboard)}
                    icon='fa-tasks'
                    onClick={onDashboardClick}
                  />
                }
                {
                  siteMenu?.[siteMenuKeys.siteConfig] &&
                  <Tile
                    title={formatMessage(messages.siteConfig)}
                    icon='fa-sliders'
                    link={getLink('siteConfig')}
                    onClick={onMenuClose}
                  />
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

