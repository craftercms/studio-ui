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

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import React, { useState, lazy, Suspense, useEffect, useMemo } from 'react';
import LauncherGlobalNav from '../LauncherGlobalNav';
import ResizeableDrawer from '../ResizeableDrawer/ResizeableDrawer';
import { useStyles } from './styles';
import {
  createHashRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
  useLocation,
  Outlet
} from 'react-router-dom';
import SiteManagement from '../SiteManagement';
import { getLauncherSectionLink, urlMapping } from '../LauncherSection/utils';
import EmptyState from '../EmptyState/EmptyState';
import { FormattedMessage, useIntl } from 'react-intl';
import { useGlobalAppState } from './GlobalAppContext';
import Typography from '@mui/material/Typography';
import CrafterCMSLogo from '../../icons/CrafterCMSLogo';
import LoadingState from '../LoadingState/LoadingState';
import LauncherOpenerButton from '../LauncherOpenerButton';
import { useGlobalNavigation } from '../../hooks/useGlobalNavigation';
import GlobalAppToolbar from '../GlobalAppToolbar';
import Skeleton from '@mui/material/Skeleton';
import { globalMenuMessages } from '../../env/i18n-legacy';
import { GlobalRoutes } from '../../env/routes';

const routeWrapper = (module) => {
  module.Component = module.default;
  return module;
};

// Site management loaded normally above as it is usually where people first land.
const UserManagement = lazy(() => import('../UserManagement'));
const GroupManagement = () => import('../GroupManagement/GroupManagement').then(routeWrapper);
const AuditManagement = () => import('../AuditManagement').then(routeWrapper);
const LogLevelManagement = () => import('../LogLevelManagement').then(routeWrapper);
const LogConsole = () => import('../LogConsole').then(routeWrapper);
const GlobalConfigManagement = () => import('../GlobalConfigManagement').then(routeWrapper);
const EncryptTool = () => import('../EncryptTool').then(routeWrapper);
const TokenManagement = () => import('../TokenManagement').then(routeWrapper);
const AboutCrafterCMSView = () => import('../AboutCrafterCMSView').then(routeWrapper);
const AccountManagement = lazy(() => import('../AccountManagement'));

interface GlobalAppProps {
  passwordRequirementsMinComplexity: number;
  footerHtml: string;
}

export function GlobalApp(props: GlobalAppProps) {
  const { passwordRequirementsMinComplexity } = props;
  const globalNavigation = useGlobalNavigation();

  const router = createHashRouter(
    createRoutesFromElements(
      <Route path="/" element={<GlobalAppInternal {...props} />}>
        <Route path={GlobalRoutes.Projects} element={<SiteManagement />} />
        {/* Leaving this route for backwards compatibility. Main route is now 'projects' */}
        <Route path="/sites" element={<SiteManagement />} />
        <Route
          path={GlobalRoutes.Users}
          element={<UserManagement passwordRequirementsMinComplexity={passwordRequirementsMinComplexity} />}
        />
        <Route path={GlobalRoutes.Groups} lazy={GroupManagement} />
        <Route path={GlobalRoutes.Audit} lazy={AuditManagement} />
        <Route path={GlobalRoutes.LogLevel} lazy={LogLevelManagement} />
        <Route path={GlobalRoutes.LogConsole} lazy={LogConsole} />
        <Route path={GlobalRoutes.GlobalConfig} lazy={GlobalConfigManagement} />
        <Route path={GlobalRoutes.EncryptTool} lazy={EncryptTool} />
        <Route path={GlobalRoutes.TokenManagement} lazy={TokenManagement} />
        <Route path={GlobalRoutes.About} lazy={AboutCrafterCMSView} />
        <Route
          path={GlobalRoutes.Settings}
          element={<AccountManagement passwordRequirementsMinComplexity={passwordRequirementsMinComplexity} />}
        />
        <Route
          path="/"
          element={
            globalNavigation.items ? (
              <Navigate to={`${urlMapping[globalNavigation.items[0].id].replace('#', '')}`} />
            ) : (
              <LoadingState
                styles={{
                  root: {
                    height: '100%',
                    margin: 0
                  }
                }}
              />
            )
          }
        />
        <Route path="*" element={<RouteNotFound />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

function RouteNotFound() {
  const { pathname } = useLocation();
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box component="section" sx={{ margin: '10px 12px 0 auto' }}>
        <LauncherOpenerButton />
      </Box>
      <EmptyState
        styles={{
          root: {
            height: '100%',
            margin: 0
          }
        }}
        title="404"
        subtitle={
          <FormattedMessage
            id={'globalApp.routeNotFound'}
            defaultMessage={'Route "{pathname}" not found'}
            values={{ pathname }}
          />
        }
      />
    </Box>
  );
}

export function GlobalAppInternal(props: GlobalAppProps) {
  const { classes } = useStyles();
  const { footerHtml } = props;
  const [width, setWidth] = useState(240);
  const [{ openSidebar }] = useGlobalAppState();
  const { items } = useGlobalNavigation();
  const { formatMessage } = useIntl();
  const location = useLocation();
  const idByPathLookup = useMemo(
    () =>
      items?.reduce((lookup, item) => {
        lookup[getLauncherSectionLink(item.id, '').replace(/^#/, '')] = item.id;
        return lookup;
      }, {}),
    [items]
  );
  useEffect(() => {
    const path = location.pathname;
    const id = idByPathLookup?.[path];
    document.title = `CrafterCMS - ${formatMessage(
      globalMenuMessages[id] ?? {
        id: 'globalApp.routeNotFound',
        defaultMessage: 'Route not found'
      }
    )}`;
  }, [formatMessage, idByPathLookup, location.pathname]);
  return (
    <Paper className={classes.root} elevation={0}>
      <ResizeableDrawer
        classes={{ drawerPaper: classes.drawerPaper, drawerBody: classes.drawerBody }}
        open={openSidebar}
        width={width}
        onWidthChange={setWidth}
      >
        <LauncherGlobalNav
          title=""
          sectionStyles={{
            nav: {
              maxHeight: '100%',
              overflow: 'auto'
            }
          }}
          tileStyles={{
            tile: {
              width: '100%',
              height: 'auto',
              flexDirection: 'row',
              justifyContent: 'left',
              margin: '0 0 5px'
            },
            iconAvatar: {
              width: '25px',
              height: '25px',
              margin: '5px 10px'
            },
            title: {
              textAlign: 'left'
            }
          }}
        />
        <footer className={classes.footer}>
          <CrafterCMSLogo width={100} className={classes.logo} />
          <Typography
            component="p"
            variant="caption"
            className={classes.footerDescription}
            dangerouslySetInnerHTML={{ __html: footerHtml }}
          />
        </footer>
      </ResizeableDrawer>
      <Box className={classes.wrapper} height="100%" width="100%" paddingLeft={openSidebar ? `${width}px` : 0}>
        <Suspense
          fallback={
            <>
              <GlobalAppToolbar title={<Skeleton width="140px" />} />
              <Box display="flex" sx={{ height: '100%' }}>
                <LoadingState />
              </Box>
            </>
          }
        >
          <Outlet />
        </Suspense>
      </Box>
    </Paper>
  );
}

export default GlobalApp;
