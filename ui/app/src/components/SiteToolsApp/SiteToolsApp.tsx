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

import useStyles from './styles';
import ResizeableDrawer from '../../modules/Preview/ResizeableDrawer';
import React, { useMemo, useState } from 'react';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import { Box, Typography } from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';
import SystemIcon from '../SystemIcon';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import SettingsApplicationsOutlinedIcon from '@material-ui/icons/SettingsApplicationsOutlined';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import GraphQL from '../Icons/GraphQL';
import { components } from '../../services/plugin';
import { Route, Switch, useHistory } from 'react-router';
import SiteConfigurationManagement from '../SiteConfigurationManagement';
import SiteEncryptTool from '../SiteEncryptTool';
import SiteAuditManagement from '../SiteAuditManagement';
import LogConsole from '../LogConsole';
import PublishingDashboard from '../PublishingDashboard';
import Graphi from '../GraphiQL/GraphiQL';
import PluginManagement from '../PluginManagement';
import { useSelection, useSiteTools } from '../../utils/hooks';
import Skeleton from '@material-ui/lab/Skeleton';
import { rand } from '../PathNavigator/utils';
import WidgetsOutlinedIcon from '@material-ui/icons/WidgetsOutlined';
import { translations } from './translations';
import EmptyState from '../SystemStatus/EmptyState';
import { useGlobalAppState } from '../GlobalApp';
import LegacyDashboardFrame from '../LegacyDashboardFrame';
import ContentTypeManagement from '../ContentTypesManagement';

export default function SiteToolsApp() {
  const classes = useStyles();
  const [width, setWidth] = useState(240);
  const history = useHistory();
  const { formatMessage } = useIntl();
  const siteTools = useSiteTools();
  const [activeToolId, setActiveToolId] = useState(history.location.pathname);
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const [{ openSidebar }] = useGlobalAppState();

  history.listen((location) => {
    setActiveToolId(location.pathname);
  });

  const skeletonTools = useMemo(() => {
    return new Array(15).fill(null).map(() => `${rand(70, 100)}%`);
  }, []);

  const onClick = (id: string) => {
    history.push(id);
  };

  return (
    <section className={classes.root}>
      <ResizeableDrawer
        classes={{ drawerPaper: classes.drawerPaper, drawerBody: classes.drawerBody }}
        open={openSidebar}
        width={width}
        onWidthChange={setWidth}
      >
        <MenuList disablePadding>
          {siteTools.tools
            ? siteTools.tools.map((link) => (
                <MenuItem onClick={() => onClick(link.id)} key={link.id} selected={`/${link.id}` === activeToolId}>
                  <SystemIcon
                    className={classes.icon}
                    icon={link.icon}
                    svgIconProps={{ fontSize: 'small', color: 'action' }}
                  />
                  <Typography>{formatMessage(translations[link.id])}</Typography>
                </MenuItem>
              ))
            : skeletonTools.map((width, i) => (
                <MenuItem button={false} key={i}>
                  <Skeleton height={15} width={width} />
                </MenuItem>
              ))}
        </MenuList>
      </ResizeableDrawer>
      <Box height="100%" width="100%" paddingLeft={openSidebar ? `${width}px` : 0}>
        <Switch>
          <Route path="/content-types" component={ContentTypeManagement} />
          <Route path="/encrypt-tool" component={SiteEncryptTool} />
          <Route path="/configuration" component={SiteConfigurationManagement} />
          <Route path="/audit" component={SiteAuditManagement} />
          <Route path="/item-states" component={SiteEncryptTool} />
          <Route path="/log" render={() => <LogConsole logType="preview" />} />
          <Route path="/publishing" component={PublishingDashboard} />
          <Route path="/remote-repositories" component={SiteEncryptTool} />
          <Route path="/graphiql" component={Graphi} />
          <Route path="/plugins" component={PluginManagement} />
          <Route
            exact
            path="/"
            render={() => {
              return (
                <EmptyState
                  styles={{
                    root: {
                      height: '100%',
                      margin: 0
                    }
                  }}
                  title={
                    <FormattedMessage id="siteTools.selectTool" defaultMessage="Please choose a tool from the left." />
                  }
                  image={`${baseUrl}/static-assets/images/choose_option.svg`}
                />
              );
            }}
          />
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
                  subtitle={<FormattedMessage id={'siteTools.toolNotFound'} defaultMessage={'Tool not found'} />}
                />
              );
            }}
          />
        </Switch>
      </Box>
    </section>
  );
}

// TODO: Duplicate
Object.entries({
  '@material-ui/icons/WidgetsOutlined': WidgetsOutlinedIcon,
  '@material-ui/icons/SettingsOutlined': SettingsOutlinedIcon,
  '@material-ui/icons/LockOutlined': LockOutlinedIcon,
  '@material-ui/icons/SettingsApplicationsOutlined': SettingsApplicationsOutlinedIcon,
  '@material-ui/icons/CloudUploadOutlined': CloudUploadOutlinedIcon,
  'craftercms.icons.GraphQL': GraphQL,
  'craftercms.components.LegacyDashboardFrame': LegacyDashboardFrame
}).forEach(([id, component]) => {
  components.set(id, component);
});
