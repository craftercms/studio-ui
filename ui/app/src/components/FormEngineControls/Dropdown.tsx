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

import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Control } from '../../models/FormsEngine';
import useStyles from './styles';

export function Dropdown(props: Control) {
  const { field, value = '', onChange, disabled } = props;
  const { classes } = useStyles();

  const handleSelectChange = (event: SelectChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl variant="outlined" className={classes.formControl} fullWidth>
      <InputLabel id={`labelFor_${field.id}`}>{field.name}</InputLabel>
      <Select
        labelId={`labelFor_${field.id}`}
        id={`select_${field.id}`}
        label={field.name}
        fullWidth
        value={value}
        onChange={handleSelectChange}
        disabled={disabled}
      >
        {field.values?.map((possibleValue: any) => (
          <MenuItem value={possibleValue.value} key={possibleValue.value}>
            {possibleValue.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default Dropdown;
