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
import { EnhancedUser } from '../../models/User';
import { storeInitialized } from '../actions/system';
import { fetchMyPermissionsInSiteComplete, fetchMyRolesInSiteComplete } from '../actions/user';

const reducer = createReducer<EnhancedUser>(null, (builder) => {
  builder
    .addCase(storeInitialized, (state, { payload }) => ({
      ...payload.user,
      rolesBySite: {},
      permissionsBySite: {},
      preferences: null // TODO: is this needed?
    }))
    .addCase(fetchMyRolesInSiteComplete, (state, { payload }) => ({
      ...state,
      rolesBySite: {
        ...state.rolesBySite,
        [payload.site]: payload.roles
      }
    }))
    .addCase(fetchMyPermissionsInSiteComplete, (state, { payload }) => ({
      ...state,
      permissionsBySite: {
        ...state.permissionsBySite,
        [payload.site]: payload.permissions
      }
    }));
});

export default reducer;
