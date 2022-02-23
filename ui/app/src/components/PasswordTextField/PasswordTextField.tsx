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

import TextField, { TextFieldProps } from '@mui/material/TextField';
import React, { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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

const PasswordTextField = React.forwardRef<HTMLDivElement, PasswordTextFieldProps>((props, ref) => {
  const { visibilitySwitch = true, initialVisible = false } = props;
  const { formatMessage } = useIntl();
  const [showPassword, setShowPassword] = useState(initialVisible);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <TextField
      {...props}
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      InputProps={
        visibilitySwitch
          ? {
              ...props.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={formatMessage(translations.toggleVisibilityButtonText)}
                    onClick={handleClickShowPassword}
                    size="large"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }
          : props.InputProps
      }
    />
  );
});

export default PasswordTextField;

PasswordTextField.defaultProps = {
  type: 'password'
};
