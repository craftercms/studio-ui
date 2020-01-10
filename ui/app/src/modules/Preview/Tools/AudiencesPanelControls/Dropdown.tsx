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

import React from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

interface Control {
  field: any;
  value: string;
  onChange: Function;
  disabled: boolean;
}

export default function Dropdown(props: Control) {
  const {
    field,
    value,
    onChange,
    disabled
  } = props;

  const handleSelectChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange(name, event.target.value);
  };

  return (
    <Select
      labelId={field.id}
      id={field.id}
      value={value}
      onChange={handleSelectChange(field.id)}
      disabled={disabled}
    >
      {
        field.values ? (
          field.values.map((possibleValue: any, index: number) => (
            <MenuItem value={possibleValue.value} key={index}>{possibleValue.value}</MenuItem>
          ))
        ) : (null)
      }
    </Select>
  )
}
