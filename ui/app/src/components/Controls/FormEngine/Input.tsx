/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import TextField from '@material-ui/core/TextField';
import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Control } from '../../../models/FormsEngine';

export const useStyles = makeStyles((theme: Theme) =>
  ({
    formControl: {
      width: '100%',
      '& .MuiFormGroup-root': {
        marginLeft: '10px'
      },
      '& .MuiInputBase-root': {
        marginTop: '12px !important'
      }
    },
    inputLabel: {
      position: 'relative'
    }
  })
);

export default function Input(props: Control) {
  const {
    field,
    value,
    onChange,
    disabled
  } = props;
  const classes = useStyles({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel
        className={classes.inputLabel}
        htmlFor={field.id}
      >
        {field.name}
      </InputLabel>
      <TextField
        type="text"
        placeholder="auto"
        fullWidth
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
      />
    </FormControl>
  )
}
