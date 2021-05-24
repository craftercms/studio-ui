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
import { Route } from 'react-router';
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

export default function GlobalApp() {
  const classes = useStyles({});
  const [width, setWidth] = useState(240);
  const globalNavigation = useGlobalNavigation();

  const renderComponent = (id: string) => {
    switch (id) {
      case 'home.globalMenu.sites':
      case '/globalMenu/sites': {
        return <SitesManagement />;
      }
      case 'home.globalMenu.users':
      case '/globalMenu/users': {
        return <UsersManagement />;
      }
      case 'home.globalMenu.groups':
      case '/globalMenu/groups': {
        return <GroupsManagement />;
      }
      case 'home.globalMenu.cluster':
      case '/globalMenu/cluster': {
        return <ClustersManagement />;
      }
      case 'home.globalMenu.audit':
      case '/globalMenu/audit': {
        return <AuditManagement />;
      }
      case 'home.globalMenu.logging-levels':
      case '/globalMenu/logging': {
        return <LoggingLevelsManagement />;
      }
      case 'home.globalMenu.log-console':
      case '/globalMenu/log': {
        return <LogConsole />;
      }
      case 'home.globalMenu.globalConfig':
      case '/globalMenu/global-config': {
        return <GlobalConfigManagement onEditorChanges={() => {}} />;
      }
      case 'home.globalMenu.encryptionTool':
      case '/globalMenu/encryption-tool': {
        return <EncryptTool />;
      }
      case 'home.globalMenu.tokenManagement':
      case '/globalMenu/token-management': {
        return <TokenManagement />;
      }
      case 'home.globalMenu.about-us':
      case '/globalMenu/about-us': {
        return <AboutCrafterCMSView />;
      }
      case 'home.globalMenu.settings':
      case '/globalMenu/settings': {
        return <AccountManagement />;
      }
    }
  };

  return (
    <section className={classes.root}>
      <ResizeableDrawer
        classes={{ drawerPaper: classes.drawerPaper }}
        open={true}
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
      <Box height="100%" width="100%" paddingLeft={`${width}px`}>
        <Route path="/sites" component={SitesManagement} />
        <Route path="/users" component={UsersManagement} />
        <Route path="/groups" component={GroupsManagement} />
        <Route path="/cluster" component={ClustersManagement} />
        <Route path="/audit" component={AuditManagement} />
        <Route path="/logging-levels" component={LoggingLevelsManagement} />
        <Route path="/log-console" component={LogConsole} />
        <Route
          path="/global-config"
          render={() => {
            return <GlobalConfigManagement onEditorChanges={() => {}} />;
          }}
        />
        <Route path="/encryption-tool" component={EncryptTool} />
        <Route path="/token-management" component={TokenManagement} />
        <Route path="/about-us" component={AboutCrafterCMSView} />
        <Route path="/settings" component={AccountManagement} />
        <Route path="/globalMenu/:id" render={(props) => renderComponent(props.location.pathname)} />
        <Route exact path="/" render={() => renderComponent(globalNavigation.items[0].id)} />
      </Box>
    </section>
  );
}
