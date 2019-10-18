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
 */

import TextField from "@material-ui/core/TextField";
import React, { useState } from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

interface PasswordTextField {
  id: string;
  fullWidth: boolean;
  name: string;
  label: string;
  required: boolean;
  onKeyPress(event: React.KeyboardEvent): any;
  onChange(event: React.ChangeEvent): any;
  value: string;
  error: boolean;
  helperText: string;
}

export default function PasswordTextField(props: PasswordTextField) {
  const {name, label, required, onKeyPress, onChange, value, error, helperText, fullWidth} = props;
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <TextField
      id={name}
      fullWidth={fullWidth}
      name={name}
      type={showPassword ? 'text' : 'password'}
      label={label}
      required={required}
      onKeyPress={onKeyPress}
      onChange={onChange}
      value={value}
      error={error}
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
            >
              {showPassword ? <VisibilityOff/> : <Visibility/>}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}
