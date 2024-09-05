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

import React, { useState } from 'react';
import { GlobalAppContextProvider, useGlobalAppState } from '../../GlobalApp';
import useReference from '../../../hooks/useReference';
import { useActiveSiteId } from '../../../hooks/useActiveSiteId';
import SiteTools, { Tool } from '../SiteTools';
import { embeddedStyles } from '../styles';
import { onSubmittingAndOrPendingChangeProps } from '../../../hooks/useEnhancedDialogState';
import { useDispatch } from 'react-redux';
import { updateWidgetDialog } from '../../../state/actions/dialogs';

interface EmbeddedSiteToolsProps {
  onMinimize?: () => void;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

export const EmbeddedSiteToolsContainer = (props: EmbeddedSiteToolsProps) => {
  const [width, setWidth] = useState(240);
  const [activeToolId, setActiveToolId] = useState<string>();
  const [{ openSidebar }] = useGlobalAppState();
  const siteTools = useReference('craftercms.siteTools');
  const tools: Tool[] = siteTools?.tools;
  const site = useActiveSiteId();
  const { classes } = embeddedStyles();
  const dispatch = useDispatch();

  const onNavItemClick = (id: string) => {
    setActiveToolId(id);
  };

  const onSubmittingAndOrPendingChange =
    props.onSubmittingAndOrPendingChange ??
    ((value: onSubmittingAndOrPendingChangeProps) => {
      dispatch(updateWidgetDialog(value));
    });

  const onDrawerResize = (width) => {
    setWidth(width > 240 ? width : 240);
  };

  return (
    <SiteTools
      site={site}
      sidebarWidth={width}
      onWidthChange={onDrawerResize}
      onNavItemClick={onNavItemClick}
      sidebarBelowToolbar
      hideSidebarLogo
      showAppsButton={false}
      hideSidebarSiteSwitcher
      activeToolId={activeToolId}
      openSidebar={openSidebar || !activeToolId}
      tools={tools}
      classes={{
        root: classes.root
      }}
      onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
      onMinimize={() => {
        if (props.onMinimize) {
          props.onMinimize();
        } else {
          dispatch(updateWidgetDialog({ isMinimized: true }));
        }
      }}
      mountMode="dialog"
    />
  );
};

export function EmbeddedSiteTools(props: EmbeddedSiteToolsProps) {
  return (
    <GlobalAppContextProvider>
      <EmbeddedSiteToolsContainer {...props} />
    </GlobalAppContextProvider>
  );
}

export default EmbeddedSiteTools;
