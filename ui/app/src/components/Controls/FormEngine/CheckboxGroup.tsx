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

import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { Control } from '../../../models/FormsEngine';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { controlBaseStyles } from './commonStyles';

const useStyles = makeStyles(() => createStyles(controlBaseStyles));

export default function CheckboxGroup(props: Control) {
  const {
    field,
    value = [],
    onChange,
    disabled
  } = props;
  const classes = useStyles({});

  const handleChange = (e) => onChange(
    (e.target.checked)
      ? value.concat(e.target.value)
      : value.filter(val => val !== e.target.value)
  );

  return (
    <FormControl className={classes.formControl}>
      <InputLabel
        className={classes.inputLabel}
        htmlFor={field.id}
      >
        {field.name}
      </InputLabel>
      {
        field.values?.map((possibleValue: any) => (
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
            label={possibleValue.label}/>
        ))
      }
    </FormControl>
  )
}
