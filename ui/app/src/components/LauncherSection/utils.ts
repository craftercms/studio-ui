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

export const urlMapping = {
  'home.globalMenu.logging-levels': '#/logging',
  'home.globalMenu.log-console': '#/log',
  'home.globalMenu.users': '#/users',
  'home.globalMenu.sites': '#/projects',
  'home.globalMenu.audit': '#/audit',
  'home.globalMenu.groups': '#/groups',
  'home.globalMenu.globalConfig': '#/global-config',
  'home.globalMenu.encryptionTool': '#/encryption-tool',
  'home.globalMenu.tokenManagement': '#/token-management',
  'home.globalMenu.about-us': '#/about-us',
  'home.globalMenu.settings': '#/settings',
  about: '#/about-us',
  settings: '#/settings',
  'legacy.preview': '/preview/',
  preview: PREVIEW_URL_PATH,
  siteConfig: '/site-config',
  search: '/search',
  siteDashboard: '/site-dashboard'
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
