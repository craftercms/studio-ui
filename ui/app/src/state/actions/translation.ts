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

// region Supported Locales

export const FETCH_SUPPORTED_LOCALES = 'FETCH_SUPPORTED_LOCALES';
export const FETCH_SUPPORTED_LOCALES_COMPLETE = 'FETCH_SUPPORTED_LOCALES_COMPLETE';
export const FETCH_SUPPORTED_LOCALES_FAILED = 'FETCH_SUPPORTED_LOCALES_FAILED';

export const fetchSupportedLocales = createAction(FETCH_SUPPORTED_LOCALES);
export const fetchSupportedLocalesComplete = createAction(FETCH_SUPPORTED_LOCALES_COMPLETE);
export const fetchSupportedLocalesFailed = createAction(FETCH_SUPPORTED_LOCALES_FAILED);

// endregion
