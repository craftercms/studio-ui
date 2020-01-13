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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Control } from '../AudiencesPanel';

export default function CheckboxGroup(props: Control) {
  const {
    field,
    value,
    onChange,
    disabled
  } = props;

  const valuesArray = value ? value.split(',') : [];

  const handleInputChange = (name: string, label?: string, values?: string[]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();

    if (e.target.checked) {
      if (!(label in values)) {
        values.push(label);
      }
    } else {
      values.splice(values.indexOf(label), 1);
    }
    onChange(name, values.join(','));
  };

  return (
    <>
      {
        field.values ? (
          field.values.map((possibleValue: any, index: number) => (
            <FormControlLabel
              key={index}
              htmlFor={field.id}
              control={
                <Checkbox
                  color="primary"
                  checked={valuesArray.includes(possibleValue.value)}
                  onChange={handleInputChange(field.id, possibleValue.value, valuesArray)}
                  disabled={disabled}
                />
              }
              label={possibleValue.value}/>
          ))
        ) : (null)
      }
    </>
  )
}
