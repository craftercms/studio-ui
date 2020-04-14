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

import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import React, { useState } from 'react';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { defineMessages, useIntl } from 'react-intl';

type PasswordTextFieldProps = TextFieldProps & {
  visibilitySwitch?: boolean;
  initialVisible?: boolean;
};

const translations = defineMessages({
  toggleVisibilityButtonText: {
    id: 'passwordTextField.toggleVisibilityButtonText',
    defaultMessage: 'toggle password visibility'
  }
});

export default function PasswordTextField(props: PasswordTextFieldProps) {

  const { visibilitySwitch = true, initialVisible = false } = props;
  const { formatMessage } = useIntl();
  const [showPassword, setShowPassword] = useState(initialVisible);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <TextField
      {...props}
      type={showPassword ? 'text' : 'password'}
      InputProps={
        visibilitySwitch ? {
          ...props.InputProps,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={formatMessage(translations.toggleVisibilityButtonText)}
                onClick={handleClickShowPassword}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        } : props.InputProps
      }
    />
  );
}

PasswordTextField.defaultProps = {
  type: 'password'
};
