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

import { createAction } from '@reduxjs/toolkit';

export const sessionTimeout = /*#__PURE__*/ createAction('SESSION_TIMEOUT');

export const fetchGlobalProperties = /*#__PURE__*/ createAction('FETCH_GLOBAL_PROPERTIES');

export const fetchGlobalPropertiesComplete = /*#__PURE__*/ createAction('FETCH_GLOBAL_PROPERTIES_COMPLETE');

export const fetchGlobalPropertiesFailed = /*#__PURE__*/ createAction('FETCH_GLOBAL_PROPERTIES_FAILED');

export const fetchSiteProperties = /*#__PURE__*/ createAction('FETCH_SITE_PROPERTIES');

export const fetchSitePropertiesComplete = /*#__PURE__*/ createAction('FETCH_SITE_PROPERTIES_COMPLETE');

export const fetchSitePropertiesFailed = /*#__PURE__*/ createAction('FETCH_SITE_PROPERTIES_FAILED');

export const deleteProperties =
  /*#__PURE__*/ createAction<{ properties: string[]; siteId?: string }>('DELETE_PROPERTIES');

export const deletePropertiesComplete = /*#__PURE__*/ createAction('DELETE_PROPERTIES_COMPLETE');

export const deletePropertiesFailed = /*#__PURE__*/ createAction('DELETE_PROPERTIES_FAILED');

export const fetchMyRolesInSite = /*#__PURE__*/ createAction('FETCH_MY_ROLES_IN_SITE');

export const fetchMyRolesInSiteComplete = /*#__PURE__*/ createAction<{ site: string; roles: string[] }>(
  'FETCH_MY_ROLES_IN_SITE_COMPLETE'
);

export const fetchMyRolesInSiteFailed = /*#__PURE__*/ createAction('FETCH_MY_ROLES_IN_SITE_FAILED');

export const fetchMyPermissionsInSite = /*#__PURE__*/ createAction('FETCH_MY_PERMISSIONS_IN_SITE');

export const fetchMyPermissionsInSiteComplete = /*#__PURE__*/ createAction<{ site: string; permissions: string[] }>(
  'FETCH_MY_PERMISSIONS_IN_SITE_COMPLETE'
);

export const fetchMyPermissionsInSiteFailed = /*#__PURE__*/ createAction('FETCH_MY_PERMISSIONS_IN_SITE_FAILED');
