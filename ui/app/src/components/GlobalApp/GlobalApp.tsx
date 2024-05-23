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
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
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

// Site management loaded normally above as it is usually where people first land.
const UserManagement = lazy(() => import('../UserManagement/UserManagement'));
const GroupManagement = lazy(() => import('../GroupManagement/GroupManagement'));
const AuditManagement = lazy(() => import('../AuditManagement/AuditManagement'));
const LogLevelManagement = lazy(() => import('../LogLevelManagement/LogLevelManagement'));
const LogConsole = lazy(() => import('../LogConsole/LogConsole'));
const GlobalConfigManagement = lazy(() => import('../GlobalConfigManagement/GlobalConfigManagement'));
const EncryptTool = lazy(() => import('../EncryptTool/EncryptTool'));
const TokenManagement = lazy(() => import('../TokenManagement/TokenManagement'));
const AboutCrafterCMSView = lazy(() => import('../AboutCrafterCMSView/AboutCrafterCMSView'));
const AccountManagement = lazy(() => import('../AccountManagement/AccountManagement'));

export interface GlobalAppProps {
  passwordRequirementsMinComplexity: number;
  footerHtml: string;
}

export function GlobalApp(props: GlobalAppProps) {
  const { classes } = useStyles();
  const { passwordRequirementsMinComplexity, footerHtml } = props;
  const [width, setWidth] = useState(240);
  const globalNavigation = useGlobalNavigation();
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
          <Switch>
            <Route path="/sites" component={SiteManagement} />
            <Route
              path="/users"
              render={() => <UserManagement passwordRequirementsMinComplexity={passwordRequirementsMinComplexity} />}
            />
            <Route path="/groups" component={GroupManagement} />
            <Route path="/audit" component={AuditManagement} />
            <Route path="/logging" component={LogLevelManagement} />
            <Route path="/log" component={LogConsole} />
            <Route path="/global-config" component={GlobalConfigManagement} />
            <Route path="/encryption-tool" component={EncryptTool} />
            <Route path="/token-management" component={TokenManagement} />
            <Route path="/about-us" component={AboutCrafterCMSView} />
            <Route
              path="/settings"
              render={() => <AccountManagement passwordRequirementsMinComplexity={passwordRequirementsMinComplexity} />}
            />
            <Route path="/globalMenu/:id" render={(props) => <Redirect to={`/${props.match.params.id}`} />} />
            <Route exact path="/">
              {globalNavigation.items ? (
                <Redirect to={`${urlMapping[globalNavigation.items[0].id].replace('#', '')}`} />
              ) : (
                <LoadingState
                  styles={{
                    root: {
                      height: '100%',
                      margin: 0
                    }
                  }}
                />
              )}
            </Route>
            <Route
              render={() => {
                return (
                  <Box display="flex" flexDirection="column" height="100%">
                    <section className={classes.launcher}>
                      <LauncherOpenerButton />
                    </section>
                    <EmptyState
                      styles={{
                        root: {
                          height: '100%',
                          margin: 0
                        }
                      }}
                      title="404"
                      subtitle={<FormattedMessage id={'globalApp.routeNotFound'} defaultMessage={'Route not found'} />}
                    />
                  </Box>
                );
              }}
            />
          </Switch>
        </Suspense>
      </Box>
    </Paper>
  );
}

export default GlobalApp;
