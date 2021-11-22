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
import { useHistory } from 'react-router';
import { useSelection } from '../../hooks/useSelection';
import { useGlobalAppState } from '../GlobalApp';
import { useReference } from '../../hooks/useReference';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useEnv } from '../../hooks/useEnv';
import SiteToolsApp, { Tool } from './SiteToolsApp';
import { getSystemLink } from '../../utils/system';
import { useLegacyPreviewPreference } from '../../hooks/useLegacyPreviewPreference';

interface UrlDrivenSiteToolsProps {
  footerHtml: string;
}

export function UrlDrivenSiteTools(props: UrlDrivenSiteToolsProps) {
  const { footerHtml } = props;
  const [width, setWidth] = useState(240);
  const history = useHistory();
  const [activeToolId, setActiveToolId] = useState(history.location.pathname.replace('/', ''));
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const [{ openSidebar }] = useGlobalAppState();
  const tools: Tool[] = useReference('craftercms.siteTools')?.tools;
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const useLegacy = useLegacyPreviewPreference();

  history.listen((location) => {
    setActiveToolId(location.pathname.replace('/', ''));
  });

  const onNavItemClick = (id: string) => {
    history.push(id);
  };

  const onBackClick = () => {
    window.location.href = getSystemLink({
      site,
      useLegacy,
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
      openSidebar={openSidebar || !activeToolId}
      tools={tools}
      imageUrl={`${baseUrl}/static-assets/images/choose_option.svg`}
    />
  );
}

export default UrlDrivenSiteTools;
