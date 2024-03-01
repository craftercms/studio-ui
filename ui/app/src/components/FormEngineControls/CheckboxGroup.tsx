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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import { Control } from '../../models/FormsEngine';
import useStyles from './styles';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';

export function CheckboxGroup(props: Control) {
  const { field, value = [], onChange, disabled } = props;
  const { classes } = useStyles();

  const handleChange = (e) =>
    onChange(e.target.checked ? value.concat(e.target.value) : value.filter((val) => val !== e.target.value));

  return (
    <>
      <FormLabel className={classes.inputLabel} htmlFor={field.id}>
        {field.name}
      </FormLabel>
      <FormControl variant="outlined" className={classes.formControl} fullWidth>
        <FormGroup>
          {field.values?.map((possibleValue: any) => (
            <FormControlLabel
              key={possibleValue.value}
              control={
                <Checkbox
                  value={possibleValue.value}
                  color="primary"
                  checked={value.includes(possibleValue.value)}
                  onChange={handleChange}
                  disabled={disabled}
                />
              }
              label={possibleValue.label}
            />
          ))}
        </FormGroup>
      </FormControl>
    </>
  );
}

export default CheckboxGroup;
