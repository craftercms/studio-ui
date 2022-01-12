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
import { useSelection } from '../../hooks/useSelection';
import { GlobalAppContextProvider, useGlobalAppState } from '../GlobalApp';
import { useReference } from '../../hooks/useReference';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import SiteToolsApp, { Tool } from './SiteToolsApp';
import { embeddedStyles } from './styles';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import { useDispatch } from 'react-redux';
import { updateWidgetDialog } from '../../state/actions/dialogs';

export const EmbeddedSiteToolsContainer = () => {
  const [width, setWidth] = useState(240);
  const [activeToolId, setActiveToolId] = useState<string>();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const [{ openSidebar }] = useGlobalAppState();
  const siteTools = useReference('craftercms.siteTools');
  const tools: Tool[] = siteTools?.tools;
  const site = useActiveSiteId();
  const classes = embeddedStyles();
  const dispatch = useDispatch();

  const onNavItemClick = (id: string) => {
    setActiveToolId(id);
  };

  const onSubmittingAndOrPendingChange = (value: onSubmittingAndOrPendingChangeProps) => {
    dispatch(updateWidgetDialog(value));
  };

  return (
    <SiteToolsApp
      site={site}
      sidebarWidth={width}
      onWidthChange={setWidth}
      onNavItemClick={onNavItemClick}
      sidebarBelowToolbar={true}
      hideSidebarLogo={true}
      showAppsButton={false}
      imageUrl={`${baseUrl}/static-assets/images/choose_option.svg`}
      hideSidebarSiteSwitcher={true}
      activeToolId={activeToolId}
      openSidebar={openSidebar || !activeToolId}
      tools={tools}
      classes={{
        root: classes.root
      }}
      onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
      onMinimize={() => {
        dispatch(updateWidgetDialog({ isMinimized: true }));
      }}
      mountMode="dialog"
    />
  );
};

export function EmbeddedSiteTools() {
  return (
    <GlobalAppContextProvider>
      <EmbeddedSiteToolsContainer />
    </GlobalAppContextProvider>
  );
}

export default EmbeddedSiteTools;
