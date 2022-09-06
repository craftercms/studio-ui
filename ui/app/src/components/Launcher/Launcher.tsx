/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { Suspense, useEffect, useMemo } from 'react';
import { defineMessages, FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { makeStyles } from 'tss-react/mui';
import Popover from '@mui/material/Popover';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LauncherSiteCard, { LauncherSiteCardOption } from '../LauncherSiteCard/LauncherSiteCard';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Hidden from '@mui/material/Hidden';
import { useDispatch } from 'react-redux';
import { getInitials } from '../../utils/string';
import { changeSite } from '../../state/actions/sites';
import palette from '../../styles/palette';
import Avatar from '@mui/material/Avatar';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { Site } from '../../models/Site';
import EmptyState from '../EmptyState/EmptyState';
import { setSiteCookie } from '../../utils/auth';
import List from '@mui/material/List';
import CrafterCMSLogo from '../../icons/CrafterCMSLogo';
import { renderWidgets } from '../Widget';
import { logout } from '../../state/actions/auth';
import { ListItem, Tooltip } from '@mui/material';
import { closeLauncher } from '../../state/actions/dialogs';
import { EnhancedUser } from '../../models/User';
import LookupTable from '../../models/LookupTable';
import { batchActions } from '../../state/actions/misc';
import LauncherGlobalNav from '../LauncherGlobalNav';
import Skeleton from '@mui/material/Skeleton';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useEnv } from '../../hooks/useEnv';
import { useSystemVersion } from '../../hooks/useSystemVersion';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useSiteList } from '../../hooks/useSiteList';
import { useSiteUIConfig } from '../../hooks/useSiteUIConfig';
import { initLauncherConfig } from '../../state/actions/launcher';
import { getSystemLink, SystemLinkId } from '../../utils/system';
import { PREVIEW_URL_PATH } from '../../utils/constants';
import { WidgetDescriptor } from '../../models';
import useMinimizedDialogWarning from '../../hooks/useMinimizedDialogWarning';
import TranslationOrText from '../../models/TranslationOrText';
import { SystemIconDescriptor } from '../SystemIcon';

export interface LauncherStateProps {
  open: boolean;
  anchor: string;
  sitesRailPosition?: 'left' | 'right' | 'hidden';
  closeButtonPosition?: 'left' | 'right';
  widgets: WidgetDescriptor[];
  /**
   * Whether to render the global nav before or after
   * the additional widgets coming from configuration
   **/
  globalNavigationPosition?: 'before' | 'after';
  siteCardMenuLinks?: Array<{
    title: TranslationOrText;
    systemLinkId: SystemLinkId;
    icon?: SystemIconDescriptor;
    permittedRoles?: string[];
  }>;
}

const messages = defineMessages({
  mySites: {
    id: 'globalMenu.mySites',
    defaultMessage: 'My Projects'
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

const useLauncherStyles = makeStyles()((theme) => ({
  popover: {
    maxWidth: 1065,
    borderRadius: '10px',
    overflowY: 'hidden'
  },
  launcherSkeletonWrapper: {
    display: 'flex',
    '@media(min-width: 1097px)': {
      width: 1065
    }
  },
  appsSkeletonTile: {
    margin: 5,
    width: 120,
    height: 100,
    display: 'inline-flex'
  },
  sitesRail: {
    backgroundColor: theme.palette.mode === 'dark' ? palette.gray.dark1 : palette.gray.light1
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
    maxHeight: '100%',
    minWidth: 1065
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
}));

// region AppsRail

interface AppsRailProps {
  classes: LookupTable<string>;
  widgets: WidgetDescriptor[];
  formatMessage: IntlShape['formatMessage'];
  user: EnhancedUser;
  onLogout(): void;
  closeButtonPosition: LauncherStateProps['closeButtonPosition'];
  globalNavigationPosition: LauncherStateProps['globalNavigationPosition'];
  userRoles: string[];
  clsx: any;
  lonely: boolean;
}

const UserDisplaySection = ({ classes, formatMessage, user, onLogout }) => (
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
            <IconButton aria-label={formatMessage(messages.signOut)} onClick={onLogout} size="large">
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
);

const AppsRail = ({
  classes,
  widgets,
  formatMessage,
  user,
  onLogout,
  closeButtonPosition,
  userRoles,
  globalNavigationPosition,
  clsx,
  lonely
}: AppsRailProps) => (
  <Grid item xs={12} md={lonely ? 12 : 8} className={classes.appsRail}>
    <div className={clsx(classes.railTop, closeButtonPosition === 'left' && classes.railTopExtraPadded)}>
      {globalNavigationPosition === 'before' && <LauncherGlobalNav />}
      {renderWidgets(widgets, { userRoles })}
      {/* Using != 'before' (instead of == 'after') to avoid config hiding away the global nav */}
      {globalNavigationPosition !== 'before' && <LauncherGlobalNav />}
    </div>
    <UserDisplaySection classes={classes} formatMessage={formatMessage} onLogout={onLogout} user={user} />
  </Grid>
);

const AppsRailSkeleton = ({ classes, closeButtonPosition, formatMessage, onLogout, user, clsx }) => (
  <Grid item xs={12} md={8} className={classes.appsRail}>
    <div className={clsx(classes.railTop, closeButtonPosition === 'left' && classes.railTopExtraPadded)}>
      <Skeleton variant="text" width="150px" style={{ marginBottom: 20 }} />
      {new Array(9).fill(null).map((_, i) => (
        <Skeleton key={i} variant="rectangular" className={classes.appsSkeletonTile} />
      ))}
    </div>
    <UserDisplaySection classes={classes} formatMessage={formatMessage} onLogout={onLogout} user={user} />
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
            title={<FormattedMessage id="globalMenu.noSitesMessage" defaultMessage="No projects to display." />}
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

const SiteRailSkeleton = ({ classes, formatMessage, version }) => (
  <Grid item md={4} className={classes.sitesRail}>
    <div className={classes.railTop}>
      <Typography variant="subtitle1" component="h2" className={classes.mySitesTitle}>
        {formatMessage(messages.mySites)}
      </Typography>
      <List>
        {new Array(3).fill(null).map((_, i) => (
          <ListItem key={i}>
            <Skeleton variant="rectangular" width="300px" height="72px" />
          </ListItem>
        ))}
      </List>
    </div>
    <div className={classes.railBottom}>
      <CrafterCMSLogo width={115} />
      <Typography className={classes.versionText} color="textSecondary" variant="caption">
        {version}
      </Typography>
    </div>
  </Grid>
);

// endregion

export function Launcher(props: LauncherStateProps) {
  const { classes, cx } = useLauncherStyles();
  const siteId = useActiveSiteId();
  const sites = useSiteList();
  const user = useActiveUser();
  const dispatch = useDispatch();
  const version = useSystemVersion();
  const { formatMessage } = useIntl();
  const { authoringBase, useBaseDomain } = useEnv();
  const {
    open,
    anchor: anchorSelector,
    sitesRailPosition = 'left',
    closeButtonPosition = 'right',
    globalNavigationPosition = 'after',
    siteCardMenuLinks,
    widgets
  } = props;
  const uiConfig = useSiteUIConfig();
  const userRoles = user.rolesBySite[siteId];
  const anchor = useMemo(() => (anchorSelector ? document.querySelector(anchorSelector) : null), [anchorSelector]);
  const cardActions = useMemo<LauncherSiteCardOption[]>(
    () =>
      siteCardMenuLinks
        ? siteCardMenuLinks
            .filter(
              (widget) =>
                (widget.permittedRoles ?? []).length === 0 ||
                (userRoles ?? []).some((role) => widget.permittedRoles.includes(role))
            )
            .map((descriptor) => ({
              name: typeof descriptor.title === 'string' ? descriptor.title : formatMessage(descriptor.title),
              href: (site) =>
                getSystemLink({
                  systemLinkId: descriptor.systemLinkId,
                  authoringBase,
                  site
                }),
              onClick(site) {
                setSiteCookie(site, useBaseDomain);
              }
            }))
        : null,
    [siteCardMenuLinks, userRoles, formatMessage, authoringBase, useBaseDomain]
  );
  const checkMinimized = useMinimizedDialogWarning();

  useEffect(() => {
    if (uiConfig.xml) {
      dispatch(initLauncherConfig({ configXml: uiConfig.xml }));
    }
  }, [uiConfig.xml, dispatch]);

  const onSiteCardClick = (site: string) => {
    if (!checkMinimized()) {
      setSiteCookie(site, useBaseDomain);
      if (window.location.href.includes(PREVIEW_URL_PATH)) {
        // If user is in UI next and switching to a site that's viewed in 4.
        dispatch(batchActions([changeSite(site), closeLauncher()]));
      } else {
        window.location.href = getSystemLink({
          systemLinkId: 'preview',
          authoringBase,
          site
        });
      }
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
      clsx={cx}
      lonely={sitesRailPosition === 'hidden'}
    />
  );

  const sitesRailSkeleton = () => (
    <SiteRailSkeleton classes={classes} formatMessage={formatMessage} version={version} />
  );

  const appsRailSkeleton = () => (
    <AppsRailSkeleton
      classes={classes}
      formatMessage={formatMessage}
      closeButtonPosition={closeButtonPosition}
      onLogout={onLogout}
      user={user}
      clsx={cx}
    />
  );

  return (
    <Popover
      open={open && Boolean(anchor)}
      anchorEl={anchor}
      onClose={onMenuClose}
      classes={{ paper: classes.popover }}
      anchorOrigin={{
        vertical: 'top',
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
          className={cx(classes.closeButton, closeButtonPosition)}
          onClick={onMenuClose}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
      {/* endregion */}
      <Suspense
        fallback={
          <div className={classes.launcherSkeletonWrapper}>
            {sitesRailPosition === 'left' ? (
              <>
                {sitesRailSkeleton()}
                {appsRailSkeleton()}
              </>
            ) : sitesRailPosition === 'right' ? (
              <>
                {appsRailSkeleton()}
                {sitesRailSkeleton()}
              </>
            ) : (
              appsRailSkeleton()
            )}
          </div>
        }
      >
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
      </Suspense>
    </Popover>
  );
}

export default Launcher;
