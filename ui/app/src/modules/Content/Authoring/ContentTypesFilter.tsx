/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import palette from '../../../styles/palette';

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
  onTypeChange(type: string): any;

  disabled: boolean;
  filters: Filter[];
  resetType?: string;
}

export default function ContentTypesFilter(props: ContentTypesFilterProps) {
  const { onTypeChange, disabled, filters, resetType } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [type, setType] = useState(filters[0].type);

  const selected = filters.find(filter => filter.type === type);

  const onMenuClose = () => setAnchorEl(null);

  const onMenuOpen = (e) => setAnchorEl(e.currentTarget);

  const onChange = (e) => {
    onTypeChange(e.target.value);
    setType(e.target.value);
    onMenuClose();
  };

  useEffect(() => {
    resetType && setType(resetType);
  }, [resetType]);

  return (
    <>
      <Button disabled={disabled} onClick={onMenuOpen} className={classes.openMenuBtn}>
        {selected ? selected.label : type}
        <ArrowDropDownIcon className={classes.openMenuBtnIcon} />
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
        classes={{ paper: classes.menu }}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <RadioGroup value={type} onChange={onChange} className={classes.radioGroup}>
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
