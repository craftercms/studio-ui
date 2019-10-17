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
