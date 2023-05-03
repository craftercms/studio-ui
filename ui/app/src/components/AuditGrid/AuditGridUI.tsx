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

import { AuditLogEntry, AuditLogEntryParameter } from '../../models/Audit';
import { PagedArray } from '../../models/PagedArray';
import Box from '@mui/material/Box';
import React, { useCallback, useMemo, useState } from 'react';
import { useStyles } from './styles';
import { DataGrid, DataGridProps, GridCellParams, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { AuditOptions } from '../../services/audit';
import { Site } from '../../models/Site';
import User from '../../models/User';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { getOffsetLeft, getOffsetTop } from '@mui/material/Popover';
import moment from 'moment-timezone';
import LookupTable from '../../models/LookupTable';
import { Button, Typography } from '@mui/material';
import EmptyState from '../EmptyState/EmptyState';
import AuditGridFilterPopover from '../AuditGridFilterPopover';
import { useLocale } from '../../hooks/useLocale';

export interface AuditGridUIProps {
  page: number;
  auditLogs: PagedArray<AuditLogEntry>;
  sites: Site[];
  users: PagedArray<User>;
  parametersLookup: LookupTable<AuditLogEntryParameter[]>;
  operations: { id: string; value: string; name: string }[];
  origins: { id: string; value: string; name: string }[];
  filters: AuditOptions;
  hasActiveFilters: boolean;
  timezones: string[];
  siteMode?: boolean;
  onPageChange(page: number): void;
  onResetFilters(): void;
  onResetFilter(id: string | string[]): void;
  onFetchParameters(id: number): void;
  onPageSizeChange(size: number): void;
  onFilterChange(filter: { id: string; value: string | string[] }): void;
}

export interface GridColumnMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  hideMenu: () => void;
  currentColumn: GridColDef;
  open: boolean;
  id?: string;
  labelledby?: string;
}

export const translations = defineMessages({
  timestamp: {
    id: 'auditGrid.timestamp',
    defaultMessage: 'Timestamp'
  },
  siteName: {
    id: 'auditGrid.siteName',
    defaultMessage: 'Project'
  },
  operation: {
    id: 'auditGrid.operation',
    defaultMessage: 'Operation'
  },
  targetValue: {
    id: 'auditGrid.targetValue',
    defaultMessage: 'Target Value'
  },
  targetType: {
    id: 'auditGrid.targetType',
    defaultMessage: 'Target Type'
  },
  username: {
    id: 'auditGrid.username',
    defaultMessage: 'Username'
  },
  name: {
    id: 'auditGrid.name',
    defaultMessage: 'Name'
  },
  origin: {
    id: 'auditGrid.origin',
    defaultMessage: 'Origin'
  },
  parameters: {
    id: 'auditGrid.parameters',
    defaultMessage: 'Parameters'
  }
});

export const fieldIdMapping = {
  operationTimestamp: 'operationTimestamp',
  siteName: 'siteId',
  actorId: 'user',
  origin: 'origin',
  operation: 'operations',
  primaryTargetValue: 'target'
};

export function AuditGridUI(props: AuditGridUIProps) {
  const {
    page,
    auditLogs,
    onPageChange,
    onPageSizeChange,
    onFilterChange,
    onResetFilter,
    onResetFilters,
    filters,
    sites,
    users,
    parametersLookup,
    operations,
    origins,
    timezones,
    onFetchParameters,
    hasActiveFilters,
    siteMode = false
  } = props;
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [openedFilter, setOpenedFilter] = useState<string>();
  const [timezone, setTimezone] = useState(moment.tz.guess());
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'operationTimestamp', sort: 'desc' }]);
  const localeBranch = useLocale();

  const onFilterSelected = (props: GridColumnMenuProps) => {
    if (props.open && anchorPosition === null) {
      setTimeout(() => {
        setOpenedFilter(props.currentColumn.field);
        const element = document.getElementById(props.labelledby);
        const anchorRect = element.getBoundingClientRect();
        const top = anchorRect.top + getOffsetTop(anchorRect, 'top');
        const left = anchorRect.left + getOffsetLeft(anchorRect, 'left');
        setAnchorPosition({ top, left });
      });
    }
    return null;
  };

  const onGetParameters = useCallback(
    (params: GridCellParams) => {
      onFetchParameters(params.id as number);
    },
    [onFetchParameters]
  );

  const onTimestampSortChanges = (model: GridSortModel) => {
    const newSort = model.find((m) => m.field === 'operationTimestamp').sort;
    const sort = sortModel.find((m) => m.field === 'operationTimestamp').sort;

    if (newSort !== sort) {
      setSortModel(model);
      onFilterChange({ id: 'order', value: newSort.toUpperCase() });
    }
  };

  const onTimezoneSelected = (timezone: string) => {
    setTimezone(timezone);
  };

  const onPopoverFilterChanges = (id, value) => {
    onFilterChange({ id, value: value === 'all' ? undefined : value });
  };

  const onPaginationModelChange = (newModel) => {
    onPageSizeChange(newModel.pageSize);
    onPageChange(newModel.page);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'operationTimestamp',
        headerName: formatMessage(translations.timestamp),
        width: 200,
        cellClassName: classes.cellRoot,
        renderCell: (params: GridCellParams) => {
          const date = new Intl.DateTimeFormat(localeBranch.localeCode, {
            ...localeBranch.dateTimeFormatOptions,
            timeZone: timezone
          }).format(new Date(params.value as Date));
          return (
            <Typography variant="body2" className={classes.ellipsis} title={date?.toString()}>
              {date}
            </Typography>
          );
        },
        headerClassName: (filters['dateFrom'] || filters['dateTo']) && classes.activeFilter
      },
      {
        field: 'siteName',
        headerName: formatMessage(translations.siteName),
        width: 150,
        sortable: false,
        cellClassName: classes.cellRoot,
        headerClassName: filters[fieldIdMapping['siteName']] && classes.activeFilter,
        hide: siteMode,
        renderCell: (params: GridCellParams) => {
          return (
            <Typography variant="body2" className={classes.ellipsis} title={params.value?.toString()}>
              {params.value as React.ReactNode}
            </Typography>
          );
        }
      },
      {
        field: 'actorId',
        headerName: formatMessage(translations.username),
        width: 150,
        sortable: false,
        cellClassName: classes.cellRoot,
        headerClassName: filters[fieldIdMapping['actorId']] && classes.activeFilter,
        renderCell: (params: GridCellParams) => {
          return (
            <Typography variant="body2" className={classes.ellipsis} title={params.value?.toString()}>
              {params.value as React.ReactNode}
            </Typography>
          );
        }
      },
      {
        field: 'operation',
        headerName: formatMessage(translations.operation),
        width: 150,
        sortable: false,
        cellClassName: classes.cellRoot,
        headerClassName: filters[fieldIdMapping['operation']] && classes.activeFilter,
        renderCell: (params: GridCellParams) => {
          return (
            <Typography variant="body2" className={classes.ellipsis} title={params.value?.toString()}>
              {params.value as React.ReactNode}
            </Typography>
          );
        }
      },
      {
        field: 'primaryTargetValue',
        headerName: formatMessage(translations.targetValue),
        width: 300,
        sortable: false,
        cellClassName: classes.cellRoot,
        headerClassName: filters[fieldIdMapping['primaryTargetValue']] && classes.activeFilter,
        renderCell: (params: GridCellParams) => {
          return (
            <Typography variant="body2" className={classes.ellipsis} title={params.value?.toString()}>
              {params.value as React.ReactNode}
            </Typography>
          );
        }
      },
      {
        field: 'primaryTargetType',
        headerName: formatMessage(translations.targetType),
        width: 150,
        disableColumnMenu: true,
        sortable: false,
        cellClassName: classes.cellRoot,
        renderCell: (params: GridCellParams) => {
          return (
            <Typography variant="body2" className={classes.ellipsis} title={params.value?.toString()}>
              {params.value as React.ReactNode}
            </Typography>
          );
        }
      },
      {
        field: 'actorDetails',
        headerName: formatMessage(translations.name),
        width: 100,
        disableColumnMenu: true,
        sortable: false,
        cellClassName: classes.cellRoot,
        renderCell: (params: GridCellParams) => {
          return (
            <Typography variant="body2" className={classes.ellipsis} title={params.value?.toString()}>
              {params.value as React.ReactNode}
            </Typography>
          );
        }
      },
      {
        field: 'origin',
        headerName: formatMessage(translations.origin),
        width: 100,
        sortable: false,
        cellClassName: classes.cellRoot,
        headerClassName: filters[fieldIdMapping['origin']] && classes.activeFilter,
        renderCell: (params: GridCellParams) => {
          return (
            <Typography variant="body2" className={classes.ellipsis} title={params.value?.toString()}>
              {params.value as React.ReactNode}
            </Typography>
          );
        }
      },
      {
        field: 'parameters',
        headerName: formatMessage(translations.parameters),
        width: 105,
        disableColumnMenu: true,
        renderCell: (params: GridCellParams) => {
          return parametersLookup[params.id] === undefined || parametersLookup[params.id]?.length ? (
            <Tooltip title={<FormattedMessage id="auditGrid.showParameters" defaultMessage="Show parameters" />}>
              <IconButton onClick={() => onGetParameters(params)} size="large">
                <VisibilityRoundedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Typography color="textSecondary" variant="caption">
              (<FormattedMessage id="auditGrid.noParameters" defaultMessage="No parameters" />)
            </Typography>
          );
        },
        sortable: false,
        cellClassName: classes.cellRoot
      }
    ],
    [
      classes.activeFilter,
      classes.cellRoot,
      classes.ellipsis,
      filters,
      formatMessage,
      localeBranch.dateTimeFormatOptions,
      localeBranch.localeCode,
      onGetParameters,
      parametersLookup,
      siteMode,
      timezone
    ]
  );

  return (
    <Box display="flex">
      <DataGrid
        sortingOrder={['desc', 'asc']}
        sortModel={sortModel}
        sortingMode="server"
        autoHeight={Boolean(auditLogs.length)}
        disableColumnFilter
        className={classes.gridRoot}
        components={{
          ColumnMenu: onFilterSelected,
          NoRowsOverlay: () => (
            <Box height="100%">
              <EmptyState
                styles={{
                  root: {
                    position: 'relative',
                    zIndex: 1,
                    paddingTop: 10,
                    paddingBottom: 10,
                    margin: 0,
                    height: 'calc(100% - 10px)'
                  }
                }}
                title={<FormattedMessage id="auditGrid.emptyStateMessage" defaultMessage="No Logs Found" />}
              >
                {hasActiveFilters && (
                  <Button variant="text" color="primary" onClick={onResetFilters}>
                    <FormattedMessage id="auditGrid.clearFilters" defaultMessage="Clear filters" />
                  </Button>
                )}
              </EmptyState>
            </Box>
          )
        }}
        disableRowSelectionOnClick
        disableColumnSelector
        rows={auditLogs}
        columns={columns}
        paginationModel={{ page, pageSize: auditLogs.limit }}
        onSortModelChange={onTimestampSortChanges}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[5, 10, 15]}
        paginationMode="server"
        rowCount={auditLogs.total}
      />
      <AuditGridFilterPopover
        open={Boolean(anchorPosition)}
        anchorPosition={anchorPosition}
        onClose={() => setAnchorPosition(null)}
        filterId={fieldIdMapping[openedFilter]}
        onResetFilter={onResetFilter}
        onFilterChange={onPopoverFilterChanges}
        value={filters[fieldIdMapping[openedFilter]]}
        dateFrom={filters['dateFrom']}
        dateTo={filters['dateTo']}
        timezone={timezone}
        onTimezoneSelected={onTimezoneSelected}
        options={{
          users,
          sites,
          operations,
          origins,
          timezones
        }}
      />
    </Box>
  );
}

export default AuditGridUI;
