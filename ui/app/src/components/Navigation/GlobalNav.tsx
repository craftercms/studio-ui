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

import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SiteCard from './SiteCard';
import CloseIcon from '@material-ui/icons/Close';
import { fetchGlobalMenuItems } from '../../services/configuration';
import About from '../Icons/About';
import Docs from '../Icons/Docs';
import IconButton from '@material-ui/core/IconButton';
import LoadingState from '../SystemStatus/LoadingState';
import Hidden from '@material-ui/core/Hidden';
import {
  useActiveSiteId,
  useActiveUser,
  useEnv,
  useMount,
  usePossibleTranslation,
  usePreviewState,
  useSelection,
  useSiteList,
  useSiteUIConfig,
  useSystemVersion
} from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { camelize, getInitials, getSimplifiedVersion, popPiece } from '../../utils/string';
import { changeSite, fetchSites } from '../../state/reducers/sites';
import palette from '../../styles/palette';
import Avatar from '@material-ui/core/Avatar';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import Card from '@material-ui/core/Card/Card';
import CardHeader from '@material-ui/core/CardHeader';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import { Site } from '../../models/Site';
import EmptyState from '../SystemStatus/EmptyState';
import { setSiteCookie } from '../../utils/auth';
import List from '@material-ui/core/List';
import CrafterCMSLogo from '../Icons/CrafterCMSLogo';
import ApiResponseErrorState from '../ApiResponseErrorState';
import DashboardIcon from '@material-ui/icons/DashboardRounded';
import SearchIcon from '@material-ui/icons/SearchRounded';
import BuildIcon from '@material-ui/icons/BuildRounded';
import PreviewIcon from '../Icons/Preview';
import { components } from '../../services/plugin';
import { renderWidgets } from '../Widget';
import { logout } from '../../state/actions/auth';
import { Tooltip } from '@material-ui/core';
import StandardAction from '../../models/StandardAction';
import ApiResponse from '../../models/ApiResponse';
import { closeGlobalNav } from '../../state/actions/dialogs';
import GlobalState from '../../models/GlobalState';
import { EnhancedUser } from '../../models/User';
import LookupTable from '../../models/LookupTable';
import { batchActions } from '../../state/actions/misc';
import GlobalNavTile from '../GlobalNavTile/GlobalNavTile';
import GlobalNavPublishingStatusTile from '../GlobalNavPublishingStatusTile';
import clsx from 'clsx';

export interface GlobalNavProps {
  anchor: Element;
  onMenuClose: (e: any) => void;
  sitesRailPosition?: 'left' | 'right' | 'hidden';
  closeButtonPosition?: 'left' | 'right';
}

export interface GlobalNavStateProps {
  open: boolean;
  anchor: string;
  onMenuClose: StandardAction;
  sitesRailPosition?: 'left' | 'right' | 'hidden';
  closeButtonPosition?: 'left' | 'right';
}

const messages = defineMessages({
  mySites: {
    id: 'globalMenu.mySites',
    defaultMessage: 'My Sites'
  },
  site: {
    id: 'words.site',
    defaultMessage: 'Site'
  },
  global: {
    id: 'words.global',
    defaultMessage: 'Global'
  },
  preview: {
    id: 'words.preview',
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
    id: 'GlobalMenu.EncryptionTool',
    defaultMessage: 'Encryption Tool'
  },
  tokenManagement: {
    id: 'GlobalMenu.TokenManagement',
    defaultMessage: 'Token Management'
  },
  dashboard: {
    id: 'words.dashboard',
    defaultMessage: 'Dashboard'
  },
  remove: {
    id: 'words.remove',
    defaultMessage: 'Remove'
  },
  ok: {
    id: 'words.ok',
    defaultMessage: 'Ok'
  },
  cancel: {
    id: 'words.cancel',
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
    id: 'globalNavOpenerButton.signOut',
    defaultMessage: 'Sign Out'
  },
  settings: {
    id: 'words.settings',
    defaultMessage: 'Settings'
  },
  closeMenu: {
    id: 'globalMenu.closeMenu',
    defaultMessage: 'Close menu'
  },
  logout: {
    id: 'words.logout',
    defaultMessage: 'Logout'
  }
});

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
  'home.globalMenu.tokenManagement': '#/globalMenu/token-management',
  'legacy.preview': '/preview/',
  preview: '/next/preview',
  about: '#/about-us',
  siteConfig: '/site-config',
  search: '/search',
  siteDashboard: '/site-dashboard',
  settings: '#/settings'
};

const useGlobalNavStyles = makeStyles((theme) =>
  createStyles({
    popover: {
      maxWidth: 1065,
      borderRadius: '10px'
    },
    sitesRail: {
      backgroundColor: theme.palette.type === 'dark' ? palette.gray.dark1 : palette.gray.light1
    },
    appsRail: {},
    railTop: {
      padding: '30px',
      overflow: 'auto',
      height: 'calc(100% - 65px)',
      maxHeight: 'calc(100vh - 95px)'
    },
    railTopExtraPadded: {
      paddingTop: 70
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
      fontWeight: 600,
      '& > span': {
        textTransform: 'none',
        marginLeft: '0.315em',
        color: theme.palette.text.secondary
      }
    },
    titleCard: {
      marginBottom: '20px'
    },
    navItemsWrapper: {
      display: 'flex',
      flexWrap: 'wrap'
    },
    errorPaperRoot: {
      height: '100%'
    },
    closeButton: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      '&.left': {
        right: 'auto',
        left: '10px'
      }
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

interface AppsRailProps {
  classes: LookupTable<string>;
  siteId: string;
  siteName: string;
  siteNav: GlobalState['uiConfig']['siteNav'];
  menuItems: Array<{ id: string; icon: string; label: string }>;
  formatMessage: IntlShape['formatMessage'];
  authoringBase: string;
  version: string;
  user: EnhancedUser;
  onMenuClose(): void;
  onLogout(): void;
  closeButtonPosition: GlobalNavStateProps['closeButtonPosition'];
}

const AppsRail = ({
  classes,
  siteId,
  siteName,
  siteNav,
  menuItems,
  formatMessage,
  onMenuClose,
  authoringBase,
  version,
  user,
  onLogout,
  closeButtonPosition
}: AppsRailProps) => (
  <Grid item xs={12} md={8} className={classes.appsRail}>
    <div className={clsx(classes.railTop, closeButtonPosition === 'left' && classes.railTopExtraPadded)}>
      {/* region Site Navigation */}
      {siteId && siteNav && (
        <>
          {siteNav.title && (
            <Typography variant="subtitle1" component="h2" className={classes.title} style={{ margin: '0 0 10px 0' }}>
              {siteNav.title
                ? typeof siteNav.title === 'string'
                  ? siteNav.title
                  : formatMessage(siteNav.title)
                : formatMessage(messages.site)}
              <span>• {siteName || siteId}</span>
            </Typography>
          )}
          <nav className={classes.navItemsWrapper}>{renderWidgets(siteNav.widgets, user.rolesBySite[siteId])}</nav>
        </>
      )}
      {/* endregion */}
      {/* region Global Navigation */}
      <Typography variant="subtitle1" component="h2" className={classes.title} style={{ margin: '0 0 10px 0' }}>
        {formatMessage(messages.global)}
      </Typography>
      <nav className={classes.navItemsWrapper}>
        {menuItems.map((item) => (
          <GlobalNavTile
            key={item.id}
            title={formatMessage(messages[popPiece(camelize(item.id))])}
            icon={{ baseClass: `fa ${item.icon}` }}
            link={getLink(item.id, authoringBase)}
            onClick={onMenuClose}
          />
        ))}
        <GlobalNavTile
          title={formatMessage(messages.docs)}
          icon={{ id: 'craftercms.icons.Docs' }}
          link={`https://docs.craftercms.org/en/${getSimplifiedVersion(version)}/index.html`}
          target="_blank"
        />
        <GlobalNavTile
          title={formatMessage(messages.settings)}
          icon={{ id: '@material-ui/icons/SettingsRounded' }}
          link={getLink('settings', authoringBase)}
        />
        <GlobalNavTile
          icon={{ id: 'craftercms.icons.CrafterIcon' }}
          link={getLink('about', authoringBase)}
          title={formatMessage(messages.about)}
        />
      </nav>
      {/* endregion */}
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
            <Tooltip title={formatMessage(messages.logout)}>
              <IconButton aria-label={formatMessage(messages.signOut)} onClick={onLogout}>
                <ExitToAppRoundedIcon />
              </IconButton>
            </Tooltip>
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
);

interface SitesRailProps {
  classes: LookupTable<string>;
  formatMessage: IntlShape['formatMessage'];
  sites: Site[];
  site: string;
  version: string;
  cardActions: Array<{
    name: string;
    href: string | ((id: string) => string);
    onClick(site): void;
  }>;
  onSiteCardClick(id: string): void;
}

const SitesRail = ({ classes, formatMessage, sites, site, onSiteCardClick, cardActions, version }: SitesRailProps) => (
  <Hidden only={['xs', 'sm']}>
    <Grid item md={4} className={classes.sitesRail}>
      <div className={classes.railTop}>
        <Typography variant="subtitle1" component="h2" className={classes.title} style={{ marginBottom: '24px' }}>
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
);

export default function GlobalNav() {
  const classes = useGlobalNavStyles();
  const siteId = useActiveSiteId();
  const sites = useSiteList();
  const user = useActiveUser();
  const dispatch = useDispatch();
  const version = useSystemVersion();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const { previewChoice } = usePreviewState();
  const { open, anchor: anchorSelector, sitesRailPosition = 'left', closeButtonPosition = 'right' } = useSelection(
    (state) => state.dialogs.globalNav
  );
  const { siteNav } = useSiteUIConfig();
  const [menuItems, setMenuItems] = useState(null);
  const [error, setError] = useState<ApiResponse>(null);
  const anchor = useMemo(() => (anchorSelector ? document.querySelector(anchorSelector) : null), [anchorSelector]);
  const siteName = useMemo(() => {
    const site = sites.find((model) => model.id === siteId);
    return site ? site.name || site.id : siteId;
  }, [sites, siteId]);

  const cardActions = useMemo<
    Array<{
      name: string;
      href: string | ((id: string) => string);
      onClick(site): void;
    }>
  >(
    () => [
      {
        name: formatMessage(messages.dashboard),
        href: getLink('siteDashboard', authoringBase),
        onClick(site) {
          setSiteCookie(site);
        }
      },
      {
        name: formatMessage(messages.preview),
        href(site) {
          return `${getLink(
            previewChoice[site] === '2' ? 'preview' : 'legacy.preview',
            authoringBase
          )}#/?page=/&site=${site}`;
        },
        onClick(site) {
          setSiteCookie(site);
        }
      },
      {
        name: formatMessage(messages.search),
        href: getLink('search', authoringBase),
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
    [formatMessage, authoringBase, previewChoice]
  );

  const onErrorStateBackClicked = () => setError(error);

  const onSiteCardClick = (site: string) => {
    if (window.location.href.includes('/preview') || window.location.href.includes('#/globalMenu')) {
      if (previewChoice[site] === '2' && window.location.href.includes('/next/preview')) {
        // If site we're switching to is next compatible, there's no need for any sort of page postback.
        dispatch(batchActions([changeSite(site), closeGlobalNav()]));
      } else {
        setSiteCookie(site);
        setTimeout(() => {
          window.location.href = `${
            previewChoice[site] === '2' ? `${authoringBase}/next/preview` : `${authoringBase}/preview`
          }#/?page=/&site=${site}`;
        });
      }
    } else {
      setSiteCookie(site);
      setTimeout(() => {
        window.location.reload();
      });
    }
  };

  const onMenuClose = () => dispatch(closeGlobalNav());

  const onLogout = () => dispatch(logout());

  const sitesRail = () => (
    <SitesRail
      classes={classes}
      formatMessage={formatMessage}
      sites={sites}
      site={siteId}
      version={version}
      cardActions={cardActions}
      onSiteCardClick={onSiteCardClick}
    />
  );

  const appsRail = () => (
    <AppsRail
      classes={classes}
      siteId={siteId}
      siteName={siteName}
      siteNav={siteNav}
      menuItems={menuItems}
      formatMessage={formatMessage}
      authoringBase={authoringBase}
      version={version}
      user={user}
      onMenuClose={onMenuClose}
      onLogout={onLogout}
      closeButtonPosition={closeButtonPosition}
    />
  );

  useMount(() => {
    if (sites === null) {
      dispatch(fetchSites());
    }
    fetchGlobalMenuItems().subscribe(setMenuItems, (error) => {
      if (error.response) {
        setError({
          ...error.response,
          code: '',
          documentationUrl: '',
          remedialAction: ''
        });
      }
    });
  });

  return (
    <Popover
      open={open && Boolean(anchor)}
      anchorEl={anchor}
      onClose={onMenuClose}
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
      {/* Close button (x) */}
      <Tooltip title={formatMessage(messages.closeMenu)}>
        <IconButton
          aria-label={formatMessage(messages.closeMenu)}
          className={clsx(classes.closeButton, closeButtonPosition)}
          onClick={onMenuClose}
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
      {error ? (
        <ApiResponseErrorState
          classes={{ root: classes.errorPaperRoot }}
          error={error}
          onButtonClick={onErrorStateBackClicked}
        />
      ) : menuItems !== null ? (
        <Grid container spacing={0} className={classes.gridContainer}>
          {sitesRailPosition === 'left' ? (
            <>
              {sitesRail()}
              {appsRail()}
            </>
          ) : sitesRailPosition === 'right' ? (
            <>
              {appsRail()}
              {sitesRail()}
            </>
          ) : (
            sitesRail()
          )}
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

const GlobalNavLinkTile = ({ title, icon, systemLinkId, link }) => {
  const { authoringBase } = useEnv();
  const { previewChoice } = usePreviewState();
  const site = useActiveSiteId();
  return (
    <GlobalNavTile
      icon={icon}
      title={usePossibleTranslation(title)}
      link={
        link ??
        (systemLinkId === 'preview'
          ? // Preview is a special "dynamic case"
            previewChoice[site] === '2'
            ? `${authoringBase}/next/preview#/?page=/&site=${site}`
            : `${authoringBase}/preview#/?page=/&site=${site}`
          : {
              siteTools: `${authoringBase}/site-config`,
              siteSearch: `${authoringBase}/search`,
              siteDashboard: `${authoringBase}/site-dashboard`
            }[systemLinkId])
      }
    />
  );
};

Object.entries({
  'craftercms.components.GlobalNavLinkTile': GlobalNavLinkTile,
  'craftercms.components.GlobalNavPublishingStatusTile': GlobalNavPublishingStatusTile,
  'craftercms.icons.Preview': PreviewIcon,
  'craftercms.icons.CrafterIcon': About,
  'craftercms.icons.Docs': Docs,
  '@material-ui/icons/DashboardRounded': DashboardIcon,
  '@material-ui/icons/SearchRounded': SearchIcon,
  '@material-ui/icons/BuildRounded': BuildIcon,
  '@material-ui/icons/SettingsRounded': SettingsRoundedIcon
}).forEach(([id, component]) => {
  components.set(id, component);
});
