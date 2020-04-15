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

import React, { ElementType, useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { palette } from '../../styles/theme';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SiteCard from './SiteCard';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { getDOM, getGlobalMenuItems } from '../../services/configuration';
import ErrorState from '../SystemStatus/ErrorState';
import Preview from '../Icons/Preview';
import About from '../Icons/About';
import Docs from '../Icons/Docs';
import DevicesIcon from '@material-ui/icons/Devices';
import SearchIcon from '@material-ui/icons/SearchRounded';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import LoadingState from '../SystemStatus/LoadingState';
import Hidden from '@material-ui/core/Hidden';
import { forkJoin, Observable } from 'rxjs';
import { LookupTable } from '../../models/LookupTable';
import { useActiveSiteId, useEnv, useSelection } from '../../utils/hooks';
import { forEach } from '../../utils/array';
import { getInnerHtml } from '../../utils/xml';
import { createStyles } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { camelize, popPiece } from '../../utils/string';
import { changeSite, fetchSites } from '../../state/reducers/sites';

const tileStyles = makeStyles(() =>
  createStyles({
    tile: {
      'width': '120px',
      'height': '100px',
      'display': 'flex',
      'alignItems': 'center',
      'flexDirection': 'column',
      'justifyContent': 'center',
      'cursor': 'pointer',
      'textAlign': 'center',
      '&:hover': {
        'textDecoration': 'none',
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
    tileTitle: {}
  })
);

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
    defaultMessage: 'Preview 2.0 (beta)'
  },
  legacyPreview: {
    id: 'globalMenu.legacyPreview',
    defaultMessage: 'Preview'
  },
  search: {
    id: 'words.search',
    defaultMessage: 'Search'
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
  encryptionTool: {
    id: 'GlobalMenu.EncryptionToolEntryLabel',
    defaultMessage: 'Encryption Tool'
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
  disabled?: any;

  onClick?(id?: string, type?: string): any;
}

function Tile(props: TileProps) {
  const { title, icon: Icon, link, target, onClick, disabled = false } = props;
  const classes = tileStyles({});

  return (
    <Link
      className={clsx(classes.tile, disabled && 'disabled')}
      href={disabled ? null : link}
      onClick={() => (!disabled && onClick ? onClick() : null)}
      target={target ? target : '_self'}
    >
      {typeof Icon === 'string' ? (
        <i className={clsx(classes.icon, 'fa', Icon)} />
      ) : (
        <Icon className={classes.icon} />
      )}
      <Typography variant="subtitle1" color="textSecondary" className={classes.tileTitle}>
        {title}
      </Typography>
    </Link>
  );
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
  'home.globalMenu.encryptionTool': '#/globalMenu/encryption-tool',
  'preview': '/next/preview',
  'about': '#/about-us',
  'legacy.preview': '/preview',
  'siteConfig': '/site-config',
  'search': '/search'
};

const siteMenuKeys = {
  dashboard: 'dashboard',
  siteConfig: 'site-config'
};

const maxHeight = '550px';

const globalNavStyles = makeStyles((theme) =>
  createStyles({
    popover: {
      maxWidth: '820px',
      width: 'calc(100% - 32px)',
      maxHeight,
      borderRadius: '20px'
    },
    sitesPanel: {
      ...(theme.palette.type === 'dark'
        ? { backgroundColor: palette.gray.dark1 }
        : { backgroundColor: palette.gray.light1 }),
      padding: '30px 24px 30px 30px',
      maxHeight,
      overflow: 'auto'
    },
    sitesContent: {
      padding: '30px 24px 30px 30px',
      maxHeight,
      overflow: 'auto'
    },
    title: {
      textTransform: 'uppercase',
      fontWeight: 600
    },
    titleCard: {
      marginBottom: '20px'
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
  })
);

interface GlobalNavProps {
  anchor: Element;
  onMenuClose: (e: any) => void;
  rolesBySite: LookupTable<string[]>;
}

export default function GlobalNav(props: GlobalNavProps) {
  const { anchor, onMenuClose, rolesBySite } = props;
  const classes = globalNavStyles({});
  const sitesState = useSelection(state => state.sites);
  const sites = useMemo(() => Object.values(sitesState.byId), [sitesState]);
  const [menuItems, setMenuItems] = useState(null);
  const [siteMenu, setSiteMenu] = useState(null);
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const { formatMessage } = useIntl();
  const { AUTHORING_BASE } = useEnv();
  const crafterSite = useActiveSiteId();
  const dispatch = useDispatch();

  const cardActions = [
    {
      name: formatMessage(messages.preview),
      onClick: onPreviewClick
    },
    {
      name: formatMessage(messages.dashboard),
      onClick: onDashboardClick
    }
  ];

  function handleErrorBack() {
    setApiState({ ...apiState, error: false });
  }

  function onPreviewClick(id: string = crafterSite) {
    onLinkClick('/next/preview', id);
  }

  function onDashboardClick(id: string = crafterSite) {
    onLinkClick('/site-dashboard', id);
  }

  function onLinkClick(url: string, id: string) {
    window.location.href = `${AUTHORING_BASE}${url}`;
  }

  function onSiteCardClick(id: string) {
    dispatch(changeSite(id));
    onPreviewClick(id);
  }

  useEffect(() => {
    if (crafterSite) {
      dispatch(fetchSites());
      const requests: Observable<any>[] = [getGlobalMenuItems()];
      requests.push(getDOM(crafterSite, '/context-nav/sidebar.xml', 'studio'));
      forkJoin(requests).subscribe(
        ([globalMenuItemsResponse, xml]: any) => {
          setMenuItems(globalMenuItemsResponse.response.menuItems);
          let roleFound = {
            [siteMenuKeys.dashboard]: false,
            [siteMenuKeys.siteConfig]: false
          };
          if (xml) {
            forEach(xml.querySelectorAll('modulehook'), (module) => {
              if (
                getInnerHtml(module.querySelector('name')) === siteMenuKeys.siteConfig ||
                getInnerHtml(module.querySelector('name')) === siteMenuKeys.dashboard
              ) {
                const roles = module.querySelectorAll('role');
                roleFound[getInnerHtml(module.querySelector('name'))] = roles.length
                  ? forEach(
                    roles,
                    (role) => {
                      if (
                        rolesBySite[crafterSite] &&
                        rolesBySite[crafterSite].includes(getInnerHtml(role))
                      ) {
                        return true;
                      }
                    },
                    false
                  )
                  : true;
              }
            });
          }
          setSiteMenu(roleFound);
        },
        (error) => {
          if (error.response) {
            const _response = {
              ...error.response,
              code: '',
              documentationUrl: '',
              remedialAction: ''
            };
            setApiState({ error: true, errorResponse: _response });
          }
        }
      );
    }
  }, [crafterSite, dispatch, rolesBySite]);

  return (
    <Popover
      open={!!anchor}
      anchorEl={anchor}
      onClose={(e) => onMenuClose(e)}
      classes={{ paper: classes.popover }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={(event) => onMenuClose(event)}
      >
        <CloseIcon />
      </IconButton>
      {
        apiState.error ? (
          <ErrorState
            classes={{ root: classes.errorPaperRoot }}
            error={apiState.errorResponse}
            onBack={handleErrorBack}
          />
        ) : (!sitesState.isFetching && siteMenu !== null && menuItems !== null) ? (
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
                  sites.map((site, i) => (
                    <SiteCard
                      key={i}
                      title={site.name}
                      value={site.id}
                      options={true}
                      classes={{ root: classes.titleCard }}
                      onCardClick={() => onSiteCardClick(site.id)}
                      cardActions={cardActions}
                    />
                  ))
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
                {menuItems.map((item) => (
                  <Tile
                    key={item.id}
                    title={formatMessage(messages[popPiece(camelize(item.id))])}
                    icon={item.icon}
                    link={getLink(item.id)}
                    onClick={onMenuClose}
                  />
                ))}
                <Tile
                  title={formatMessage(messages.docs)}
                  icon={Docs}
                  link="https://docs.craftercms.org/en/3.1/index.html"
                  target="_blank"
                />
                <Tile title={formatMessage(messages.about)} icon={About} link={getLink('about')} />
              </nav>
              <Typography variant="subtitle1" component="h2" className={classes.title}>
                {formatMessage(messages.site)}
              </Typography>
              <nav className={classes.sitesApps}>
                {siteMenu?.[siteMenuKeys.dashboard] && (
                  <Tile
                    title={formatMessage(messages.dashboard)}
                    icon="fa-tasks"
                    onClick={onDashboardClick}
                  />
                )}
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
                {siteMenu?.[siteMenuKeys.siteConfig] && (
                  <Tile
                    title={formatMessage(messages.siteConfig)}
                    icon="fa-sliders"
                    link={getLink('siteConfig')}
                    onClick={onMenuClose}
                  />
                )}
                <Tile
                  title={formatMessage(messages.search)}
                  icon={SearchIcon}
                  link={getLink('search')}
                  disabled={!crafterSite}
                />
              </nav>
            </Grid>
          </Grid>
        ) : (
          <div className={classes.loadingContainer}>
            <LoadingState />
          </div>
        )
      }
    </Popover>
  );
}

function getLink(id: string) {
  const base = window.location.host.replace('3000', '8080');
  return `//${base}/studio${globalNavUrlMapping[id]}`;
}
