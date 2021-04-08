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
import DateTimePicker from '../DateTimePicker';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { DateTimeControl } from '../../../models/FormsEngine';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { controlBaseStyles } from './commonStyles';
import { useSelection } from '../../../utils/hooks';
import GlobalState from '../../../models/GlobalState';

const useStyles = makeStyles(() => createStyles(controlBaseStyles));

export default function DateTime(props: DateTimeControl) {
  const { field, value, timezone, onChange, disabled } = props;
  const classes = useStyles({});
  const localeCode = useSelection<GlobalState['uiConfig']['locale']['localeCode']>(
    (state) => state.uiConfig.locale.localeCode
  );

  return (
    <FormControl className={classes.formControl}>
      <InputLabel className={classes.inputLabel} htmlFor={field.id}>
        {field.name}
      </InputLabel>
      <DateTimePicker
        id={field.id}
        date={value}
        onChange={onChange}
        disabled={disabled}
        timeZonePickerProps={{
          timezone: timezone
        }}
        localeCode={localeCode}
      />
    </FormControl>
  );
}
