/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import { Credentials, User } from '../../models/User';

// region Login

export const LOG_IN = 'LOG_IN';
export const LOG_IN_COMPLETE = 'LOG_IN_COMPLETE';
export const LOG_IN_FAILED = 'LOG_IN_FAILED';

export const login = createAction<Credentials>(LOG_IN);
export const loginComplete = createAction<User>(LOG_IN_COMPLETE);
export const loginFailed = createAction(LOG_IN_FAILED);

// endregion

// region Log Out

export const LOG_OUT = 'LOG_OUT';
export const LOG_OUT_COMPLETE = 'LOG_OUT_COMPLETE';
export const LOG_OUT_FAILED = 'LOG_OUT_FAILED';

export const logout = createAction(LOG_OUT);
export const logoutComplete = createAction(LOG_OUT_COMPLETE);
export const logoutFailed = createAction(LOG_OUT_FAILED);

// endregion
