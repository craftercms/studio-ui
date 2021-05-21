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
import { Route, useHistory } from 'react-router';
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
import { useSystemVersion } from '../../utils/hooks';
import { getSimplifiedVersion } from '../../utils/string';

export default function GlobalApp() {
  const classes = useStyles({});
  const history = useHistory();
  const [width, setWidth] = useState(240);
  const version = useSystemVersion();

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
          onTileClicked={(e, id, label) => {
            e.preventDefault();
            console.log(id, label);
            history.push(id);
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
            }
          }}
        />
      </ResizeableDrawer>
      <Box height="100%" width="100%" paddingLeft={`${width}px`}>
        <Route path="/home.globalMenu.sites" component={SitesManagement} />
        <Route path="/home.globalMenu.users" component={UsersManagement} />
        <Route path="/home.globalMenu.groups" component={GroupsManagement} />
        <Route path="/home.globalMenu.cluster" component={ClustersManagement} />
        <Route path="/home.globalMenu.audit" component={AuditManagement} />
        <Route path="/home.globalMenu.logging-levels" component={LoggingLevelsManagement} />
        <Route path="/home.globalMenu.log-console" component={LogConsole} />
        <Route path="/home.globalMenu.globalConfig" component={GlobalConfigManagement} />
        <Route path="/home.globalMenu.encryptionTool" component={EncryptTool} />
        <Route path="/home.globalMenu.tokenManagement" component={TokenManagement} />
        <Route path="/home.globalMenu.about-us" component={AboutCrafterCMSView} />
        <Route path="/home.globalMenu.settings" component={AccountManagement} />
        <Route
          path="/home.globalMenu.docs"
          render={() => {
            window.location.replace(`https://docs.craftercms.org/en/${getSimplifiedVersion(version)}/index.html`);
            return null;
          }}
        />
      </Box>
    </section>
  );
}
