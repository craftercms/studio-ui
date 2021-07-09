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
import React, { useState } from 'react';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import { Box, Typography } from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';
import SystemIcon from '../SystemIcon';
import { Route, Switch, useHistory } from 'react-router';
import EmptyState from '../SystemStatus/EmptyState';
import { useGlobalAppState } from '../GlobalApp';
import LauncherOpenerButton from '../LauncherOpenerButton';
import CrafterCMSLogo from '../Icons/CrafterCMSLogo';
import { useSelection } from '../../utils/hooks/useSelection';
import { useReferences } from '../../utils/hooks/useReferences';
import { getPossibleTranslation } from '../../utils/i18n';
import Widget from '../Widget';

interface SiteToolsAppProps {
  footerHtml: string;
}

export default function SiteToolsApp(props: SiteToolsAppProps) {
  const { footerHtml } = props;
  const classes = useStyles();
  const [width, setWidth] = useState(240);
  const history = useHistory();
  const { formatMessage } = useIntl();
  const [activeToolId, setActiveToolId] = useState(history.location.pathname);
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const [{ openSidebar }] = useGlobalAppState();
  const { 'craftercms.siteTools': siteTools } = useReferences();

  history.listen((location) => {
    setActiveToolId(location.pathname);
  });

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
        <MenuList disablePadding className={classes.nav}>
          {siteTools ? (
            siteTools.tools.map((tool) => (
              <MenuItem onClick={() => onClick(tool.url)} key={tool.url} selected={`/${tool.url}` === activeToolId}>
                <SystemIcon
                  className={classes.icon}
                  icon={tool.icon}
                  svgIconProps={{ fontSize: 'small', color: 'action' }}
                />
                <Typography>{getPossibleTranslation(tool.title, formatMessage)}</Typography>
              </MenuItem>
            ))
          ) : (
            <EmptyState
              title={
                <FormattedMessage
                  id="siteTools.toolListingNotConfigured"
                  defaultMessage="The site tools list has not been set"
                />
              }
              subtitle={
                <FormattedMessage
                  id="siteTools.toolListingNotConfiguredSubtitle"
                  defaultMessage="Please set the craftercms.siteTools reference on the ui.xml"
                />
              }
            />
          )}
        </MenuList>
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
        <Switch>
          {siteTools.tools.map((tool) => (
            <Route
              key={tool.url}
              path={`/${tool.url}`}
              render={() => {
                return <Widget {...tool.widget} extraProps={{ embedded: false }} />;
              }}
            />
          ))}
          <Route
            exact
            path="/"
            render={() => {
              return (
                <Box display="flex" flexDirection="column" height="100%">
                  <section className={classes.launcher}>
                    <LauncherOpenerButton sitesRailPosition="left" icon="apps" />
                  </section>
                  <EmptyState
                    styles={{
                      root: {
                        height: '100%',
                        margin: 0
                      }
                    }}
                    title={
                      <FormattedMessage
                        id="siteTools.selectTool"
                        defaultMessage="Please choose a tool from the left."
                      />
                    }
                    image={`${baseUrl}/static-assets/images/choose_option.svg`}
                  />
                </Box>
              );
            }}
          />
          <Route
            render={() => {
              return (
                <Box display="flex" flexDirection="column" height="100%">
                  <section className={classes.launcher}>
                    <LauncherOpenerButton sitesRailPosition="left" icon="apps" />
                  </section>
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
                </Box>
              );
            }}
          />
        </Switch>
      </Box>
    </section>
  );
}
