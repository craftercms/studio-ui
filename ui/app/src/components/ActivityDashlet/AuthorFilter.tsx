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

import React, { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { FormattedMessage, useIntl } from 'react-intl';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import ClearRounded from '@mui/icons-material/ClearRounded';

// TODO: With the autocomplete removal, this component is less useful standalone. Move into the ActivityDashlet?

export interface AuthorFilterProps {
  disabled?: boolean;
  loading?: boolean;
  onChange(value: { username: string }[]): void;
}

export function AuthorFilter(props: AuthorFilterProps) {
  const { onChange, disabled = false, loading = false } = props;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const buttonRef = useRef<HTMLButtonElement>();
  const inputRef = useRef<HTMLInputElement>();
  const { formatMessage } = useIntl();

  const submitChanges = () => {
    const usernames = value
      .split(',')
      .filter(Boolean)
      .map((username) => ({ username: username.trim() }));
    onChange(usernames);
  };

  const clearValue = () => {
    setOpen(false);
    setValue('');
    onChange([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      submitChanges();
    }
  };

  useEffect(() => {
    if (open && !loading && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      });
    }
  }, [open, loading]);

  return (
    <>
      <Button
        disabled={disabled}
        ref={buttonRef}
        variant="text"
        size="small"
        endIcon={<KeyboardArrowDownRounded />}
        onClick={(e) => {
          setOpen(true);
        }}
      >
        <FormattedMessage id="words.author" defaultMessage="Author" />
      </Button>
      <Popover
        open={open}
        anchorEl={buttonRef.current}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: 350, p: 1 } } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <TextField
          fullWidth
          autoFocus
          value={value}
          disabled={loading}
          onChange={handleInputChange}
          placeholder='e.g. "jon.doe, jdoe, jane@example.com"'
          onKeyUp={handleKeyUp}
          InputProps={{
            inputRef,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  disabled={loading}
                  title={formatMessage({ defaultMessage: 'Submit' })}
                  edge="end"
                  onClick={submitChanges}
                  size="small"
                >
                  <ReplyRounded sx={{ transform: 'scaleX(-1)' }} />
                </IconButton>
                <IconButton
                  disabled={loading}
                  title={formatMessage({ defaultMessage: 'Clear & close' })}
                  edge="end"
                  onClick={clearValue}
                  size="small"
                >
                  <ClearRounded />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Popover>
    </>
  );
}

export default AuthorFilter;
