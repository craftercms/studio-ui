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

import { defineMessages } from 'react-intl';
import { PREVIEW_URL_PATH } from '../../utils/constants';
import { GlobalRoutes, ProjectToolsRoutes } from '../../env/routes';

export const urlMapping = {
  'home.globalMenu.logging-levels': `#${GlobalRoutes.LogLevel}`,
  'home.globalMenu.log-console': `#${GlobalRoutes.LogConsole}`,
  'home.globalMenu.users': `#${GlobalRoutes.Users}`,
  'home.globalMenu.sites': `#${GlobalRoutes.Projects}`,
  'home.globalMenu.audit': `#${GlobalRoutes.Audit}`,
  'home.globalMenu.groups': `#${GlobalRoutes.Groups}`,
  'home.globalMenu.globalConfig': `#${GlobalRoutes.GlobalConfig}`,
  'home.globalMenu.encryptionTool': `#${GlobalRoutes.EncryptTool}`,
  'home.globalMenu.tokenManagement': `#${GlobalRoutes.TokenManagement}`,
  'home.globalMenu.about-us': `#${GlobalRoutes.About}`,
  'home.globalMenu.settings': `#${GlobalRoutes.Settings}`,
  about: `#${GlobalRoutes.About}`,
  settings: `#${GlobalRoutes.Settings}`,
  preview: PREVIEW_URL_PATH,
  siteConfig: ProjectToolsRoutes.ProjectTools,
  search: ProjectToolsRoutes.Search,
  siteDashboard: ProjectToolsRoutes.SiteDashboard
};

export const messages = defineMessages({
  site: {
    id: 'words.project',
    defaultMessage: 'Project'
  },
  global: {
    id: 'words.global',
    defaultMessage: 'Global'
  },
  preview: {
    id: 'words.preview',
    defaultMessage: 'Preview'
  },
  search: {
    id: 'words.search',
    defaultMessage: 'Search'
  },
  dashboard: {
    id: 'words.dashboard',
    defaultMessage: 'Dashboard'
  },
  docs: {
    id: 'words.documentation',
    defaultMessage: 'Documentation'
  }
});

export function getLauncherSectionLink(id: string, authoringBase: string = `${getBase()}/studio`) {
  return `${authoringBase}${urlMapping[id]}`;
}

function getBase() {
  return window.location.host.replace('3000', '8080');
}
