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

import { ofType } from 'redux-observable';
import { exhaustMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import {
  fetchSiteConfig,
  fetchSiteConfigComplete,
  fetchSiteConfigFailed,
  fetchSiteUiConfig,
  fetchSiteUiConfigComplete,
  fetchSiteUiConfigFailed
} from '../actions/configuration';
import {
  fetchSiteConfig as fetchSiteConfigService,
  fetchSiteUiConfig as fetchSiteUiConfigService
} from '../../services/configuration';
import { CrafterCMSEpic } from '../store';
import { showSystemNotification } from '../actions/system';
import { defineMessages } from 'react-intl';

const configurationMessages = defineMessages({
  localeError: {
    id: 'configurationMessages.localeError',
    defaultMessage: 'Incorrect locale configuration: {message}. Using browser locale settings. Check site config xml.'
  }
});

export default [
  (action$, state$) =>
    action$.pipe(
      ofType(fetchSiteUiConfig.type),
      withLatestFrom(state$),
      filter(([, state]) => Boolean(state.sites.active)),
      // A very quick site change may present problematic as the
      // config that would be retrieved would be the first site.
      exhaustMap(([{ payload }]) =>
        fetchSiteUiConfigService(payload.site).pipe(
          map((config) => fetchSiteUiConfigComplete({ config, site: payload.site })),
          catchAjaxError(fetchSiteUiConfigFailed)
        )
      )
    ),
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(fetchSiteConfig.type),
      withLatestFrom(state$),
      filter(([, state]) => Boolean(state.sites.active)),
      exhaustMap(([, state]) =>
        fetchSiteConfigService(state.sites.active).pipe(
          switchMap((config) => {
            try {
              let localeCode = config.locale?.localeCode || state.uiConfig.locale.localeCode;
              let options = config.locale?.dateTimeFormatOptions || state.uiConfig.locale.dateTimeFormatOptions;
              new Intl.DateTimeFormat(localeCode, options);
              return [fetchSiteConfigComplete(config)];
            } catch (e) {
              return [
                fetchSiteConfigComplete({
                  ...config,
                  locale: {
                    ...config.locale,
                    localeCode: state.uiConfig.locale.localeCode,
                    dateTimeFormatOptions: state.uiConfig.locale.dateTimeFormatOptions
                  }
                }),
                showSystemNotification({
                  message: getIntl().formatMessage(configurationMessages.localeError, { message: (e as Error).message })
                })
              ];
            }
          }),
          catchAjaxError(fetchSiteConfigFailed)
        )
      )
    )
] as CrafterCMSEpic[];
