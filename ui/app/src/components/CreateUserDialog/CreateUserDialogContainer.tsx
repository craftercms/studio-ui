/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { create } from '../../services/users';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import DialogBody from '../Dialogs/DialogBody';
import TextField from '@mui/material/TextField';
import PasswordTextField from '../Controls/PasswordTextField';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import PasswordRequirementsDisplay from '../PasswordRequirementsDisplay';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import clsx from 'clsx';
import UserGroupMembershipEditor from '../UserGroupMembershipEditor';
import { mapTo, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { addUserToGroup } from '../../services/groups';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { CreateUserDialogContainerProps } from './utils';

const useStyles = makeStyles((theme) =>
  createStyles({
    popper: {
      zIndex: theme.zIndex.modal,
      '&[x-placement*="bottom"] $arrow': {
        top: 0,
        left: 0,
        marginTop: '-0.71em',
        marginLeft: 4,
        marginRight: 4,
        '&::before': {
          transformOrigin: '0 100%'
        }
      },
      '&[x-placement*="top"] $arrow': {
        bottom: 0,
        left: 0,
        marginBottom: '-0.71em',
        marginLeft: 4,
        marginRight: 4,
        '&::before': {
          transformOrigin: '100% 0'
        }
      },
      '&[x-placement*="right"] $arrow': {
        left: 0,
        marginLeft: '-0.71em',
        height: '1em',
        width: '0.71em',
        marginTop: 4,
        marginBottom: 4,
        '&::before': {
          transformOrigin: '100% 100%'
        }
      },
      '&[x-placement*="left"] $arrow': {
        right: 0,
        marginRight: '-0.71em',
        height: '1em',
        width: '0.71em',
        marginTop: 4,
        marginBottom: 4,
        '&::before': {
          transformOrigin: '0 0'
        }
      }
    },
    paper: {
      padding: '10px'
    },
    arrow: {
      overflow: 'hidden',
      position: 'absolute',
      width: '1em',
      height: '0.71em',
      boxSizing: 'border-box',
      color: theme.palette.background.paper,
      '&::before': {
        content: '""',
        margin: 'auto',
        display: 'block',
        width: '100%',
        height: '100%',
        boxShadow: theme.shadows[1],
        backgroundColor: 'currentColor',
        transform: 'rotate(45deg)'
      }
    },
    textField: {
      marginBottom: theme.spacing(1)
    },
    form: {
      display: 'contents'
    },
    dialogBody: {
      overflow: 'auto'
    }
  })
);

export function CreateUserDialogContainer(props: CreateUserDialogContainerProps) {
  const { onClose, passwordRequirementsRegex, onCreateSuccess, isSubmitting, onSubmittingAndOrPendingChange } = props;
  const [newUser, setNewUser] = useSpreadState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    enabled: true
  });
  const [submitted, setSubmitted] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const [submitOk, setSubmitOk] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const arrowRef = useRef();
  const selectedGroupsRef = useRef([]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (submitOk) {
      onSubmittingAndOrPendingChange({
        isSubmitting: true
      });
      setSubmitted(true);
      if (Object.values(newUser).every(Boolean)) {
        create(newUser)
          .pipe(
            switchMap((user) =>
              selectedGroupsRef.current.length
                ? forkJoin(selectedGroupsRef.current.map((id) => addUserToGroup(Number(id), user.username))).pipe(
                    mapTo(user)
                  )
                : of(user)
            )
          )
          .subscribe(
            () => {
              onCreateSuccess?.();
              onSubmittingAndOrPendingChange({
                isSubmitting: false
              });
            },
            ({ response: { response } }) => {
              onSubmittingAndOrPendingChange({
                isSubmitting: false
              });
              dispatch(showErrorDialog({ error: response }));
            }
          );
      }
    }
  };

  const isInvalidEmail = (email: string) => {
    const emailRegex = /^([\w\d._\-#])+@([\w\d._\-#]+[.][\w\d._\-#]+)+$/g;
    return Boolean(email) && !emailRegex.test(email);
  };

  const isInvalidPassword = (password) => {
    return !validPassword && password !== '';
  };

  const validateRequiredField = (field: string) => {
    return submitted && field === '';
  };

  const validatePasswordMatch = (password, match) => {
    return (submitted && match === '') || match !== password;
  };

  const onSelectedGroupsChanged = (groupIds) => (selectedGroupsRef.current = groupIds);

  useEffect(() => {
    setSubmitOk(
      Boolean(
        newUser.firstName &&
          newUser.lastName &&
          !isInvalidEmail(newUser.email) &&
          newUser.password &&
          validPassword &&
          passwordConfirm &&
          newUser.password === passwordConfirm
      )
    );
    onSubmittingAndOrPendingChange({
      hasPendingChanges: Boolean(
        newUser.firstName || newUser.email || newUser.password || validPassword || passwordConfirm
      )
    });
  }, [newUser, passwordConfirm, onSubmittingAndOrPendingChange, validPassword]);

  return (
    <form className={classes.form}>
      <DialogBody className={classes.dialogBody}>
        <Grid container spacing={2}>
          <Grid item sm={6}>
            <Grid container spacing={2}>
              <Grid item sm={6}>
                <TextField
                  autoFocus
                  className={clsx(classes.textField)}
                  label={<FormattedMessage id="createUserDialog.firstName" defaultMessage="First Name" />}
                  required
                  fullWidth
                  margin="normal"
                  value={newUser.firstName}
                  error={validateRequiredField(newUser.firstName)}
                  helperText={
                    validateRequiredField(newUser.firstName) && (
                      <FormattedMessage
                        id="createUserDialog.firstNameRequired"
                        defaultMessage="First Name is required."
                      />
                    )
                  }
                  onChange={(e) => setNewUser({ firstName: e.target.value })}
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  className={clsx(classes.textField)}
                  label={<FormattedMessage id="createUserDialog.lastName" defaultMessage="Last Name" />}
                  required
                  fullWidth
                  margin="normal"
                  value={newUser.lastName}
                  error={validateRequiredField(newUser.lastName)}
                  helperText={
                    validateRequiredField(newUser.lastName) && (
                      <FormattedMessage
                        id="createUserDialog.lastNameRequired"
                        defaultMessage="Last Name is required."
                      />
                    )
                  }
                  onChange={(e) => setNewUser({ lastName: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              className={classes.textField}
              label={<FormattedMessage id="words.email" defaultMessage="Email" />}
              required
              fullWidth
              value={newUser.email}
              error={validateRequiredField(newUser.email) || isInvalidEmail(newUser.email)}
              helperText={
                validateRequiredField(newUser.email) ? (
                  <FormattedMessage id="createUserDialog.emailRequired" defaultMessage="Email is required." />
                ) : isInvalidEmail(newUser.email) ? (
                  <FormattedMessage id="createUserDialog.invalidEmail" defaultMessage="Email is invalid." />
                ) : null
              }
              onChange={(e) => setNewUser({ email: e.target.value })}
            />
            <TextField
              className={classes.textField}
              label={<FormattedMessage id="words.username" defaultMessage="Username" />}
              required
              fullWidth
              value={newUser.username}
              error={validateRequiredField(newUser.username)}
              helperText={
                validateRequiredField(newUser.username) && (
                  <FormattedMessage id="createUserDialog.usernameRequired" defaultMessage="Username is required." />
                )
              }
              onChange={(e) => setNewUser({ username: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item sm={6}>
                <PasswordTextField
                  className={classes.textField}
                  label={<FormattedMessage id="words.password" defaultMessage="Password" />}
                  required
                  fullWidth
                  value={newUser.password}
                  error={validateRequiredField(newUser.password) || isInvalidPassword(newUser.password)}
                  helperText={
                    validateRequiredField(newUser.password) ? (
                      <FormattedMessage id="createUserDialog.passwordRequired" defaultMessage="Password is required." />
                    ) : isInvalidPassword(newUser.password) ? (
                      <FormattedMessage id="createUserDialog.passwordInvalid" defaultMessage="Password is invalid." />
                    ) : null
                  }
                  onChange={(e) => setNewUser({ password: e.target.value })}
                  onFocus={(e) => setAnchorEl(e.target)}
                  onBlur={() => setAnchorEl(null)}
                />
              </Grid>
              <Grid item sm={6}>
                <PasswordTextField
                  className={classes.textField}
                  label={
                    <FormattedMessage
                      id="createUserDialog.passwordVerification"
                      defaultMessage="Password Verification"
                    />
                  }
                  fullWidth
                  required
                  value={passwordConfirm}
                  error={validatePasswordMatch(newUser.password, passwordConfirm)}
                  helperText={
                    validatePasswordMatch(newUser.password, passwordConfirm) && (
                      <FormattedMessage
                        id="createUserDialog.passwordMatch"
                        defaultMessage="Must match the previous password."
                      />
                    )
                  }
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={6}>
            <UserGroupMembershipEditor onChange={onSelectedGroupsChanged} />
          </Grid>
        </Grid>
        <Popper
          disablePortal
          open={Boolean(anchorEl)}
          className={classes.popper}
          anchorEl={anchorEl}
          modifiers={[
            {
              name: 'arrow',
              enabled: true,
              options: {
                element: arrowRef.current
              }
            }
          ]}
        >
          <Paper className={classes.paper}>
            <PasswordRequirementsDisplay
              value={newUser.password}
              onValidStateChanged={setValidPassword}
              formatMessage={formatMessage}
              passwordRequirementsRegex={passwordRequirementsRegex}
            />
          </Paper>
          <div className={classes.arrow} ref={arrowRef} />
        </Popper>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={(e) => onClose(e, null)}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" onClick={onSubmit} disabled={!submitOk || isSubmitting} loading={isSubmitting}>
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default CreateUserDialogContainer;
