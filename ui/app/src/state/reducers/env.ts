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

interface GlobalBootData {
  xsrfHeader: string;
  xsrfArgument: string;
  useBaseDomain: boolean;
}

const json = import.meta.env.DEV ? '' : document.getElementById('globalBootData').textContent;
const data: GlobalBootData = import.meta.env.DEV ? {} : JSON.parse(json);

export const envInitialState: GlobalState['env'] = ((origin: string) => ({
  authoringBase: import.meta.env.VITE_AUTHORING_BASE ?? `${origin}/studio`,
  logoutUrl: import.meta.env.VITE_AUTHORING_BASE
    ? `${import.meta.env.VITE_AUTHORING_BASE}/logout`
    : `${origin}/studio/logout`,
  guestBase: import.meta.env.VITE_GUEST_BASE ?? origin,
  xsrfHeader: data.xsrfHeader ?? 'X-XSRF-TOKEN',
  xsrfArgument: data.xsrfArgument ?? '_csrf',
  useBaseDomain: data.useBaseDomain ?? false,
  siteCookieName: 'crafterSite',
  previewLandingBase: import.meta.env.VITE_PREVIEW_LANDING ?? `${origin}/studio/preview-landing`,
  version: null,
  packageBuild: null,
  packageVersion: null,
  packageBuildDate: null,
  activeEnvironment: null,
  socketConnected: false
}))(window.location.origin);

const reducer = createReducer<GlobalState['env']>(envInitialState, (builder) => {
  builder
    .addCase(fetchSystemVersionComplete, (state, { payload }: { payload: Version }) => ({
      ...state,
      version: payload.packageVersion.replace('-SNAPSHOT', ''),
      packageBuild: payload.packageBuild,
      packageVersion: payload.packageVersion,
      packageBuildDate: payload.packageBuildDate
    }))
    .addCase(storeInitialized, (state, { payload }) => ({
      ...state,
      activeEnvironment: payload.activeEnvironment
    }))
    .addCase(siteSocketStatus, (state, { payload }) => ({
      ...state,
      socketConnected: payload.connected
    }));
});

export default reducer;
