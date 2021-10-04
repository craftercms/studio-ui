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

import { LEGACY_PREVIEW_URL_PATH, PREVIEW_URL_PATH } from './constants';

export type SystemLinkId =
  | 'preview'
  | 'siteTools'
  | 'siteSearch'
  | 'siteDashboard'
  | 'siteToolsDialog'
  | 'siteSearchDialog'
  | 'siteDashboardDialog';

export function getSystemLink({
  systemLinkId,
  authoringBase,
  useLegacy,
  site,
  page = '/'
}: {
  systemLinkId: SystemLinkId;
  authoringBase: string;
  useLegacy: boolean;
  site: string;
  page?: string;
}) {
  return {
    preview: `${authoringBase}${useLegacy ? LEGACY_PREVIEW_URL_PATH : PREVIEW_URL_PATH}#/?page=${page}&site=${site}`,
    siteTools: `${authoringBase}/site-config`,
    siteSearch: `${authoringBase}/search`,
    siteDashboard: `${authoringBase}/site-dashboard`
  }[systemLinkId];
}
