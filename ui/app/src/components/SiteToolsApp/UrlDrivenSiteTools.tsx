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

import React, { useState } from 'react';
import { Route, Switch, useHistory } from 'react-router';
import { useSelection } from '../../utils/hooks/useSelection';
import { useGlobalAppState } from '../GlobalApp';
import { useReference } from '../../utils/hooks/useReference';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { usePreviewState } from '../../utils/hooks/usePreviewState';
import { useEnv } from '../../utils/hooks/useEnv';
import { getSystemLink } from '../LauncherSection';
import SiteToolsApp, { Tool } from './SiteToolsApp';
import Widget from '../Widget';
import Box from '@material-ui/core/Box';
import LauncherOpenerButton from '../LauncherOpenerButton';
import EmptyState from '../SystemStatus/EmptyState';
import { FormattedMessage } from 'react-intl';
import { urlDrivenStyles } from './styles';
import Suspencified from '../SystemStatus/Suspencified';

interface UrlDrivenSiteToolsProps {
  footerHtml: string;
}

export default function UrlDrivenSiteTools(props: UrlDrivenSiteToolsProps) {
  const { footerHtml } = props;
  const [width, setWidth] = useState(240);
  const history = useHistory();
  const [activeToolId, setActiveToolId] = useState(history.location.pathname);
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const [{ openSidebar }] = useGlobalAppState();
  const tools: Tool[] = useReference('craftercms.siteTools')?.tools;
  const site = useActiveSiteId();
  const { previewChoice } = usePreviewState();
  const { authoringBase } = useEnv();
  const classes = urlDrivenStyles();

  history.listen((location) => {
    setActiveToolId(location.pathname);
  });

  const onNavItemClick = (id: string) => {
    history.push(id);
  };

  const onBackClick = () => {
    window.location.href = getSystemLink({
      site,
      previewChoice,
      authoringBase,
      systemLinkId: 'preview'
    });
  };

  return (
    <SiteToolsApp
      site={site}
      sidebarWidth={width}
      onWidthChange={setWidth}
      onNavItemClick={onNavItemClick}
      onBackClick={onBackClick}
      activeToolId={activeToolId}
      footerHtml={footerHtml}
      openSidebar={openSidebar}
      tools={tools}
    >
      <Switch>
        {tools?.map((tool) => (
          <Route
            key={tool.url}
            path={`/${tool.url}`}
            render={() => {
              return (
                <Suspencified>
                  <Widget {...tool.widget} extraProps={{ embedded: false }} />
                </Suspencified>
              );
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
                    <FormattedMessage id="siteTools.selectTool" defaultMessage="Please choose a tool from the left." />
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
    </SiteToolsApp>
  );
}
