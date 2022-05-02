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
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import User from '../../models/User';

export interface UsersAutocompleteProps {
  onChange(value: User[]): void;
}

export function UsersAutocomplete(props: UsersAutocompleteProps) {
  const { onChange } = props;
  const [value, setValue] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const keyword$ = useDebouncedInput((k) => setKeyword(k.trim()));
  useEffect(() => {
    if (keyword) {
      setLoading(true);
      fetchAll({ limit: 50, keyword }).subscribe((users) => {
        setUsers(users);
        setLoading(false);
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
          <FormattedMessage
            id="activityDashlet.noUsersMatchKeywordsMessage"
            defaultMessage='No users match "{user}"'
            values={{ user: keyword }}
          />
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
        setValue(nextValue);
        onChange(nextValue);
      }}
    />
  );
}

export default UsersAutocomplete;
