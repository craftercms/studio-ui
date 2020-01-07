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

import { useSelection } from '../../utils/hooks';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import PasswordTextField from '../Controls/PasswordTextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { login, logout, validateSession } from '../../state/actions/auth';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import loginGraphicUrl from '../../assets/authenticate.svg';
import { interval } from 'rxjs';

const translations = defineMessages({
  sessionExpired: {
    id: 'authMonitor.sessionExpiredMessage',
    defaultMessage: 'Your session has expired. Please log back in.'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  input: {
    marginBottom: theme.spacing(2)
  },
  actions: {
    placeContent: 'center space-between'
  },
  dialog: {
    width: 400
  },
  graphic: {
    width: 150
  },
  title: {
    textAlign: 'center'
  }
}));

export default function AuthMonitor() {

  const classes = useStyles({});
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const username = useSelection<string>(state => state.user.username);
  const { active, error, isFetching } = useSelection(state => state.auth);
  const [password, setPassword] = useState<string>('');

  const onSubmit = () => dispatch(login({ username, password }));
  const onClose = () => dispatch(logout());

  useEffect(() => {
    if (active) {
      const sub = interval(300000).subscribe(() => dispatch(validateSession()));
      return () => sub.unsubscribe();
    }
  }, [active, dispatch]);

  return (
    <Dialog open={!active} onClose={onClose} aria-labelledby="craftecmsReLoginDialog">
      <DialogTitle id="craftecmsReLoginDialog" className={classes.title}>
        <FormattedMessage
          id="authMonitor.dialogTitleText"
          defaultMessage="Session Expired"
        />
      </DialogTitle>
      <DialogContent className={classes.dialog}>
        {
          isFetching ? (
            <LoadingState title="" classes={{ graphic: classes.graphic }}/>
          ) : (
            <>
              {
                error ? (
                  <ErrorState error={error} classes={{ graphic: classes.graphic }}/>
                ) : (
                  <ErrorState
                    graphicUrl={loginGraphicUrl}
                    classes={{ graphic: classes.graphic }}
                    error={{ message: formatMessage(translations.sessionExpired) }}
                  />
                )
              }
              <form onSubmit={onSubmit}>
                <TextField
                  fullWidth
                  disabled
                  type="email"
                  value={username}
                  className={classes.input}
                  label={
                    <FormattedMessage id="authMonitor.usernameTextFieldLabel" defaultMessage="Username"/>
                  }
                />
                <PasswordTextField
                  fullWidth
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  label={
                    <FormattedMessage id="authMonitor.passwordTextFieldLabel" defaultMessage="Password"/>
                  }
                />
                {/* This button is just to have the form submit when pressing enter. */}
                <Button
                  children=""
                  type="submit"
                  onClick={onSubmit}
                  disabled={isFetching}
                  style={{ display: 'none' }}
                />
              </form>
            </>
          )
        }
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onClose} disabled={isFetching}>
          <FormattedMessage id="authMonitor.cancelButtonLabel" defaultMessage="Close Session"/>
        </Button>
        <Button type="submit" onClick={onSubmit} color="primary" disabled={isFetching}>
          <FormattedMessage id="authMonitor.submitButtonLabel" defaultMessage="Log In"/>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
