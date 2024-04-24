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

import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { FormattedMessage, useIntl } from 'react-intl';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ReplyRounded from '@mui/icons-material/ReplyRounded';

// TODO: With the autocomplete removal, this component is less useful standalone. Move into the ActivityDashlet?

export interface AuthorFilterProps {
  onChange(value: { username: string }[]): void;
}

export function AuthorFilter(props: AuthorFilterProps) {
  const { onChange } = props;
  const [open, setOpen] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>();
  const [value, setValue] = useState('');
  const { formatMessage } = useIntl();

  const submitChanges = () => {
    if (!value.trim()) return;
    const usernames = value
      .split(',')
      .filter(Boolean)
      .map((username) => ({ username: username.trim() }));
    usernames.length && onChange(usernames);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      submitChanges();
    }
  };

  return (
    <>
      <Button
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
        slotProps={{ paper: { sx: { width: 300, p: 1 } } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <TextField
          fullWidth
          autoFocus
          value={value}
          onChange={handleInputChange}
          placeholder={formatMessage({ defaultMessage: 'Comma-separated partial usernames' })}
          onKeyUp={handleKeyUp}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={formatMessage({ defaultMessage: 'Submit' })}
                  edge="end"
                  onClick={submitChanges}
                  size="small"
                >
                  <ReplyRounded sx={{ transform: 'scaleX(-1)' }} />
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
