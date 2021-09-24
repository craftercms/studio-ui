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

import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import palette from '../../styles/palette';

const useStyles = makeStyles((theme) => ({
  menu: {
    padding: '5px 10px'
  },
  openMenuBtn: {
    fontSize: '16px'
  },
  openMenuBtnIcon: {
    fontSize: '24px',
    marginLeft: '5px',
    paddingTop: '2px',
    fill: palette.gray.medium4
  },
  radioGroup: {
    '&:focus': {
      outline: 0
    }
  }
}));

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

export default function ContentTypesFilter(props: ContentTypesFilterProps) {
  const { onFilterChange, selected, disabled, filters } = props;
  const classes = useStyles();
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
      <Button disabled={disabled} onClick={onMenuOpen} className={classes.openMenuBtn}>
        {filter.label}
        <ArrowDropDownIcon className={classes.openMenuBtnIcon} />
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
        classes={{ paper: classes.menu }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <RadioGroup value={selected} onChange={onChange} className={classes.radioGroup}>
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
