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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import Popover from '@mui/material/Popover';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { CurrentFilters } from '../../models/Publishing';
import SearchIcon from '@mui/icons-material/SearchRounded';
import { Checkbox, FormGroup, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';

const messages: any = defineMessages({
  pathExpression: {
    id: 'publishingDashboard.pathExpression',
    defaultMessage: 'Path Expression'
  },
  environment: {
    id: 'common.publishingTarget',
    defaultMessage: 'Publishing Target'
  },
  state: {
    id: 'publishingDashboard.state',
    defaultMessage: 'State'
  },
  all: {
    id: 'publishingDashboard.all',
    defaultMessage: 'All'
  },
  READY_FOR_LIVE: {
    id: 'publishingDashboard.READY_FOR_LIVE',
    defaultMessage: 'Ready for Live'
  },
  PROCESSING: {
    id: 'publishingDashboard.PROCESSING',
    defaultMessage: 'Processing'
  },
  COMPLETED: {
    id: 'publishingDashboard.COMPLETED',
    defaultMessage: 'Completed'
  },
  CANCELLED: {
    id: 'publishingDashboard.CANCELLED',
    defaultMessage: 'Cancelled'
  },
  BLOCKED: {
    id: 'publishingDashboard.BLOCKED',
    defaultMessage: 'Blocked'
  }
});

interface FilterDropdownProps {
  text: string;
  className?: any;
  sx?: SxProps<Theme>;
  currentFilters: CurrentFilters;
  filters: any;

  handleFilterChange(event: any): any;

  handleEnterKey(path: string): any;
}

export function FilterDropdown(props: FilterDropdownProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { text, className, handleFilterChange, handleEnterKey, currentFilters, filters, sx } = props;
  const [path, setPath] = useState('');
  const { formatMessage } = useIntl();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onKeyPress = (event: React.KeyboardEvent, path: string) => {
    if (event.charCode === 13) {
      handleEnterKey(path);
    }
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClick} sx={sx} className={className}>
        {text} <ArrowDropDownIcon />
      </Button>
      <Popover
        id="publishingFilterDropdown"
        anchorEl={anchorEl}
        slotProps={{ paper: { sx: { width: '300px' } } }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <section>
          <Box
            component="header"
            sx={(theme) => ({
              background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey['100'],
              padding: '10px'
            })}
          >
            <Typography variant="body1">
              <strong>{formatMessage(messages.pathExpression)}</strong>
            </Typography>
          </Box>
          <Box
            sx={{
              padding: '10px',
              position: 'relative'
            }}
            display="flex"
            alignItems="center"
          >
            <Box
              sx={{
                width: (theme) => theme.spacing(7),
                color: '#828282',
                height: '41px;',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              <SearchIcon />
            </Box>
            <TextField
              id="path"
              name="path"
              sx={{
                '& input': {
                  paddingLeft: '50px'
                }
              }}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              fullWidth
              placeholder="e.g. /SOME/PATH/*"
              onChange={(event) => setPath(event.target.value)}
              onKeyPress={(event) => onKeyPress(event, path)}
              value={path}
            />
          </Box>
        </section>
        <section>
          <Box
            component="header"
            sx={(theme) => ({
              background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey['100'],
              padding: '10px'
            })}
          >
            <Typography variant="body1">
              <strong>{formatMessage(messages.environment)}</strong>
            </Typography>
          </Box>
          <Box sx={{ width: '100%', padding: '5px 15px 20px 15px' }}>
            <RadioGroup
              aria-label={formatMessage(messages.environment)}
              name="environment"
              value={currentFilters.environment}
              onChange={handleFilterChange}
            >
              <FormControlLabel value="" control={<Radio color="primary" />} label={formatMessage(messages.all)} />
              {filters.environments &&
                filters.environments.map((filter: string, index: number) => (
                  <FormControlLabel key={index} value={filter} control={<Radio color="primary" />} label={filter} />
                ))}
            </RadioGroup>
          </Box>
        </section>
        <section>
          <Box
            component="header"
            sx={(theme) => ({
              background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey['100'],
              padding: '10px'
            })}
          >
            <Typography variant="body1" sx={{ ml: '5px' }}>
              <FormControlLabel
                value=""
                label={<strong>{formatMessage(messages.state)}</strong>}
                control={
                  <Checkbox
                    color="primary"
                    value=""
                    indeterminate={
                      currentFilters.state.length > 0 && currentFilters.state.length !== filters.states.length
                    }
                    checked={currentFilters.state.length === filters.states.length}
                    onChange={handleFilterChange}
                  />
                }
              />
            </Typography>
          </Box>
          <Box sx={{ width: '100%', padding: '5px 15px 20px 15px' }}>
            <FormGroup>
              {filters.states.map((filter: string, index: number) => (
                <FormControlLabel
                  key={index}
                  value={filter}
                  control={
                    <Checkbox
                      color="primary"
                      value={filter}
                      checked={currentFilters.state.includes(filter)}
                      onChange={handleFilterChange}
                    />
                  }
                  label={formatMessage(messages[filter])}
                />
              ))}
            </FormGroup>
          </Box>
        </section>
      </Popover>
    </div>
  );
}

export default FilterDropdown;
