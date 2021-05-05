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

import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import Popover from '@material-ui/core/Popover';
import styles from './styles';
import TextField from '@material-ui/core/TextField';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import { Site } from '../../models/Site';
import { PagedArray } from '../../models/PagedArray';
import User from '../../models/User';
import { useDebouncedInput } from '../../utils/hooks';
import Box from '@material-ui/core/Box';
import moment from 'moment-timezone';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

interface AuditGridFilterPopoverProps {
  open: boolean;
  filterId: 'operationTimestamp' | 'siteId' | 'user' | 'origin' | 'operations' | 'target' | 'clusterNodeId';
  anchorPosition: {
    top: number;
    left: number;
  };
  value?: string;
  dateFrom?: string;
  dateTo?: string;
  timezone?: string;
  options?: {
    sites: Site[];
    users: PagedArray<User>;
    operations: { id: string; value: string; name: string }[];
    origins: { id: string; value: string; name: string }[];
    timezones: string[];
  };
  onClose(): void;
  onTimezoneSelected(timezone: string): void;
  onFilterChange(fieldId: string, value: any): void;
}

const translations = defineMessages({
  siteId: {
    id: 'auditGridFilterPopover.filterBySite',
    defaultMessage: 'Filter by Site'
  },
  user: {
    id: 'auditGridFilterPopover.filterByUser',
    defaultMessage: 'Filter by User'
  },
  origin: {
    id: 'auditGridFilterPopover.filterByOrigin',
    defaultMessage: 'Filter by Origin'
  },
  operations: {
    id: 'auditGridFilterPopover.filterByOperations',
    defaultMessage: 'Filter by Operations'
  },
  target: {
    id: 'auditGridFilterPopover.filterByTarget',
    defaultMessage: 'Filter by Target Value'
  },
  clusterNodeId: {
    id: 'auditGridFilterPopover.filterByCluster',
    defaultMessage: 'Filter by Cluster Node'
  },
  allOperations: {
    id: 'auditGridFilterPopover.allOperations',
    defaultMessage: 'All Operations'
  }
});

export default function AuditGridFilterPopover(props: AuditGridFilterPopoverProps) {
  const { open, anchorPosition, onClose } = props;
  const classes = styles();
  return (
    <Popover
      open={open}
      anchorPosition={anchorPosition}
      anchorReference="anchorPosition"
      onClose={onClose}
      classes={{ paper: classes.popover }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      <AuditGridFilterPopoverContainer {...props} />
    </Popover>
  );
}

export function AuditGridFilterPopoverContainer(props: AuditGridFilterPopoverProps) {
  const { filterId, value, onFilterChange, timezone, onTimezoneSelected } = props;
  const classes = styles();
  const { sites, users, operations, origins, timezones } = props.options;
  const { formatMessage } = useIntl();
  const [keyword, setKeyword] = useState(props.value ?? '');
  const [fromDate, setFromDate] = useState(props.dateFrom ? moment(props.dateFrom) : null);
  const [toDate, setToDate] = useState(props.dateTo ? moment(props.dateTo) : null);
  const onSearch = useCallback((keywords: string) => onFilterChange(filterId, keywords), [onFilterChange, filterId]);

  const onSearch$ = useDebouncedInput(onSearch, 400);

  const options = useMemo<{ id: string; value: string; name: string | React.ReactNode }[]>(() => {
    switch (filterId) {
      case 'siteId': {
        return [
          {
            id: 'all',
            value: 'all',
            name: <FormattedMessage id="auditGrid.allSites" defaultMessage="All Sites" />
          },
          {
            id: 'studio_root',
            value: 'studio_root',
            name: <FormattedMessage id="words.system" defaultMessage="System" />
          },
          ...sites.map((site) => ({ id: site.id, name: site.name, value: site.id }))
        ];
      }
      case 'user': {
        return [
          {
            id: 'all',
            value: 'all',
            name: <FormattedMessage id="auditGrid.allUsers" defaultMessage="All Users" />
          },
          ...users.map((user) => ({ id: user.id.toString(), name: user.username, value: user.username }))
        ];
      }
      case 'origin': {
        return [
          {
            id: 'all',
            value: 'all',
            name: <FormattedMessage id="auditGrid.allOrigins" defaultMessage="All Origins" />
          },
          ...origins
        ];
      }
      case 'operations': {
        return [
          {
            id: 'all',
            value: 'all',
            name: formatMessage(translations.allOperations)
          },
          ...operations
        ];
      }
    }
  }, [filterId, formatMessage, operations, origins, sites, users]);

  const onTextFieldChanges = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onSearch$.next(e.target.value);
    setKeyword(e.target.value);
  };

  const onMultipleSelectChanges = (e: React.ChangeEvent<{ value: any }>) => {
    const lastString = e.target.value[e.target.value.length - 1];
    if (lastString === 'all' || e.target.value.length === 0) {
      onFilterChange(filterId, 'all');
    } else {
      const values = e.target.value.filter((value) => value !== 'all');
      onFilterChange(filterId, values.join());
    }
  };

  const onFromDateSelected = (date: MaterialUiPickersDate) => {
    onFilterChange('dateFrom', date ? moment(date).format() : 'all');
    setFromDate(date);
  };

  const onToDateSelected = (date: MaterialUiPickersDate) => {
    onFilterChange('dateTo', date ? moment(date).format() : 'all');
    setToDate(date);
  };

  return (
    <>
      {filterId === 'operationTimestamp' && (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <form className={classes.popoverForm} noValidate autoComplete="off">
            <Box display="flex">
              <KeyboardDatePicker
                className={classes.fromDatePicker}
                clearable
                margin="normal"
                label={<FormattedMessage id="words.from" defaultMessage="From" />}
                format="MM/dd/yyyy"
                value={fromDate}
                onChange={onFromDateSelected}
              />
              <KeyboardDatePicker
                clearable
                margin="normal"
                label={<FormattedMessage id="words.to" defaultMessage="To" />}
                format="MM/dd/yyyy"
                value={toDate}
                onChange={onToDateSelected}
              />
            </Box>
            <Autocomplete
              disableClearable
              options={timezones}
              getOptionLabel={(option) => option}
              value={timezone}
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
      {['siteId', 'user', 'origin'].includes(filterId) && (
        <TextField
          fullWidth
          select
          label={formatMessage(translations[filterId])}
          value={value ? value : 'all'}
          onChange={(e) => onFilterChange(filterId, e.target.value)}
        >
          {options.map((option) => (
            <MenuItem key={option.id} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      {filterId === 'operations' && (
        <TextField
          fullWidth
          select
          label={formatMessage(translations[filterId])}
          value={value?.split(',') ?? ['all']}
          SelectProps={{ multiple: true }}
          onChange={onMultipleSelectChanges}
        >
          {options.map((option) => (
            <MenuItem key={option.id} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      {['target', 'clusterNodeId'].includes(filterId) && (
        <TextField
          value={keyword}
          label={formatMessage(translations[filterId])}
          fullWidth
          onChange={onTextFieldChanges}
        />
      )}
    </>
  );
}
