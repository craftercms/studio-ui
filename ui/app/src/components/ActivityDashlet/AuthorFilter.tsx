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

import React, { useRef } from 'react';
import Button from '@mui/material/Button';
import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import { Popover } from '@mui/material';
import UsersAutocomplete, { UsersAutocompleteProps } from './UsersAutocomplete';

export interface AuthorFilterProps {
  onChange: UsersAutocompleteProps['onChange'];
}

export function AuthorFilter(props: AuthorFilterProps) {
  const { onChange } = props;
  const [open, setOpen] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>();
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
        PaperProps={{ sx: { width: 300, p: 1 } }}
      >
        <UsersAutocomplete onChange={onChange} />
      </Popover>
    </>
  );
}

export default AuthorFilter;
