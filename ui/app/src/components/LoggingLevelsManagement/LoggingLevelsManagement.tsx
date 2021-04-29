/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Logger, LoggerLevel } from '../../models/Logger';
import ApiResponse from '../../models/ApiResponse';
import { fetchLoggers as fetchLoggersService, setLogger } from '../../services/logs';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import { useLogicResource } from '../../utils/hooks';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import LoggingLevelsGridUI, { LoggingLevelsGridSkeletonTable } from '../LoggingLevelsGrid';

export default function LoggingLevelsManagement() {
  const [fetching, setFetching] = useState(false);
  const [loggers, setLoggers] = useState<Array<Logger>>(null);
  const [error, setError] = useState<ApiResponse>();

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
    logger.level = level;
    setLogger(logger.name, level).subscribe(
      () => {
        fetchLoggers();
      },
      () => {}
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
    <section>
      <GlobalAppToolbar title={<FormattedMessage id="GlobalMenu.Users" defaultMessage="Logging Levels" />} />
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <LoggingLevelsGridSkeletonTable />
        }}
      >
        <LoggingLevelsGridUI resource={resource} onChangeLevel={changeLevel} />
      </SuspenseWithEmptyState>
    </section>
  );
}
