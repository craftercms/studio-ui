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
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { PagedArray } from '../../models/PagedArray';
import { ApiResponse } from '../../models/ApiResponse';
import { AuditLog } from '../../models/Audit';
import { AuditOptions, fetchAudit } from '../../services/audit';
import { useLogicResource, useMount, useSiteList, useSpreadState } from '../../utils/hooks';
import AuditGridUI from '../AuditGrid';
import User from '../../models/User';
import { fetchAll } from '../../services/users';
import { Operations, OperationsMessages } from './operations';

export default function AuditManagement() {
  const [fetching, setFetching] = useState(false);
  const [auditLogs, setAuditLogs] = useState<PagedArray<AuditLog>>(null);
  const [error, setError] = useState<ApiResponse>();
  const sites = useSiteList();
  const [users, setUsers] = useState<PagedArray<User>>();
  const [options, setOptions] = useSpreadState<AuditOptions>({
    offset: 0,
    limit: 10
  });
  const { formatMessage } = useIntl();

  const refresh = useCallback(() => {
    setFetching(true);
    fetchAudit(options).subscribe(
      (logs) => {
        setAuditLogs(logs);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  }, [options]);

  useMount(() => {
    fetchAll().subscribe((users) => {
      setUsers(users);
    });
  });

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

  const onChangePage = (page: number) => {
    setOptions({ offset: page * options.limit });
  };

  const onChangeRowsPerPage = (size: number) => {
    setOptions({ limit: size });
  };

  const onFilterChange = ({ id, value }: { id: string; value: string | string[] }) => {
    setOptions({ [id]: value });
  };

  return (
    <section>
      <GlobalAppToolbar title={<FormattedMessage id="GlobalMenu.Audit" defaultMessage="Audit" />} />
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
        <AuditGridUI
          resource={resource}
          sites={sites}
          users={users}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
          onFilterChange={onFilterChange}
          filters={options}
          operations={Operations.map((id) => ({ id, value: id, name: formatMessage(OperationsMessages[id]) }))}
          origins={[
            { id: 'GIT', name: 'GIT', value: 'GIT' },
            { id: 'API', name: 'API', value: 'API' }
          ]}
        />
      </SuspenseWithEmptyState>
    </section>
  );
}
