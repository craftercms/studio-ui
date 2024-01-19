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
import { AjaxError } from 'rxjs/ajax';
import { StudioSiteConfig } from '../../services/configuration';

export const fetchSiteUiConfig = /*#__PURE__*/ createAction<{ site: string }>('FETCH_SITE_UI_CONFIG');
export const fetchSiteUiConfigComplete = /*#__PURE__*/ createAction<any>('FETCH_SITE_UI_CONFIG_COMPLETE');
export const fetchSiteUiConfigFailed = /*#__PURE__*/ createAction<AjaxError>('FETCH_SITE_UI_CONFIG_FAILED');

export const fetchSiteConfig = /*#__PURE__*/ createAction('FETCH_SITE_CONFIG');
export const fetchSiteConfigComplete = /*#__PURE__*/ createAction<StudioSiteConfig>('FETCH_SITE_CONFIG_COMPLETE');
export const fetchSiteConfigFailed = /*#__PURE__*/ createAction<AjaxError>('FETCH_SITE_CONFIG_FAILED');
