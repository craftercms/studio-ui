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

type LogInFormProps = PropsWithChildren<{
  username: string;
  password: string;
  isFetching: boolean;
  onSubmit: (e: any) => any;
  onSetPassword: Function;
  enableUsernameInput?: boolean;
  onSetUsername?: Function;
  classes?: {
    username?: string;
    password?: string;
  };
}>;

export function LogInForm(props: LogInFormProps) {
  const {
    username,
    onSubmit,
    onSetUsername,
    isFetching,
    onSetPassword,
    password,
    enableUsernameInput = false,
    classes
  } = props;
  return (
    <form onSubmit={onSubmit}>
      <TextField
        id="loginFormUsernameField"
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
        fullWidth
        autoFocus={!enableUsernameInput || Boolean(username)}
        value={password}
        onChange={(e: any) => onSetPassword?.(e.target.value)}
        className={classes?.password}
        label={<FormattedMessage id="authMonitor.passwordTextFieldLabel" defaultMessage="Password" />}
      />
      {/* This button is just to have the form submit when pressing enter. */}
      <Button children="" type="submit" onClick={onSubmit} disabled={isFetching} style={{ display: 'none' }} />
    </form>
  );
}
