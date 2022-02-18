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

import TextField from '@mui/material/TextField';
import React from 'react';
import FormControl from '@mui/material/FormControl';
import { Control } from '../../models/FormsEngine';
import useStyles from './styles';

export function Input(props: Control) {
  const { field, value = '', onChange, disabled } = props;
  const classes = useStyles();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormControl variant="outlined" className={classes.formControl} fullWidth>
      <TextField
        id={field.id}
        type="text"
        placeholder="auto"
        fullWidth
        label={field.name}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
      />
    </FormControl>
  );
}

export default Input;
