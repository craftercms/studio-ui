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
import DateTimePicker from '../../DateTimePicker';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { DateTimeControl } from '../../../models/FormsEngine';
import { useStyles } from './Input';

export default function DateTime(props: DateTimeControl) {
  const {
    field,
    value,
    timezone,
    onChange,
    disabled
  } = props;
  const classes = useStyles({});

  const dateTimePickerChange = (scheduledDateTime: any) => {
    const datetime = scheduledDateTime.toISOString();
    const tz = scheduledDateTime.tz();

    onChange(datetime);   // TODO: return scheduledDateTime so it can retrieve timezone too
    // tz && onChange(`${name}_tz`, encodeURIComponent(tz));    // TODO: encode not in here

    // TODO: on change directly to DateTimePicker, fields retrievals on audiencesPanel (kinda formsEngine)

  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel
        className={classes.inputLabel}
        htmlFor={field.id}
      >
        {field.name}
      </InputLabel>
      <DateTimePicker
        date={value}
        timezone={timezone}
        onChange={dateTimePickerChange}
        disabled={disabled}
      />
    </FormControl>
  )
}
