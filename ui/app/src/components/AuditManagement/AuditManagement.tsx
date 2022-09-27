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

import GlobalAppToolbar from '../GlobalAppToolbar/GlobalAppToolbar';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useCallback, useEffect, useState } from 'react';
import { PagedArray } from '../../models/PagedArray';
import { ApiResponse } from '../../models/ApiResponse';
import { AuditLogEntry, AuditLogEntryParameter } from '../../models/Audit';
import { AuditOptions, fetchAuditLog, fetchAuditLogEntry } from '../../services/audit';
import AuditGridUI from '../AuditGrid';
import User from '../../models/User';
import { fetchAll } from '../../services/users';
import { Operations, OperationsMessages } from './operations';
import moment from 'moment-timezone';
import LookupTable from '../../models/LookupTable';
import AuditLogEntryParametersDialog from '../AuditLogEntryParametersDialog';
import { nnou } from '../../utils/object';
import Button from '@mui/material/Button';
import AuditGridSkeleton from '../AuditGrid/AuditGridSkeleton';
import { useMount } from '../../hooks/useMount';
import { useSpreadState } from '../../hooks/useSpreadState';
import { useSiteList } from '../../hooks/useSiteList';
import Paper from '@mui/material/Paper';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';

interface AuditManagementProps {
  site?: string;
  embedded?: boolean;
  showAppsButton?: boolean;
}

export function AuditManagement(props: AuditManagementProps) {
  const { site, embedded, showAppsButton } = props;
  const [auditLogs, setAuditLogs] = useState<PagedArray<AuditLogEntry>>(null);
  const [error, setError] = useState<ApiResponse>();
  const sites = useSiteList();
  const [users, setUsers] = useState<PagedArray<User>>();
  const [options, setOptions] = useSpreadState<AuditOptions>({
    offset: 0,
    limit: 10,
    sort: 'date',
    siteId: site
  });
  const [parametersLookup, setParametersLookup] = useSpreadState<LookupTable<AuditLogEntryParameter[]>>({});
  const [dialogParams, setDialogParams] = useState<AuditLogEntryParameter[]>([]);
  const { formatMessage } = useIntl();
  const hasActiveFilters = Object.keys(options).some((key) => {
    return (
      !(Boolean(site) ? ['limit', 'offset', 'sort', 'siteId'] : ['limit', 'offset', 'sort']).includes(key) &&
      nnou(options[key])
    );
  });
  const [page, setPage] = useState(0);
  const auditLogEntryParametersDialogState = useEnhancedDialogState();
  const dispatch = useDispatch();

  const refresh = useCallback(() => {
    fetchAuditLog(options).subscribe({
      next: (logs) => {
        setAuditLogs(logs);
      },
      error: ({ response }) => {
        setError(response.response);
      }
    });
  }, [options]);

  useMount(() => {
    fetchAll().subscribe((users) => {
      setUsers(users);
    });
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onPageChange = (pageNumber: number) => {
    setPage(pageNumber);
    setOptions({ offset: pageNumber * options.limit });
  };

  const onPageSizeChange = (pageSize: number) => {
    setPage(0);
    setOptions({ offset: 0, limit: pageSize });
  };

  const onFilterChange = ({ id, value }: { id: string; value: string | string[] }) => {
    setPage(0);
    setOptions({ [id]: value, offset: 0 });
  };

  const onResetFilter = (id: string | string[]) => {
    let filters = {};
    if (Array.isArray(id)) {
      id.forEach((key) => {
        filters[key] = undefined;
      });
    } else {
      filters[id] = undefined;
    }
    setOptions(filters);
  };

  const onResetFilters = () => {
    const { limit, offset, sort, siteId, ...rest } = options;
    Object.keys(rest).forEach((key) => {
      rest[key] = undefined;
    });
    setOptions({ limit, offset, sort, siteId: Boolean(site) ? site : undefined, ...rest });
  };

  const onFetchParameters = (id: number) => {
    if (parametersLookup[id]?.length) {
      setDialogParams(parametersLookup[id]);
      auditLogEntryParametersDialogState.onOpen();
    } else {
      fetchAuditLogEntry(id).subscribe({
        next(response) {
          setParametersLookup({ [id]: response.parameters });
          if (response.parameters.length) {
            setDialogParams(response.parameters);
            auditLogEntryParametersDialogState.onOpen();
          }
        },
        error({ response }) {
          dispatch(showErrorDialog({ error: response.response }));
        }
      });
    }
  };

  const onShowParametersDialogClosed = () => {
    setDialogParams([]);
  };

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar
        title={!embedded && <FormattedMessage id="GlobalMenu.Audit" defaultMessage="Audit" />}
        rightContent={
          <Button disabled={!hasActiveFilters} variant="text" color="primary" onClick={() => onResetFilters()}>
            <FormattedMessage id="auditGrid.clearFilters" defaultMessage="Clear filters" />
          </Button>
        }
        showHamburgerMenuButton={!embedded}
        showAppsButton={showAppsButton}
      />
      {error ? (
        <ApiResponseErrorState error={error} />
      ) : auditLogs ? (
        <AuditGridUI
          page={page}
          auditLogs={auditLogs}
          sites={sites}
          users={users}
          siteMode={Boolean(site)}
          parametersLookup={parametersLookup}
          onFetchParameters={onFetchParameters}
          onPageChange={onPageChange}
          onResetFilters={onResetFilters}
          onResetFilter={onResetFilter}
          onPageSizeChange={onPageSizeChange}
          onFilterChange={onFilterChange}
          filters={options}
          hasActiveFilters={hasActiveFilters}
          timezones={moment.tz.names()}
          operations={Operations.map((id) => ({ id, value: id, name: formatMessage(OperationsMessages[id]) }))}
          origins={[
            { id: 'GIT', name: 'GIT', value: 'GIT' },
            { id: 'API', name: 'API', value: 'API' }
          ]}
        />
      ) : (
        <AuditGridSkeleton siteMode={Boolean(site)} numOfItems={auditLogs?.length ?? 10} filters={options} />
      )}
      <AuditLogEntryParametersDialog
        open={auditLogEntryParametersDialogState.open}
        onClose={auditLogEntryParametersDialogState.onClose}
        onClosed={onShowParametersDialogClosed}
        parameters={dialogParams}
        hasPendingChanges={auditLogEntryParametersDialogState.hasPendingChanges}
        isMinimized={auditLogEntryParametersDialogState.isMinimized}
        isSubmitting={auditLogEntryParametersDialogState.isSubmitting}
      />
    </Paper>
  );
}

export default AuditManagement;
