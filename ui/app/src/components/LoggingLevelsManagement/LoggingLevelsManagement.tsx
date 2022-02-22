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

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Logger, LoggerLevel } from '../../models/Logger';
import ApiResponse from '../../models/ApiResponse';
import { fetchLoggers as fetchLoggersService, setLogger } from '../../services/logs';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import LoggingLevelsGridUI, { LoggingLevelsGridSkeletonTable } from '../LoggingLevelsGrid';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import { useLogicResource } from '../../hooks/useLogicResource';
import Paper from '@mui/material/Paper';

const messages = defineMessages({
  levelChangedSuccess: {
    id: 'loggingLevelsManagement.levelChangedSuccessMessage',
    defaultMessage: 'Logging level changed successfully'
  }
});

export function LoggingLevelsManagement() {
  const [fetching, setFetching] = useState(false);
  const [loggers, setLoggers] = useState<Array<Logger>>(null);
  const [error, setError] = useState<ApiResponse>();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const fetchLoggers = useCallback(() => {
    setFetching(true);
    fetchLoggersService().subscribe(
      (loggers) => {
        setLoggers(loggers);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  }, []);

  useEffect(() => {
    fetchLoggers();
  }, [fetchLoggers]);

  const changeLevel = (logger: Logger, level: LoggerLevel) => {
    setLogger(logger.name, level).subscribe(
      () => {
        fetchLoggers();
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.levelChangedSuccess),
            options: { variant: 'success' }
          })
        );
      },
      (response) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const resource = useLogicResource<Array<Logger>, { loggers: Array<Logger>; error: ApiResponse; fetching: boolean }>(
    useMemo(() => ({ loggers, error, fetching }), [loggers, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.loggers) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.loggers,
      errorSelector: () => error
    }
  );

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar
        title={<FormattedMessage id="globalMenu.loggingLevelsEntryLabel" defaultMessage="Logging Levels" />}
      />
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <LoggingLevelsGridSkeletonTable />
        }}
      >
        <LoggingLevelsGridUI resource={resource} onChangeLevel={changeLevel} />
      </SuspenseWithEmptyState>
    </Paper>
  );
}

export default LoggingLevelsManagement;
