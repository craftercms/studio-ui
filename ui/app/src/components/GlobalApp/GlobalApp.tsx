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

import { Box } from '@material-ui/core';
import React, { useState } from 'react';
import LauncherGlobalNav from '../LauncherGlobalNav';
import ResizeableDrawer from '../../modules/Preview/ResizeableDrawer';
import { useStyles } from './styles';
import { Redirect, Route, Switch } from 'react-router';
import SitesManagement from '../SitesManagement';
import UsersManagement from '../UsersManagement';
import GroupsManagement from '../GroupsManagement';
import ClustersManagement from '../ClustersManagement';
import AuditManagement from '../AuditManagement';
import LoggingLevelsManagement from '../LoggingLevelsManagement';
import LogConsole from '../LogConsole';
import GlobalConfigManagement from '../GlobalConfigManagement';
import EncryptTool from '../EncryptTool';
import TokenManagement from '../TokenManagement';
import AboutCrafterCMSView from '../AboutCrafterCMSView';
import AccountManagement from '../AccountManagement';
import { useGlobalNavigation } from '../../utils/hooks';
import { urlMapping } from '../LauncherSection';
import EmptyState from '../SystemStatus/EmptyState';
import { FormattedMessage } from 'react-intl';
import { GlobalProvider } from './GlobalContext';

export default function GlobalApp() {
  const classes = useStyles({});
  const [width, setWidth] = useState(240);
  const globalNavigation = useGlobalNavigation();
  const [open, setOpen] = useState(true);

  return (
    <GlobalProvider value={{ open, setOpen }}>
      <section className={classes.root}>
        <ResizeableDrawer
          classes={{ drawerPaper: classes.drawerPaper }}
          open={open}
          width={width}
          onWidthChange={setWidth}
        >
          <LauncherGlobalNav
            title=""
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
              }
            }}
          />
        </ResizeableDrawer>
        <Box height="100%" width="100%" paddingLeft={open ? `${width}px` : 0}>
          <Switch>
            <Route path="/sites" component={SitesManagement} />
            <Route path="/users" component={UsersManagement} />
            <Route path="/groups" component={GroupsManagement} />
            <Route path="/cluster" component={ClustersManagement} />
            <Route path="/audit" component={AuditManagement} />
            <Route path="/logging" component={LoggingLevelsManagement} />
            <Route path="/log" component={LogConsole} />
            <Route path="/global-config" component={GlobalConfigManagement} />
            <Route path="/encryption-tool" component={EncryptTool} />
            <Route path="/token-management" component={TokenManagement} />
            <Route path="/about-us" component={AboutCrafterCMSView} />
            <Route path="/settings" component={AccountManagement} />
            <Route path="/globalMenu/:id" render={(props) => <Redirect to={`/${props.match.params.id}`} />} />
            <Route exact path="/">
              <Redirect to={`${urlMapping[globalNavigation.items[0].id].replace('#', '')}`} />
            </Route>
            <Route
              render={() => {
                return (
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
                );
              }}
            />
          </Switch>
        </Box>
      </section>
    </GlobalProvider>
  );
}
