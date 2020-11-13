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

import React, { ElementType, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SiteCard from './SiteCard';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { getGlobalMenuItems } from '../../services/configuration';
import ErrorState from '../SystemStatus/ErrorState';
import Preview from '../Icons/Preview';
import About from '../Icons/About';
import Docs from '../Icons/Docs';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import LoadingState from '../SystemStatus/LoadingState';
import Hidden from '@material-ui/core/Hidden';
import { useMount } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { camelize, getInitials, getSimplifiedVersion, popPiece } from '../../utils/string';
import { changeSite } from '../../state/reducers/sites';
import palette from '../../styles/palette';
import { logout } from '../../services/auth';
import Cookies from 'js-cookie';
import Avatar from '@material-ui/core/Avatar';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import Card from '@material-ui/core/Card/Card';
import CardHeader from '@material-ui/core/CardHeader';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import { Site } from '../../models/Site';
import { User } from '../../models/User';
import EmptyState from '../SystemStatus/EmptyState';
import { getStoredPreviewChoice } from '../../utils/state';
import { setSiteCookie } from '../../utils/auth';
import List from '@material-ui/core/List';
import CrafterCMSLogo from '../Icons/CrafterCMSLogo';

const tileStyles = makeStyles((theme) =>
  createStyles({
    tile: {
      width: '120px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
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
    iconAvatar: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.secondary
    },
    icon: {
      fontSize: '35px !important'
    }
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
    defaultMessage: 'Preview'
  },
  preview2: {
    id: 'globalMenu.preview2',
    defaultMessage: 'Preview 2.0'
  },
  preview1: {
    id: 'globalMenu.preview1',
    defaultMessage: 'Preview 1.0'
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
  },
  signOut: {
    id: 'toolbarGlobalNav.signOut',
    defaultMessage: 'Sign Out'
  },
  settings: {
    id: 'toolbarGlobalNav.settings',
    defaultMessage: 'Settings'
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
      <Avatar variant="rounded" className={classes.iconAvatar}>
        {typeof Icon === 'string' ? (
          <i className={clsx(classes.icon, 'fa', Icon)} />
        ) : (
          <Icon className={classes.icon} />
        )}
      </Avatar>
      <Typography color="textPrimary">{title}</Typography>
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
  'legacy.preview': '/preview/',
  preview: '/next/preview',
  about: '#/about-us',
  siteConfig: '/site-config',
  search: '/search',
  siteDashboard: '/site-dashboard',
  settings: '#/settings'
};

const globalNavStyles = makeStyles((theme) =>
  createStyles({
    popover: {
      maxWidth: 990,
      height: '100%',
      borderRadius: '10px'
    },
    leftRail: {
      height: '100%',
      backgroundColor: theme.palette.type === 'dark' ? palette.gray.dark1 : palette.gray.light1
    },
    rightRail: {
      height: '100%'
    },
    railTop: {
      padding: '30px',
      overflow: 'auto',
      height: 'calc(100% - 65px)'
    },
    railBottom: {
      height: 65,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      placeContent: 'center space-between'
    },
    gridContainer: {
      height: '100%',
      maxHeight: '100%'
    },
    versionText: {},
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
    },
    userCardRoot: {
      width: '100%',
      boxShadow: 'none'
    },
    userCardHeader: {
      padding: 0
    },
    userCardActions: {
      marginTop: 0,
      marginRight: 0
    },
    userCardAvatar: {
      color: palette.white,
      textTransform: 'uppercase',
      backgroundColor: palette.red.main
    },
    username: {
      maxWidth: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  })
);

interface GlobalNavProps {
  user: User;
  site: string;
  sites: Site[];
  anchor: Element;
  version: string;
  logoutUrl: string;
  authoringUrl: string;
  onMenuClose: (e: any) => void;
}

const LinkWithIcon = (props) => {
  const { label, icon, link, target } = props;
  return <Tile title={label} icon={icon} link={link} target={target} />;
};

export default function GlobalNav(props: GlobalNavProps) {
  const { anchor, onMenuClose, logoutUrl, authoringUrl, version, site, sites, user } = props;
  const classes = globalNavStyles();
  const [menuItems, setMenuItems] = useState(null);
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const cardActions = useMemo(
    () => [
      {
        name: formatMessage(messages.dashboard),
        href: getLink('siteDashboard', authoringUrl),
        onClick(site) {
          setSiteCookie(site);
        }
      },
      {
        name: formatMessage(messages.preview),
        href(site) {
          return getLink(getStoredPreviewChoice(site) === '1' ? 'legacy.preview' : 'preview', authoringUrl);
        },
        onClick(site) {
          setSiteCookie(site);
        }
      }
      // TODO: Since these should be per-site and constraint by role, we need to figure what to do with them.
      // {
      //   name: formatMessage(messages.siteConfig),
      //   href: getLink('siteConfig', authoringUrl),
      //   onClick(site) {
      //     setSiteCookie(site);
      //   }
      // }
    ],
    // Disable exhaustive hooks check since only need to create on mount
    // eslint-disable-next-line
    []
  );

  const handleErrorBack = () => setApiState({ ...apiState, error: false });

  const onSiteCardClick = (id: string) => {
    dispatch(changeSite(id));
    if (window.location.href.includes('/preview') || window.location.href.includes('#/globalMenu')) {
      navigateTo(getStoredPreviewChoice(id) === '2' ? `${authoringUrl}/next/preview` : `${authoringUrl}/preview`);
    } else {
      setTimeout(() => {
        window.location.reload();
      });
    }
  };

  useMount(() => {
    getGlobalMenuItems().subscribe(
      ({ response }) => {
        setMenuItems(response.menuItems);
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
  });

  return (
    <Popover
      open={Boolean(anchor)}
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
      {apiState.error ? (
        <ErrorState
          classes={{ root: classes.errorPaperRoot }}
          error={apiState.errorResponse}
          onBack={handleErrorBack}
        />
      ) : menuItems !== null ? (
        <Grid container spacing={0} className={classes.gridContainer}>
          <Hidden only={['xs', 'sm']}>
            <Grid item md={4} className={classes.leftRail}>
              <div className={classes.railTop}>
                <Typography
                  variant="subtitle1"
                  component="h2"
                  className={classes.title}
                  style={{ marginBottom: '24px' }}
                >
                  {formatMessage(messages.mySites)}
                </Typography>
                {sites.length ? (
                  <List>
                    {sites.map((item, i) => (
                      <SiteCard
                        key={i}
                        options
                        selected={item.id === site}
                        title={item.name}
                        value={item.id}
                        classes={{ root: classes.titleCard }}
                        onCardClick={() => onSiteCardClick(item.id)}
                        cardActions={cardActions}
                      />
                    ))}
                  </List>
                ) : (
                  <EmptyState
                    title={<FormattedMessage id="globalMenu.noSitesMessage" defaultMessage="No sites to display." />}
                  />
                )}
              </div>
              <div className={classes.railBottom}>
                <CrafterCMSLogo width={115} />
                <Typography className={classes.versionText} color="textSecondary" variant="caption">
                  {version}
                </Typography>
              </div>
            </Grid>
          </Hidden>
          <Grid item xs={12} md={8} className={classes.rightRail}>
            <IconButton aria-label="close" className={classes.closeButton} onClick={(event) => onMenuClose(event)}>
              <CloseIcon />
            </IconButton>
            <div className={classes.railTop}>
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
                    link={getLink(item.id, authoringUrl)}
                    onClick={onMenuClose}
                  />
                ))}
                {/* prettier-ignore */}
                <Tile
                  title={formatMessage(messages.docs)}
                  icon={Docs}
                  link={`https://docs.craftercms.org/en/${getSimplifiedVersion(version)}/index.html`}
                  target="_blank"
                />
                <Tile
                  title={formatMessage(messages.settings)}
                  icon={SettingsRoundedIcon}
                  link={getLink('settings', authoringUrl)}
                  disabled={!site}
                />
                <Tile icon={About} link={getLink('about', authoringUrl)} title={formatMessage(messages.about)} />
              </nav>
            </div>
            <div className={classes.railBottom}>
              <Card className={classes.userCardRoot}>
                <CardHeader
                  classes={{
                    action: classes.userCardActions
                  }}
                  className={classes.userCardHeader}
                  avatar={
                    <Avatar
                      aria-hidden="true"
                      className={classes.userCardAvatar}
                      children={getInitials(`${user.firstName} ${user.lastName}`)}
                    />
                  }
                  action={
                    logoutUrl && (
                      <IconButton aria-label={formatMessage(messages.signOut)} onClick={() => onLogout(logoutUrl)}>
                        <ExitToAppRoundedIcon />
                      </IconButton>
                    )
                  }
                  title={`${user.firstName} ${user.lastName}`}
                  subheader={user.username || user.email}
                  subheaderTypographyProps={{
                    className: classes.username
                  }}
                />
              </Card>
            </div>
          </Grid>
        </Grid>
      ) : (
        <div className={classes.loadingContainer}>
          <LoadingState />
        </div>
      )}
    </Popover>
  );
}

function getLink(id: string, authoringBase: string = `${getBase()}/studio`) {
  return `${authoringBase}${globalNavUrlMapping[id]}`;
}

function getBase() {
  return window.location.host.replace('3000', '8080');
}

function navigateTo(link: string): void {
  window.location.href = link;
}

function onLogout(url) {
  logout().subscribe(() => {
    Cookies.set('userSession', null);
    window.location.href = url;
  });
}
