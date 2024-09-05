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

import React, { useEffect, useState } from 'react';
import { useGlobalAppState } from '../../GlobalApp';
import useReference from '../../../hooks/useReference';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import useEnv from '../../../hooks/useEnv';
import SiteTools, { Tool } from '../SiteTools';
import { getSystemLink } from '../../../utils/system';
import { useLocation, useNavigate } from 'react-router-dom';

interface UrlDrivenSiteToolsProps {
  footerHtml: string;
}

export function UrlDrivenSiteTools(props: UrlDrivenSiteToolsProps) {
  const { footerHtml } = props;
  const [width, setWidth] = useState(240);
  const location = useLocation();
  const [activeToolId, setActiveToolId] = useState(location.pathname.replace('/', ''));
  const [{ openSidebar }] = useGlobalAppState();
  const tools: Tool[] = useReference('craftercms.siteTools')?.tools;
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const push = useNavigate();

  useEffect(() => {
    setActiveToolId(location.pathname.replace('/', ''));
  }, [location]);

  const onNavItemClick = (id: string) => {
    push(id);
  };

  const onBackClick = () => {
    window.location.href = getSystemLink({
      site,
      authoringBase,
      systemLinkId: 'preview'
    });
  };

  const onDrawerResize = (width) => {
    setWidth(width > 240 ? width : 240);
  };

  return (
    <SiteTools
      site={site}
      sidebarWidth={width}
      onWidthChange={onDrawerResize}
      onNavItemClick={onNavItemClick}
      onBackClick={onBackClick}
      activeToolId={activeToolId}
      footerHtml={footerHtml}
      openSidebar={openSidebar || !activeToolId}
      tools={tools}
      mountMode="page"
    />
  );
}

export default UrlDrivenSiteTools;
