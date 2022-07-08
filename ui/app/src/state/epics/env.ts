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

import { Epic, ofType } from 'redux-observable';
import { filter, ignoreElements, map, switchMap, tap } from 'rxjs/operators';
import { fetchVersion } from '../../services/monitoring';
import { catchAjaxError } from '../../utils/ajax';
import { fetchSystemVersion, fetchSystemVersionComplete, fetchSystemVersionFailed } from '../actions/env';
import { setSiteSocketStatus, showSystemNotification } from '../actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { defineMessages } from 'react-intl';

const envMessages = defineMessages({
  socketConnectionIssue: {
    id: 'envMessages.socketConnectionIssue',
    defaultMessage: 'Socket connection was interrupted. Studio will continue to retry the connection.'
  }
});

export default [
  (action$) =>
    action$.pipe(
      ofType(fetchSystemVersion.type),
      switchMap(() =>
        fetchVersion().pipe(
          map((version) => fetchSystemVersionComplete(version)),
          catchAjaxError(fetchSystemVersionFailed)
        )
      )
    ),
  (action$, state$, { getIntl }) =>
    action$.pipe(
      ofType(setSiteSocketStatus.type),
      filter(({ payload }) => !payload.connected),
      tap(() => {
        const hostToHost$ = getHostToHostBus();
        hostToHost$.next(
          showSystemNotification({
            message: getIntl().formatMessage(envMessages.socketConnectionIssue),
            options: {
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center'
              }
            }
          })
        );
      }),
      ignoreElements()
    )
] as Epic[];
