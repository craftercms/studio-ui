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

import React, { PropsWithChildren } from 'react';
import TextField from '@material-ui/core/TextField';
import { FormattedMessage } from 'react-intl';
import PasswordTextField from '../Controls/PasswordTextField';
import Button from '@material-ui/core/Button';

export type LogInFormProps = PropsWithChildren<{
  username: string;
  password: string;
  isFetching: boolean;
  onSubmit: (e: any) => any;
  onSetPassword: Function;
  enableUsernameInput?: boolean;
  onSetUsername?: Function;
  classes?: Partial<Record<'username' | 'password' | 'submit', string>>;
  action?: string;
  method?: 'get' | 'post';
  onRecover?: Function;
}>;

export default function LogInForm(props: LogInFormProps) {
  const {
    children,
    username,
    onSubmit,
    onSetUsername,
    isFetching,
    onSetPassword,
    password,
    enableUsernameInput = false,
    classes,
    action = '/studio/login',
    method = 'post',
    onRecover
  } = props;
  return (
    <form action={action} method={method} onSubmit={onSubmit}>
      {children}
      <TextField
        id="loginFormUsernameField"
        name="username"
        fullWidth
        autoFocus={enableUsernameInput && !Boolean(username)}
        disabled={!enableUsernameInput}
        type="text"
        value={username}
        onChange={(e: any) => onSetUsername?.(e.target.value)}
        className={classes?.username}
        label={<FormattedMessage id="loginView.usernameTextFieldLabel" defaultMessage="Username" />}
      />
      <PasswordTextField
        id="loginFormPasswordField"
        name="password"
        fullWidth
        autoFocus={!enableUsernameInput || Boolean(username)}
        value={password}
        onChange={(e: any) => onSetPassword?.(e.target.value)}
        className={classes?.password}
        label={<FormattedMessage id="authMonitor.passwordTextFieldLabel" defaultMessage="Password" />}
      />
      <Button
        color="primary"
        variant="contained"
        fullWidth
        type="submit"
        disabled={isFetching}
        className={classes?.submit}
      >
        <FormattedMessage id="loginView.loginButtonLabel" defaultMessage="Log In" />
      </Button>
      {onRecover && (
        <Button
          type="button"
          color="primary"
          disabled={isFetching}
          variant="text"
          fullWidth
          onClick={() => onRecover()}
        >
          <FormattedMessage id="loginView.forgotPasswordButtonLabel" defaultMessage="Forgot your password?" />
        </Button>
      )}
    </form>
  );
}
