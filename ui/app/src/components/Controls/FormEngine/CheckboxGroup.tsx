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
    value,
    onChange,
    disabled
  } = props;
  const classes = useStyles({});

  const valuesArray = value ? value.split(',') : [];

  const handleInputChange = (label?: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();

    if (e.target.checked) {
      if (!(label in valuesArray)) {
        valuesArray.push(label);
      }
    } else {
      valuesArray.splice(valuesArray.indexOf(label), 1);
    }
    onChange(valuesArray.join(','));
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel
        className={classes.inputLabel}
        htmlFor={field.id}
      >
        {field.name}
      </InputLabel>
      {
        field.values?.map((possibleValue: any, index: number) => (
          <FormControlLabel
            key={index}
            htmlFor={field.id}
            control={
              <Checkbox
                color="primary"
                checked={valuesArray.includes(possibleValue.value)}
                onChange={handleInputChange(possibleValue.value)}
                disabled={disabled}
              />
            }
            label={possibleValue.label}/>
        ))
      }
    </FormControl>
  )
}
