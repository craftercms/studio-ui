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
import DateTimePicker from '../DateTimePicker/DateTimePicker';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DateTimeControl } from '../../models/FormsEngine';
import GlobalState from '../../models/GlobalState';
import useStyles from './styles';
import { useSelection } from '../../hooks/useSelection';

export function DateTime(props: DateTimeControl) {
  const { field, value, timeZone, onChange, disabled } = props;
  const { classes } = useStyles();
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);

  return (
    <FormControl variant="outlined" className={classes.formControl} fullWidth>
      <InputLabel className={classes.inputLabel} sx={{ position: 'relative', transform: 'none' }} htmlFor={field.id}>
        {field.name}
      </InputLabel>
      <DateTimePicker
        id={field.id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        timeZone={timeZone}
        localeCode={locale.localeCode}
        dateTimeFormatOptions={locale.dateTimeFormatOptions}
      />
    </FormControl>
  );
}

export default DateTime;
