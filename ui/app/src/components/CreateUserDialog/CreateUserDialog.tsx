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

import Dialog from '@material-ui/core/Dialog';
import React, { useRef, useState } from 'react';
import DialogHeader from '../Dialogs/DialogHeader';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import TextField from '@material-ui/core/TextField';
import { useSpreadState } from '../../utils/hooks';
import PasswordTextField from '../Controls/PasswordTextField';
import PasswordRequirementsDisplay from '../PasswordRequirementsDisplay';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';

interface CreateUserDialogProps {
  open: boolean;
  onClose(): void;
  onCreateSuccess?(): void;
  passwordRequirementsRegex: string;
}

const styles = makeStyles((theme) =>
  createStyles({
    popper: {
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
      padding: '12px 0',
      '&:first-child': {
        paddingTop: 0
      },
      '&:last-child': {
        paddingBottom: 0
      }
    },
    form: {
      display: 'contents'
    },
    dialogBody: {
      overflow: 'auto'
    },
    // Password requirements
    listOfConditions: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    conditionItem: {
      display: 'flex',
      alignItems: 'center'
    },
    conditionItemIcon: {
      marginRight: theme.spacing(1)
    },
    conditionItemNotMet: {
      color: palette.yellow.shade
    },
    conditionItemMet: {
      color: palette.green.shade
    }
  })
);

export default function CreateUserDialog(props: CreateUserDialogProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <CreateUserDialogUI {...props} />
    </Dialog>
  );
}

function CreateUserDialogUI(props: CreateUserDialogProps) {
  const { onClose, passwordRequirementsRegex } = props;
  const [newUser, setNewUser] = useSpreadState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    enabled: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = styles();
  const { formatMessage } = useIntl();
  const arrowRef = useRef();

  const onSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^([\w\d._\-#])+@([\w\d._\-#]+[.][\w\d._\-#]+)+$/g;
    return Boolean(email) && !emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return !validPassword && password !== '';
  };

  const validateRequiredField = (field: string) => {
    return submitted && field === '';
  };

  const validatePasswordMatch = (password, match) => {
    return (submitted && match === '') || match !== password;
  };

  return (
    <form className={classes.form}>
      <DialogHeader title={<FormattedMessage id="CreateUserDialog.title" defaultMessage="Create User" />} />
      <DialogBody className={classes.dialogBody}>
        <TextField
          className={classes.textField}
          label={<FormattedMessage id="createUserDialog.firstName" defaultMessage="First Name" />}
          required
          value={newUser.firstName}
          error={validateRequiredField(newUser.firstName)}
          helperText={
            validateRequiredField(newUser.firstName) && (
              <FormattedMessage id="createUserDialog.firstNameRequired" defaultMessage="First Name is required." />
            )
          }
          onChange={(e) => setNewUser({ firstName: e.target.value })}
        />
        <TextField
          className={classes.textField}
          label={<FormattedMessage id="createUserDialog.lastName" defaultMessage="Last Name" />}
          required
          value={newUser.lastName}
          error={validateRequiredField(newUser.lastName)}
          helperText={
            validateRequiredField(newUser.lastName) && (
              <FormattedMessage id="createUserDialog.lastNameRequired" defaultMessage="Last Name is required." />
            )
          }
          onChange={(e) => setNewUser({ lastName: e.target.value })}
        />
        <TextField
          className={classes.textField}
          label={<FormattedMessage id="createUserDialog.email" defaultMessage="Email" />}
          required
          value={newUser.email}
          error={validateRequiredField(newUser.email) || validateEmail(newUser.email)}
          helperText={
            validateRequiredField(newUser.email) ? (
              <FormattedMessage id="createUserDialog.emailRequired" defaultMessage="Email is required." />
            ) : validateEmail(newUser.email) ? (
              <FormattedMessage id="createUserDialog.invalidEmail" defaultMessage="Email is invalid." />
            ) : null
          }
          onChange={(e) => setNewUser({ email: e.target.value })}
        />
        <TextField
          className={classes.textField}
          label={<FormattedMessage id="createUserDialog.username" defaultMessage="Username" />}
          required
          value={newUser.username}
          error={validateRequiredField(newUser.username)}
          helperText={
            validateRequiredField(newUser.username) && (
              <FormattedMessage id="createUserDialog.usernameRequired" defaultMessage="Username is required." />
            )
          }
          onChange={(e) => setNewUser({ username: e.target.value })}
        />
        <PasswordTextField
          className={classes.textField}
          label={<FormattedMessage id="createUserDialog.password" defaultMessage="Password" />}
          required
          value={newUser.password}
          error={validateRequiredField(newUser.password) || validatePassword(newUser.password)}
          helperText={
            validateRequiredField(newUser.password) ? (
              <FormattedMessage id="createUserDialog.password" defaultMessage="Password is required." />
            ) : validatePassword(newUser.password) ? (
              <FormattedMessage id="createUserDialog.password" defaultMessage="Password is invalid." />
            ) : null
          }
          onChange={(e) => setNewUser({ password: e.target.value })}
          onFocus={(e) => setAnchorEl(e.target)}
          onBlur={() => setAnchorEl(null)}
        />
        <PasswordTextField
          className={classes.textField}
          label={<FormattedMessage id="createUserDialog.passwordVerification" defaultMessage="Password Verification" />}
          required
          value={passwordMatch}
          error={validatePasswordMatch(newUser.password, passwordMatch)}
          helperText={
            validatePasswordMatch(newUser.password, passwordMatch) && (
              <FormattedMessage
                id="createUserDialog.passwordMatch"
                defaultMessage="Must match the previous password."
              />
            )
          }
          onChange={(e) => setPasswordMatch(e.target.value)}
        />
        <Popper
          open={Boolean(anchorEl)}
          className={classes.popper}
          anchorEl={anchorEl}
          disablePortal={true}
          modifiers={{
            arrow: {
              enabled: true,
              element: arrowRef.current
            }
          }}
        >
          <Paper className={classes.paper}>
            <PasswordRequirementsDisplay
              classes={classes}
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
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" onClick={onSubmit} autoFocus>
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}
