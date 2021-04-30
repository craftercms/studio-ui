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
import { AuditLog } from '../../models/Audit';
import { PagedArray } from '../../models/PagedArray';
import Box from '@material-ui/core/Box';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { styles } from './styles';
import { DataGrid, GridCellParams, GridColDef, GridPageChangeParams } from '@material-ui/data-grid';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { AuditOptions, fetchSpecificAudit } from '../../services/audit';
import { Site } from '../../models/Site';
import User from '../../models/User';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
// @ts-ignore
import { getOffsetLeft, getOffsetTop } from '@material-ui/core/Popover/Popover';
import { useDebouncedInput } from '../../utils/hooks';

export interface AuditGridUIProps {
  resource: Resource<PagedArray<AuditLog>>;
  sites: Site[];
  users: PagedArray<User>;
  operations: { id: string; value: string; name: string }[];
  origins: { id: string; value: string; name: string }[];
  onChangePage(page: number): void;
  onChangeRowsPerPage(size: number): void;
  onFilterChange(filter: { id: string; value: string | string[] }): void;
  filters: AuditOptions;
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
  }
});

export default function AuditGridUI(props: AuditGridUIProps) {
  const {
    resource,
    onChangePage,
    onChangeRowsPerPage,
    onFilterChange,
    filters,
    sites,
    users,
    operations,
    origins
  } = props;
  const auditLogs = resource.read();
  const classes = styles();
  const { formatMessage } = useIntl();
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [activeFilter, setActiveFilter] = useState<string>();
  const [targetValue, setTargetValue] = useState('');
  const [clusterNode, setClusterNode] = useState('');

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

  const onGetParameters = (params: GridCellParams) => {
    fetchSpecificAudit(params.id as number).subscribe((response) => {
      console.log(response);
    });
  };

  const onPageChange = (param: GridPageChangeParams) => {
    onChangePage(param.page);
  };

  const onPageSizeChange = (param: GridPageChangeParams) => {
    onChangeRowsPerPage(param.pageSize);
  };

  const onSiteSelected = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setAnchorPosition(null);
    onFilterChange({ id: 'siteId', value: e.target.value === 'all' ? '' : e.target.value });
  };

  const onUsernameSelected = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setAnchorPosition(null);
    onFilterChange({ id: 'username', value: e.target.value });
  };

  const onOriginSelected = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setAnchorPosition(null);
    onFilterChange({ id: 'origin', value: e.target.value });
  };

  const onOperationSelected = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.target.value.includes('clear')) {
      onFilterChange({ id: 'operations', value: null });
    } else {
      // @ts-ignore
      onFilterChange({ id: 'operations', value: e.target.value.join() });
    }
  };

  const onSearch = useCallback(
    (keywords: string) =>
      onFilterChange({ id: activeFilter === 'primaryTargetValue' ? 'target' : 'clusterNodeId', value: keywords }),
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

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'operationTimestamp',
        headerName: formatMessage(translations.timestamp),
        width: 200,
        sortable: false,
        cellClassName: classes.cellRoot
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
          return (
            <Tooltip title={<FormattedMessage id="auditGrid.showParameters" defaultMessage="Show parameters" />}>
              <IconButton onClick={() => onGetParameters(params)}>
                <VisibilityRoundedIcon />
              </IconButton>
            </Tooltip>
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
    [classes.cellRoot, formatMessage]
  );

  return (
    <Box height="500px">
      <DataGrid
        disableColumnFilter
        onCellClick={() => {}}
        className={classes.gridRoot}
        components={{ ColumnMenu: onFilterSelected }}
        disableSelectionOnClick
        disableColumnSelector
        rows={auditLogs}
        columns={columns}
        pageSize={10}
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
        {activeFilter === 'siteName' && (
          <TextField
            fullWidth
            select
            label="Filter by Site"
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
            label="Filter by User"
            value={Boolean(filters?.['actorId']) ? filters['actorId'] : 'all'}
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
            label="Filter by Origin"
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
            label="Filter by Operation"
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
            label="Filter by Target Value"
            placeholder="Search..."
            fullWidth
            onChange={onTargetValueChanged}
          />
        )}
        {activeFilter === 'clusterNode' && (
          <TextField
            value={clusterNode}
            label="Filter by Cluster Node"
            placeholder="Search..."
            fullWidth
            onChange={onClusterNodeChanged}
          />
        )}
      </Popover>
    </Box>
  );
}
