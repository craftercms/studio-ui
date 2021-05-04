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

import { Resource } from '../../models/Resource';
import { AuditLogEntry, LogParameters } from '../../models/Audit';
import { PagedArray } from '../../models/PagedArray';
import Box from '@material-ui/core/Box';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { styles } from './styles';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridOverlay,
  GridPageChangeParams,
  GridSortModel,
  GridSortModelParams
} from '@material-ui/data-grid';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { AuditOptions } from '../../services/audit';
import { Site } from '../../models/Site';
import User from '../../models/User';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
// @ts-ignore
import { getOffsetLeft, getOffsetTop } from '@material-ui/core/Popover/Popover';
import { useDebouncedInput, useLocale } from '../../utils/hooks';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { KeyboardDatePicker } from '@material-ui/pickers/DatePicker';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import moment from 'moment-timezone';
import { MuiPickersUtilsProvider } from '@material-ui/pickers/MuiPickersUtilsProvider';
import DateFnsUtils from '@date-io/date-fns';
import LookupTable from '../../models/LookupTable';
import { Button, Typography } from '@material-ui/core';
import EmptyState from '../SystemStatus/EmptyState';
import { nnou } from '../../utils/object';

export interface AuditGridUIProps {
  resource: Resource<PagedArray<AuditLogEntry>>;
  sites: Site[];
  users: PagedArray<User>;
  parametersLookup: LookupTable<LogParameters[]>;
  operations: { id: string; value: string; name: string }[];
  origins: { id: string; value: string; name: string }[];
  onChangePage(page: number): void;
  onResetFilters(reset: AuditOptions): void;
  onFetchParameters(id: number): void;
  onChangeRowsPerPage(size: number): void;
  onFilterChange(filter: { id: string; value: string | string[] }): void;
  filters: AuditOptions;
  timezones: string[];
}

export interface GridColumnMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  hideMenu: () => void;
  currentColumn: GridColDef;
  open: boolean;
  id?: string;
  labelledby?: string;
}

const translations = defineMessages({
  timestamp: {
    id: 'auditGrid.timestamp',
    defaultMessage: 'Timestamp'
  },
  siteName: {
    id: 'auditGrid.siteName',
    defaultMessage: 'Site'
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
  },
  clusterNode: {
    id: 'auditGrid.clusterNode',
    defaultMessage: 'Cluster Node'
  },
  searchPlaceholder: {
    id: 'auditGrid.searchPlaceholder',
    defaultMessage: 'Search...'
  }
});

export default function AuditGridUI(props: AuditGridUIProps) {
  const {
    resource,
    onChangePage,
    onChangeRowsPerPage,
    onFilterChange,
    onResetFilters,
    filters,
    sites,
    users,
    parametersLookup,
    operations,
    origins,
    timezones,
    onFetchParameters
  } = props;
  const auditLogs = resource.read();
  const classes = styles();
  const { formatMessage } = useIntl();
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [activeFilter, setActiveFilter] = useState<string>();
  const [fromDate, setFromDate] = useState(moment());
  const [toDate, setToDate] = useState(moment());
  const [targetValue, setTargetValue] = useState('');
  const [clusterNode, setClusterNode] = useState('');
  const [timeZone, setTimeZone] = useState(moment.tz.guess());
  const [sortModel, setSortModel] = React.useState<GridSortModel>([{ field: 'operationTimestamp', sort: 'desc' }]);
  const localeBranch = useLocale();

  const hasFilters = Object.keys(filters).some((key) => {
    return !['limit', 'offset', 'sort'].includes(key) && nnou(filters[key]);
  });

  const onFilterSelected = (props: GridColumnMenuProps) => {
    if (props.open && anchorPosition === null) {
      setTimeout(() => {
        props.hideMenu();
        setActiveFilter(props.currentColumn.field);
        const element = document.querySelector(`#${props.labelledby}`);
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

  const onPageChange = (param: GridPageChangeParams) => {
    onChangePage(param.page);
  };

  const onPageSizeChange = (param: GridPageChangeParams) => {
    onChangeRowsPerPage(param.pageSize);
  };

  const onTimestampSortChanges = ({ sortModel: nextSortModel }: GridSortModelParams) => {
    if (nextSortModel !== sortModel) {
      const sort = nextSortModel.find((model) => model.field === 'operationTimestamp').sort;
      setSortModel(nextSortModel);
      if (sort === 'asc') {
        onFilterChange({ id: 'order', value: sort.toUpperCase() });
      } else {
        onFilterChange({ id: 'order', value: undefined });
      }
    }
  };

  const onSiteSelected = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setAnchorPosition(null);
    onFilterChange({ id: 'siteId', value: e.target.value === 'all' ? undefined : e.target.value });
  };

  const onUsernameSelected = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setAnchorPosition(null);
    onFilterChange({ id: 'user', value: e.target.value === 'all' ? undefined : e.target.value });
  };

  const onOriginSelected = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setAnchorPosition(null);
    onFilterChange({ id: 'origin', value: e.target.value === 'all' ? undefined : e.target.value });
  };

  const onOperationSelected = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.target.value.includes('clear')) {
      onFilterChange({ id: 'operations', value: undefined });
    } else {
      // @ts-ignore
      onFilterChange({ id: 'operations', value: e.target.value.join() });
    }
  };

  const onSearch = useCallback(
    (keywords: string) =>
      onFilterChange({
        id: activeFilter === 'primaryTargetValue' ? 'target' : 'clusterNodeId',
        value: keywords === '' ? undefined : keywords
      }),
    [onFilterChange, activeFilter]
  );

  const onSearch$ = useDebouncedInput(onSearch, 400);

  const onTargetValueChanged = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onSearch$.next(e.target.value);
    setTargetValue(e.target.value);
  };

  const onClusterNodeChanged = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onSearch$.next(e.target.value);
    setClusterNode(e.target.value);
  };

  const onTimezoneSelected = (timezone: string) => {
    setTimeZone(timezone);
  };

  const onFromDateSelected = (date: MaterialUiPickersDate | null, value?: string | null) => {
    onFilterChange({ id: 'dateFrom', value: date ? moment(date).format() : undefined });
    setFromDate(date);
  };

  const onToDateSelected = (date: MaterialUiPickersDate | null, value?: string | null) => {
    onFilterChange({ id: 'dateTo', value: date ? moment(date).format() : undefined });
    setToDate(date);
  };

  const onResetFiltersClick = () => {
    const { limit, offset, sort, ...rest } = filters;

    Object.keys(rest).forEach((key) => {
      rest[key] = undefined;
    });

    onResetFilters({ limit, offset, sort, ...rest });
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
            timeZone
          }).format(new Date(params.value as Date));
          return <>{date}</>;
        }
      },
      {
        field: 'siteName',
        headerName: formatMessage(translations.siteName),
        width: 150,
        sortable: false,
        cellClassName: classes.cellRoot
      },
      {
        field: 'actorId',
        headerName: formatMessage(translations.username),
        width: 150,
        sortable: false,
        cellClassName: classes.cellRoot
      },
      {
        field: 'operation',
        headerName: formatMessage(translations.operation),
        width: 150,
        sortable: false,
        cellClassName: classes.cellRoot
      },
      {
        field: 'primaryTargetValue',
        headerName: formatMessage(translations.targetValue),
        width: 300,
        sortable: false,
        cellClassName: classes.cellRoot
      },
      {
        field: 'primaryTargetType',
        headerName: formatMessage(translations.targetType),
        width: 150,
        disableColumnMenu: true,
        sortable: false,
        cellClassName: classes.cellRoot
      },
      {
        field: 'actorDetails',
        headerName: formatMessage(translations.name),
        width: 100,
        disableColumnMenu: true,
        sortable: false,
        cellClassName: classes.cellRoot
      },
      {
        field: 'origin',
        headerName: formatMessage(translations.origin),
        width: 100,
        sortable: false,
        cellClassName: classes.cellRoot
      },
      {
        field: 'parameters',
        headerName: formatMessage(translations.parameters),
        width: 105,
        disableColumnMenu: true,
        renderCell: (params: GridCellParams) => {
          return parametersLookup[params.id] === undefined || parametersLookup[params.id]?.length ? (
            <Tooltip title={<FormattedMessage id="auditGrid.showParameters" defaultMessage="Show parameters" />}>
              <IconButton onClick={() => onGetParameters(params)}>
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
      },
      {
        field: 'clusterNode',
        headerName: formatMessage(translations.clusterNode),
        width: 200,
        sortable: false,
        cellClassName: classes.cellRoot
      }
    ],
    [
      classes.cellRoot,
      formatMessage,
      localeBranch.dateTimeFormatOptions,
      localeBranch.localeCode,
      onGetParameters,
      parametersLookup,
      timeZone
    ]
  );

  return (
    <Box display="flex">
      <DataGrid
        sortingOrder={['desc', 'asc']}
        sortModel={sortModel}
        sortingMode="server"
        autoHeight
        disableColumnFilter
        onCellClick={() => {}}
        className={classes.gridRoot}
        components={{
          ColumnMenu: onFilterSelected,
          NoRowsOverlay: () => (
            <GridOverlay className={classes.gridOverlay}>
              <EmptyState title={<FormattedMessage id="auditGrid.emptyStateMessage" defaultMessage="No Logs Found" />}>
                {hasFilters && (
                  <Button variant="text" color="primary" onClick={onResetFiltersClick}>
                    <FormattedMessage id="auditGrid.clearFilters" defaultMessage="Reset filters" />
                  </Button>
                )}
              </EmptyState>
            </GridOverlay>
          )
        }}
        disableSelectionOnClick
        disableColumnSelector
        rows={auditLogs}
        columns={columns}
        pageSize={10}
        onSortModelChange={onTimestampSortChanges}
        onPageSizeChange={onPageSizeChange}
        rowsPerPageOptions={[5, 10, 15]}
        paginationMode="server"
        onPageChange={onPageChange}
        rowCount={auditLogs.total}
      />
      <Popover
        open={Boolean(anchorPosition)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        onClose={() => setAnchorPosition(null)}
        classes={{ paper: classes.popover }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        {activeFilter === 'operationTimestamp' && (
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <form className={classes.popoverForm} noValidate autoComplete="off">
              <Box display="flex">
                <KeyboardDatePicker
                  className={classes.fromDatePicker}
                  margin="normal"
                  label="From"
                  format="MM/dd/yyyy"
                  value={fromDate}
                  onChange={onFromDateSelected}
                />
                <KeyboardDatePicker
                  margin="normal"
                  label="To"
                  format="MM/dd/yyyy"
                  value={toDate}
                  onChange={onToDateSelected}
                />
              </Box>
              <Autocomplete
                disableClearable
                options={timezones}
                getOptionLabel={(option) => option}
                value={timeZone}
                onChange={(e: React.ChangeEvent<{}>, value) => {
                  onTimezoneSelected(value);
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={<FormattedMessage id="auditGrid.timezone" defaultMessage="Timezone" />}
                    variant="outlined"
                  />
                )}
              />
            </form>
          </MuiPickersUtilsProvider>
        )}
        {activeFilter === 'siteName' && (
          <TextField
            fullWidth
            select
            label={<FormattedMessage id="auditGrid.filterBySite" defaultMessage="Filter by Site" />}
            value={Boolean(filters?.['siteId']) ? filters['siteId'] : 'all'}
            onChange={onSiteSelected}
          >
            <MenuItem key={'all'} value="all">
              <FormattedMessage id="auditGrid.allSites" defaultMessage="All Sites" />
            </MenuItem>
            <MenuItem key={'studio_root'} value={'studio_root'}>
              {'System'}
            </MenuItem>
            {sites.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        {activeFilter === 'actorId' && (
          <TextField
            fullWidth
            select
            label={<FormattedMessage id="auditGrid.filterByUser" defaultMessage="Filter by User" />}
            value={Boolean(filters?.['user']) ? filters['user'] : 'all'}
            onChange={onUsernameSelected}
          >
            <MenuItem key={'all'} value="all">
              <FormattedMessage id="auditGrid.allUsers" defaultMessage="All Users" />
            </MenuItem>
            {users.map((option) => (
              <MenuItem key={option.id} value={option.username}>
                {option.username}
              </MenuItem>
            ))}
          </TextField>
        )}
        {activeFilter === 'origin' && (
          <TextField
            fullWidth
            select
            label={<FormattedMessage id="auditGrid.filterByOrigin" defaultMessage="Filter by Origin" />}
            value={Boolean(filters?.['origin']) ? filters['origin'] : 'all'}
            onChange={onOriginSelected}
          >
            <MenuItem key={'all'} value="all">
              <FormattedMessage id="auditGrid.allOrigins" defaultMessage="All Origins" />
            </MenuItem>
            {origins.map((option) => (
              <MenuItem key={option.id} value={option.value}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        {activeFilter === 'operation' && (
          <TextField
            fullWidth
            select
            label={<FormattedMessage id="auditGrid.filterByOperation" defaultMessage="Filter by Operation" />}
            value={filters?.['operations']?.split(',') ?? []}
            SelectProps={{ multiple: true }}
            onChange={onOperationSelected}
          >
            <MenuItem key={'all'} value="clear">
              <FormattedMessage id="auditGrid.allOperations" defaultMessage="All Operations" />
            </MenuItem>
            {operations.map((option) => (
              <MenuItem key={option.id} value={option.value}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        {activeFilter === 'primaryTargetValue' && (
          <TextField
            value={targetValue}
            label={<FormattedMessage id="auditGrid.filterByTarget" defaultMessage="Filter by Target Value" />}
            placeholder={formatMessage(translations.searchPlaceholder)}
            fullWidth
            onChange={onTargetValueChanged}
          />
        )}
        {activeFilter === 'clusterNode' && (
          <TextField
            value={clusterNode}
            label={<FormattedMessage id="auditGrid.filterByCluster" defaultMessage="Filter by Cluster Node" />}
            placeholder={formatMessage(translations.searchPlaceholder)}
            fullWidth
            onChange={onClusterNodeChanged}
          />
        )}
      </Popover>
    </Box>
  );
}
