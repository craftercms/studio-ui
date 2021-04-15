/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LauncherSiteCard, { LauncherSiteCardOption } from '../LauncherSiteCard/LauncherSiteCard';
import CloseIcon from '@material-ui/icons/Close';
import About from '../Icons/About';
import Docs from '../Icons/Docs';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import {
  useActiveSiteId,
  useActiveUser,
  useEnv,
  usePreviewState,
  useSiteList,
  useSiteUIConfig,
  useSystemVersion
} from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { getInitials } from '../../utils/string';
import { changeSite } from '../../state/reducers/sites';
import palette from '../../styles/palette';
import Avatar from '@material-ui/core/Avatar';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import Card from '@material-ui/core/Card/Card';
import CardHeader from '@material-ui/core/CardHeader';
import AccountCircleRounded from '@material-ui/icons/AccountCircleRounded';
import { Site } from '../../models/Site';
import EmptyState from '../SystemStatus/EmptyState';
import { setSiteCookie } from '../../utils/auth';
import List from '@material-ui/core/List';
import CrafterCMSLogo from '../Icons/CrafterCMSLogo';
import DashboardIcon from '@material-ui/icons/DashboardRounded';
import SearchIcon from '@material-ui/icons/SearchRounded';
import BuildIcon from '@material-ui/icons/BuildRounded';
import PreviewIcon from '../Icons/Preview';
import { components } from '../../services/plugin';
import { renderWidgets, WidgetDescriptor } from '../Widget';
import { logout } from '../../state/actions/auth';
import { Tooltip } from '@material-ui/core';
import { closeLauncher } from '../../state/actions/dialogs';
import { EnhancedUser } from '../../models/User';
import LookupTable from '../../models/LookupTable';
import { batchActions } from '../../state/actions/misc';
import LauncherPublishingStatusTile from '../LauncherPublishingStatusTile';
import clsx from 'clsx';
import LauncherLinkTile from '../LauncherLinkTile';
import LauncherSection, { getSystemLink } from '../LauncherSection';
import LauncherGlobalNav from '../LauncherGlobalNav';
import GlobalState from '../../models/GlobalState';
import SitesRounded from '../Icons/SitesRounded';
import PeopleRounded from '@material-ui/icons/PeopleRounded';
import SupervisedUserCircleRounded from '@material-ui/icons/SupervisedUserCircleRounded';
import StorageRounded from '@material-ui/icons/StorageRounded';
import SubjectRounded from '@material-ui/icons/SubjectRounded';
import SettingsApplicationsRounded from '@material-ui/icons/SettingsApplicationsRounded';
import FormatAlignCenterRounded from '@material-ui/icons/FormatAlignCenterRounded';
import LockRounded from '@material-ui/icons/LockRounded';
import PublicRounded from '@material-ui/icons/PublicRounded';
import VpnKeyRounded from '@material-ui/icons/VpnKeyRounded';

import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import VideocamOutlinedIcon from '@material-ui/icons/VideocamOutlined';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import ExtensionOutlinedIcon from '@material-ui/icons/ExtensionOutlined';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';

export interface LauncherProps {
  open: boolean;
  anchor: Element;
  sitesRailPosition?: 'left' | 'right' | 'hidden';
  closeButtonPosition?: 'left' | 'right';
}

export interface LauncherStateProps {
  open: boolean;
  anchor: string;
  sitesRailPosition?: 'left' | 'right' | 'hidden';
  closeButtonPosition?: 'left' | 'right';
  // Keeping prop @ GlobalState['uiConfig']['launcher']['globalNavigationPosition']
  // globalNavigationPosition?: 'before' | 'after';
}

const messages = defineMessages({
  mySites: {
    id: 'globalMenu.mySites',
    defaultMessage: 'My Sites'
  },
  preview: {
    id: 'words.preview',
    defaultMessage: 'Preview'
  },
  search: {
    id: 'words.search',
    defaultMessage: 'Search'
  },
  signOut: {
    id: 'launcherOpenerButton.signOut',
    defaultMessage: 'Sign Out'
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

const useLauncherStyles = makeStyles((theme) =>
  createStyles({
    popover: {
      maxWidth: 1065,
      borderRadius: '10px',
      overflowY: 'hidden'
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
    titleCard: {
      marginBottom: '20px'
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
    },
    mySitesTitle: { marginBottom: '24px', textTransform: 'uppercase', fontWeight: 600 }
  })
);

// region AppsRail

interface AppsRailProps {
  classes: LookupTable<string>;
  widgets: WidgetDescriptor[];
  formatMessage: IntlShape['formatMessage'];
  user: EnhancedUser;
  onLogout(): void;
  closeButtonPosition: LauncherStateProps['closeButtonPosition'];
  globalNavigationPosition: GlobalState['uiConfig']['launcher']['globalNavigationPosition'];
  userRoles: string[];
}

const AppsRail = ({
  classes,
  widgets,
  formatMessage,
  user,
  onLogout,
  closeButtonPosition,
  userRoles,
  globalNavigationPosition
}: AppsRailProps) => (
  <Grid item xs={12} md={8} className={classes.appsRail}>
    <div className={clsx(classes.railTop, closeButtonPosition === 'left' && classes.railTopExtraPadded)}>
      {globalNavigationPosition === 'before' && <LauncherGlobalNav />}
      {renderWidgets(widgets, userRoles)}
      {/* Using != 'before' (instead of == 'after') to avoid config hiding away the global nav */}
      {globalNavigationPosition !== 'before' && <LauncherGlobalNav />}
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

// endregion

// region SiteRail

interface SitesRailProps {
  classes: LookupTable<string>;
  formatMessage: IntlShape['formatMessage'];
  sites: Site[];
  site: string;
  version: string;
  options: Array<LauncherSiteCardOption>;
  onSiteCardClick(id: string): void;
}

const SitesRail = ({ classes, formatMessage, sites, site, onSiteCardClick, options, version }: SitesRailProps) => (
  <Hidden only={['xs', 'sm']}>
    <Grid item md={4} className={classes.sitesRail}>
      <div className={classes.railTop}>
        <Typography variant="subtitle1" component="h2" className={classes.mySitesTitle}>
          {formatMessage(messages.mySites)}
        </Typography>
        {sites.length ? (
          <List>
            {sites.map((item, i) => (
              <LauncherSiteCard
                key={i}
                selected={item.id === site}
                title={item.name}
                value={item.id}
                classes={{ root: classes.titleCard }}
                onCardClick={() => onSiteCardClick(item.id)}
                options={options}
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

// endregion

export default function Launcher(props: LauncherStateProps) {
  const classes = useLauncherStyles();
  const siteId = useActiveSiteId();
  const sites = useSiteList();
  const user = useActiveUser();
  const dispatch = useDispatch();
  const version = useSystemVersion();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const { previewChoice } = usePreviewState();
  const { open, anchor: anchorSelector, sitesRailPosition = 'left', closeButtonPosition = 'right' } = props;
  const { launcher } = useSiteUIConfig();
  const siteCardMenuLinks = launcher?.siteCardMenuLinks;
  const widgets = launcher?.widgets;
  const globalNavigationPosition = launcher?.globalNavigationPosition ?? 'after';
  const userRoles = user.rolesBySite[siteId];
  const anchor = useMemo(() => (anchorSelector ? document.querySelector(anchorSelector) : null), [anchorSelector]);
  const cardActions = useMemo<LauncherSiteCardOption[]>(
    () =>
      siteCardMenuLinks
        ? siteCardMenuLinks
            .filter(
              (widget) =>
                (widget.roles ?? []).length === 0 || (userRoles ?? []).some((role) => widget.roles.includes(role))
            )
            .map((descriptor) => ({
              name: typeof descriptor.title === 'string' ? descriptor.title : formatMessage(descriptor.title),
              href: (site) =>
                getSystemLink({
                  systemLinkId: descriptor.systemLinkId,
                  authoringBase,
                  previewChoice,
                  site
                }),
              onClick(site) {
                setSiteCookie(site);
              }
            }))
        : null,
    [siteCardMenuLinks, userRoles, formatMessage, authoringBase, previewChoice]
  );

  const onSiteCardClick = (site: string) => {
    if (window.location.href.includes('/preview') || window.location.href.includes('#/globalMenu')) {
      if (previewChoice[site] === '2' && window.location.href.includes('/next/preview')) {
        // If site we're switching to is next compatible, there's no need for any sort of page postback.
        dispatch(batchActions([changeSite(site), closeLauncher()]));
      } else {
        setSiteCookie(site);
        setTimeout(() => {
          const link = getSystemLink({
            systemLinkId: 'preview',
            previewChoice,
            authoringBase,
            site
          });
          // If we're in legacy preview already (i.e. switching from a legacy-preview site to another legacy-preview
          // site) only the hash will change and the page won't reload or do anything perceivable since legacy isn't
          // fully integrated with the URL. In these cases, we need to programmatically reload.
          const shouldReload =
            // Currently in legacy...
            window.location.pathname === `${authoringBase.replace(window.location.origin, '')}/preview` &&
            // ...and not going to next
            !link.includes('next/preview');
          window.location.href = link;
          shouldReload && window.location.reload();
        });
      }
    } else {
      setSiteCookie(site);
      setTimeout(() => {
        window.location.reload();
      });
    }
  };

  const onMenuClose = () => dispatch(closeLauncher());

  const onLogout = () => dispatch(logout());

  const sitesRail = () => (
    <SitesRail
      classes={classes}
      formatMessage={formatMessage}
      sites={sites}
      site={siteId}
      version={version}
      options={cardActions}
      onSiteCardClick={onSiteCardClick}
    />
  );

  const appsRail = () => (
    <AppsRail
      classes={classes}
      widgets={widgets}
      formatMessage={formatMessage}
      user={user}
      onLogout={onLogout}
      closeButtonPosition={closeButtonPosition}
      userRoles={userRoles}
      globalNavigationPosition={globalNavigationPosition}
    />
  );

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
      {/* region Close button (x) */}
      <Tooltip title={formatMessage(messages.closeMenu)}>
        <IconButton
          aria-label={formatMessage(messages.closeMenu)}
          className={clsx(classes.closeButton, closeButtonPosition)}
          onClick={onMenuClose}
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
      {/* endregiong */}
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
          appsRail()
        )}
      </Grid>
    </Popover>
  );
}

Object.entries({
  'craftercms.components.LauncherLinkTile': LauncherLinkTile,
  'craftercms.components.LauncherPublishingStatusTile': LauncherPublishingStatusTile,
  'craftercms.components.LauncherSection': LauncherSection,
  'craftercms.components.LauncherGlobalNav': LauncherGlobalNav,
  'craftercms.icons.Preview': PreviewIcon,
  'craftercms.icons.CrafterIcon': About,
  'craftercms.icons.Docs': Docs,
  'craftercms.icons.Sites': SitesRounded,
  '@material-ui/icons/DashboardRounded': DashboardIcon,
  '@material-ui/icons/SearchRounded': SearchIcon,
  '@material-ui/icons/BuildRounded': BuildIcon,
  '@material-ui/icons/AccountCircleRounded': AccountCircleRounded,
  '@material-ui/icons/PeopleRounded': PeopleRounded,
  '@material-ui/icons/SupervisedUserCircleRounded': SupervisedUserCircleRounded,
  '@material-ui/icons/StorageRounded': StorageRounded,
  '@material-ui/icons/SubjectRounded': SubjectRounded,
  '@material-ui/icons/SettingsApplicationsRounded': SettingsApplicationsRounded,
  '@material-ui/icons/FormatAlignCenterRounded': FormatAlignCenterRounded,
  '@material-ui/icons/LockRounded': LockRounded,
  '@material-ui/icons/VpnKeyRounded': VpnKeyRounded,
  '@material-ui/icons/PublicRounded': PublicRounded,
  '@material-ui/icons/InsertDriveFileOutlined': InsertDriveFileOutlinedIcon,
  '@material-ui/icons/VideocamOutlined': VideocamOutlinedIcon,
  '@material-ui/icons/CodeRounded': CodeRoundedIcon,
  '@material-ui/icons/ExtensionOutlined': ExtensionOutlinedIcon,
  '@material-ui/icons/LocalOfferOutlined': LocalOfferOutlinedIcon
}).forEach(([id, component]) => {
  components.set(id, component);
});
