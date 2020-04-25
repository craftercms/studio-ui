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
export const logoutComplete = createAction<boolean>(LOG_OUT_COMPLETE);
export const logoutFailed = createAction(LOG_OUT_FAILED);

// endregion

// region Validate Session

export const VALIDATE_SESSION = 'VALIDATE_SESSION';
export const VALIDATE_SESSION_COMPLETE = 'VALIDATE_SESSION_COMPLETE';
export const VALIDATE_SESSION_FAILED = 'VALIDATE_SESSION_FAILED';

export const validateSession = createAction(VALIDATE_SESSION);
export const validateSessionComplete = createAction<boolean>(VALIDATE_SESSION_COMPLETE);
export const validateSessionFailed = createAction(VALIDATE_SESSION_FAILED);

// endregion
