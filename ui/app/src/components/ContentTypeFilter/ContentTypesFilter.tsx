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

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import palette from '../../styles/palette';

interface Filter {
  type: string;
  label: string;
}

interface ContentTypesFilterProps {
  filters: Filter[];
  selected: string;
  disabled?: boolean;
  onFilterChange(filter: string): void;
}

export function ContentTypesFilter(props: ContentTypesFilterProps) {
  const { onFilterChange, selected, disabled, filters } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const filter = filters.find((filter) => filter.type === selected);

  const onMenuClose = () => setAnchorEl(null);

  const onMenuOpen = (e) => setAnchorEl(e.currentTarget);

  const onChange = (e) => {
    onFilterChange(e.target.value);
    onMenuClose();
  };

  return (
    <>
      <Button disabled={disabled} onClick={onMenuOpen} sx={{ fontSize: '16px' }}>
        {filter.label}
        <ArrowDropDownIcon
          sx={{
            fontSize: '24px',
            marginLeft: '5px',
            paddingTop: '2px',
            fill: palette.gray.medium4
          }}
        />
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
        slotProps={{
          paper: {
            sx: { padding: '5px 10px' }
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <RadioGroup value={selected} onChange={onChange} sx={{ '&:focus': { outline: 0 } }}>
          {filters.map((filter) => (
            <FormControlLabel
              key={filter.type}
              value={filter.type}
              control={<Radio color="primary" />}
              label={filter.label}
            />
          ))}
        </RadioGroup>
      </Menu>
    </>
  );
}

export default ContentTypesFilter;
