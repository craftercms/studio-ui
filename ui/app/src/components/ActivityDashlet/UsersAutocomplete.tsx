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

import React, { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import useDebouncedInput from '../../hooks/useDebouncedInput';
import { fetchAll } from '../../services/users';
import CircularProgress from '@mui/material/CircularProgress';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import User from '../../models/User';
import { USER_USERNAME_MAX_LENGTH } from '../UserManagement/utils';
import { createErrorStatePropsFromApiResponse } from '../ApiResponseErrorState';

// TODO: Not in use. Removed ActivityDashlet usage.

export interface UsersAutocompleteProps {
  value: User[];
  onChange(value: User[]): void;
}

export function UsersAutocomplete(props: UsersAutocompleteProps) {
  const { onChange, value } = props;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState(null);
  const keyword$ = useDebouncedInput((k) => setKeyword(k.trim()));
  const { formatMessage } = useIntl();
  useEffect(() => {
    if (keyword) {
      setLoading(true);
      setError(null);
      fetchAll({ limit: 50, keyword }).subscribe({
        next: (users) => {
          setUsers(users);
          setLoading(false);
        },
        error: ({ response }) => {
          setLoading(false);
          setError(response);
        }
      });
    } else {
      setUsers([]);
      setKeyword('');
      setLoading(false);
    }
  }, [keyword]);
  return (
    <Autocomplete
      multiple
      noOptionsText={
        keyword ? (
          error ? (
            error?.response.code === 1001 ? (
              error.validationErrors[0].message
            ) : (
              createErrorStatePropsFromApiResponse(error.response, formatMessage).message
            )
          ) : (
            <FormattedMessage
              id="activityDashlet.noUsersMatchKeywordsMessage"
              defaultMessage='No users match "{user}"'
              values={{ user: keyword }}
            />
          )
        ) : (
          <FormattedMessage id="activityDashlet.emptyUserQueryMessage" defaultMessage="Type a username to find" />
        )
      }
      value={value}
      options={users}
      loading={loading}
      getOptionLabel={(option) => option.username}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={
              <Typography component="span">
                {option.username}
                <Typography variant="body2" component="span">
                  "{option.firstName} {option.lastName}"
                </Typography>
              </Typography>
            }
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage id="words.username" defaultMessage="Username" />}
          inputProps={{ ...params.inputProps, maxLength: USER_USERNAME_MAX_LENGTH }}
          onChange={(e) => {
            keyword$.next(e.target.value);
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
      isOptionEqualToValue={(option, value) => option.username === value.username}
      onChange={(event, newValue) => {
        const nextValue = [...newValue];
        setUsers([]);
        onChange(nextValue);
      }}
    />
  );
}

export default UsersAutocomplete;
