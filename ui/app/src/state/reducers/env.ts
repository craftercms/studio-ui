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

import { createReducer } from '@reduxjs/toolkit';
import { GlobalState } from '../../models/GlobalState';
import { fetchSystemVersionComplete } from '../actions/env';
import { Version } from '../../models/monitoring/Version';
import { siteSocketStatus, storeInitialized } from '../actions/system';

export const envInitialState: GlobalState['env'] = ((origin: string) => ({
  authoringBase: process.env.REACT_APP_AUTHORING_BASE ?? `${origin}/studio`,
  logoutUrl: process.env.REACT_APP_AUTHORING_BASE
    ? `${process.env.REACT_APP_AUTHORING_BASE}/logout`
    : `${origin}/studio/logout`,
  guestBase: process.env.REACT_APP_GUEST_BASE ?? origin,
  xsrfHeader: document.querySelector('#xsrfHeader')?.textContent ?? 'X-XSRF-TOKEN',
  xsrfArgument: document.querySelector('#xsrfArgument')?.textContent ?? '_csrf',
  useBaseDomain: document.querySelector('#useBaseDomain')?.textContent === 'true',
  siteCookieName: 'crafterSite',
  previewLandingBase: process.env.REACT_APP_PREVIEW_LANDING ?? `${origin}/studio/preview-landing`,
  version: null,
  packageBuild: null,
  packageVersion: null,
  packageBuildDate: null,
  activeEnvironment: null,
  socketConnected: false
}))(window.location.origin);

const reducer = createReducer<GlobalState['env']>(envInitialState, {
  [fetchSystemVersionComplete.type]: (state, { payload }: { payload: Version }) => ({
    ...state,
    version: payload.packageVersion.replace('-SNAPSHOT', ''),
    packageBuild: payload.packageBuild,
    packageVersion: payload.packageVersion,
    packageBuildDate: payload.packageBuildDate
  }),
  [storeInitialized.type]: (state, { payload }) => ({
    ...state,
    activeEnvironment: payload.activeEnvironment
  }),
  [siteSocketStatus.type]: (state, { payload }) => ({
    ...state,
    socketConnected: payload.connected
  })
});

export default reducer;
