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
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { FormattedMessage } from 'react-intl';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { Control } from '../../../models/FormsEngine';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { controlBaseStyles } from './commonStyles';

const useStyles = makeStyles(() => createStyles(controlBaseStyles));

export default function Dropdown(props: Control) {
  const { field, value = '', onChange, disabled } = props;
  const classes = useStyles({});

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel className={classes.inputLabel}>{field.name}</InputLabel>
      <Select value={value} onChange={handleSelectChange} disabled={disabled} displayEmpty>
        <MenuItem value="">
          <FormattedMessage id="audiencesPanelControl.optionSelectorNoOptionSelected" defaultMessage="Select Option" />
        </MenuItem>
        {field.values?.map((possibleValue: any) => (
          <MenuItem value={possibleValue.value} key={possibleValue.value}>
            {possibleValue.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
