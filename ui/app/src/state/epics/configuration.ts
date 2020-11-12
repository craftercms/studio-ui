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

import { Epic, ofType } from 'redux-observable';
import { map, switchMap } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import { fetchSiteUiConfig, fetchSiteUiConfigComplete, fetchSiteUiConfigFailed } from '../actions/configuration';
import { getSiteUiConfig } from '../../services/configuration';

const fetch_site_ui_config: Epic = (action$) =>
  action$.pipe(
    ofType(fetchSiteUiConfig.type),
    switchMap(({ payload }) =>
      getSiteUiConfig(payload.site).pipe(map(fetchSiteUiConfigComplete), catchAjaxError(fetchSiteUiConfigFailed))
    )
  );

export default [fetch_site_ui_config] as Epic[];
