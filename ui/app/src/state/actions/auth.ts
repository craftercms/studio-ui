/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import { User } from '../../models/User';
import { Credentials } from '../../models/Credentials';
import { RefreshSessionResponse } from '../../services/auth';

// region Login

export const login = createAction<Credentials>('LOG_IN');
export const loginComplete = createAction<{ user: User; auth: RefreshSessionResponse }>('LOG_IN_COMPLETE');
export const loginFailed = createAction('LOG_IN_FAILED');

// endregion

// region Log Out

export const logout = createAction('LOG_OUT');
export const logoutComplete = createAction<boolean>('LOG_OUT_COMPLETE');
export const logoutFailed = createAction('LOG_OUT_FAILED');

// endregion

// region User Session control

export const refreshAuthToken = createAction('REFRESH_AUTH_TOKEN');
export const refreshAuthTokenComplete = createAction<RefreshSessionResponse>('REFRESH_AUTH_TOKEN_COMPLETE');
export const refreshAuthTokenFailed = createAction('REFRESH_AUTH_TOKEN_FAILED');
export const authTokenRefreshedFromAnotherTab = createAction<RefreshSessionResponse>(
  'AUTH_TOKEN_REFRESHED_FROM_ANOTHER_TAB'
);

// endregion
