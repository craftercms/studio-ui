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
import { useSelection } from '../../utils/hooks/useSelection';
import { GlobalAppContextProvider, useGlobalAppState } from '../GlobalApp';
import { useReference } from '../../utils/hooks/useReference';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import SiteToolsApp, { Tool } from './SiteToolsApp';
import Box from '@material-ui/core/Box';
import EmptyState from '../SystemStatus/EmptyState';
import { FormattedMessage } from 'react-intl';
import Widget from '../Widget';
import Suspencified from '../SystemStatus/Suspencified';
import { embeddedStyles } from './styles';

export const EmbeddedSiteToolsContainer = () => {
  const [width, setWidth] = useState(240);
  const [activeToolId, setActiveToolId] = useState<string>();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const [{ openSidebar }] = useGlobalAppState();
  const siteTools = useReference('craftercms.siteTools');
  const tools: Tool[] = siteTools?.tools;
  const site = useActiveSiteId();
  const classes = embeddedStyles();

  const onNavItemClick = (id: string) => {
    setActiveToolId(id);
  };

  return (
    <SiteToolsApp
      site={site}
      sidebarWidth={width}
      onWidthChange={setWidth}
      onNavItemClick={onNavItemClick}
      sidebarBelowToolbar={true}
      hideSidebarLogo={true}
      hideSidebarSiteSwitcher={true}
      activeToolId={activeToolId}
      openSidebar={openSidebar}
      tools={tools}
      classes={{
        root: classes.root
      }}
    >
      {activeToolId ? (
        <Suspencified>
          <Widget
            {...tools.find((tool) => tool.url === activeToolId).widget}
            extraProps={{ embedded: false, showAppsButton: false }}
          />
        </Suspencified>
      ) : (
        <Box display="flex" flexDirection="column" height="100%">
          <EmptyState
            styles={{
              root: {
                height: '100%',
                margin: 0
              }
            }}
            title={<FormattedMessage id="siteTools.selectTool" defaultMessage="Please choose a tool from the left." />}
            image={`${baseUrl}/static-assets/images/choose_option.svg`}
          />
        </Box>
      )}
    </SiteToolsApp>
  );
};

export default function EmbeddedSiteTools() {
  return (
    <GlobalAppContextProvider>
      <EmbeddedSiteToolsContainer />
    </GlobalAppContextProvider>
  );
}
