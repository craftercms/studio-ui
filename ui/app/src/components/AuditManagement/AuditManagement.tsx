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

import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';
import Tooltip from '@material-ui/core/Tooltip';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { PagedArray } from '../../models/PagedArray';
import { ApiResponse } from '../../models/ApiResponse';
import { AuditLog } from '../../models/Audit';
import { fetchAudit } from '../../services/audit';
import { useLogicResource } from '../../utils/hooks';
import AuditGridUI from '../AuditGrid';

export default function AuditManagement() {
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [fetching, setFetching] = useState(false);
  const [auditLogs, setAuditLogs] = useState<PagedArray<AuditLog>>(null);
  const [error, setError] = useState<ApiResponse>();

  const refresh = useCallback(() => {
    setFetching(true);
    fetchAudit({ limit, offset }).subscribe(
      (logs) => {
        setAuditLogs(logs);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  }, [limit, offset]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resource = useLogicResource<
    PagedArray<AuditLog>,
    { auditLogs: PagedArray<AuditLog>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ auditLogs, error, fetching }), [auditLogs, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.auditLogs) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.auditLogs,
      errorSelector: () => error
    }
  );

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="GlobalMenu.Audit" defaultMessage="Audit" />}
        rightContent={
          <Tooltip title={<FormattedMessage id="auditManagement.openFilters" defaultMessage="Open filters" />}>
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterListRoundedIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <Fade in={showFilters}>
        <Paper elevation={1}>TODO: Filters</Paper>
      </Fade>
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <>TODO: AuditGridUISkeletonTable</>
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: <FormattedMessage id="auditGrid.emptyStateMessage" defaultMessage="No Logs Found" />
          }
        }}
      >
        <AuditGridUI resource={resource} />
      </SuspenseWithEmptyState>
    </section>
  );
}
