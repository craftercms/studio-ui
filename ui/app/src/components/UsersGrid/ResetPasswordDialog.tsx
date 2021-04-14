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
import React, { useState } from 'react';
import User from '../../models/User';
import DialogHeader from '../Dialogs/DialogHeader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import { setPassword } from '../../services/users';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import FormHelperText from '@material-ui/core/FormHelperText';
import CancelRoundedIcon from '@material-ui/icons/CancelRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import { createStyles, makeStyles } from '@material-ui/core/styles';

interface ResetPasswordDialogProps {
  open: boolean;
  onClose(): void;
  user: User;
}

const styles = makeStyles((theme) =>
  createStyles({
    helperText: {
      display: 'flex',
      alignItems: 'center',
      '& svg': { marginRight: '5px' }
    },
    iconWarning: {
      color: theme.palette.error.main
    },
    iconSuccess: {
      color: theme.palette.success.main
    },
    specialCharacters: {
      marginLeft: '5px'
    }
  })
);

const translations = defineMessages({
  passwordUpdated: {
    id: 'resetPasswordDialog.passwordUpdated',
    defaultMessage: 'Password updated successfully'
  }
});

export default function ResetPasswordDialog(props: ResetPasswordDialogProps) {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <ResetPasswordDialogUI {...props} />
    </Dialog>
  );
}

function ResetPasswordDialogUI(props: ResetPasswordDialogProps) {
  const { onClose, user } = props;
  const [newPassword, setNewPassword] = useState('');
  const [validPassword, setValidPassword] = useState({
    number: null,
    lowerCase: null,
    upperCase: null,
    specialCharacter: null,
    length: null,
    valid: null
  });
  const [updating, setUpdating] = useState(false);
  const classes = styles();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const onSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setUpdating(true);
    setPassword(user.username, newPassword).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.passwordUpdated)
          })
        );
        setUpdating(false);
        onClose();
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const validatePassword = (password: string) => {
    const numberValidation = /\d+/g;
    const lowerCaseLetterValidation = /[a-z]+/g;
    const upperCaseLetterValidation = /[A-Z]+/g;
    const specialCharacterValidation = /[~,|,!,`,\,,;,\\,/,@,#,$,%,^,&,+,=]+/g;
    const lengthValidation = /^.{8,}$/g;
    const validation = { ...validPassword };
    validation.number = numberValidation.test(password);
    validation.lowerCase = lowerCaseLetterValidation.test(password);
    validation.upperCase = upperCaseLetterValidation.test(password);
    validation.specialCharacter = specialCharacterValidation.test(password);
    validation.length = lengthValidation.test(password);
    validation.valid =
      validation.number &&
      validation.lowerCase &&
      validation.upperCase &&
      validation.specialCharacter &&
      validation.length;
    setValidPassword(validation);
  };

  return (
    <form onSubmit={onSubmit}>
      <DialogHeader
        title={<FormattedMessage id="resetPasswordDialog.title" defaultMessage="Reset Password" />}
        onDismiss={onClose}
      />
      <DialogBody>
        <Typography variant="body2">
          <FormattedMessage
            id="resetPasswordDialog.helperText"
            defaultMessage='Set a new password for "{user}" user'
            values={{ user: props.user.username }}
          />
        </Typography>
        <TextField
          value={newPassword}
          autoFocus
          required
          type="password"
          placeholder="●●●●●●●●"
          margin="normal"
          onChange={(e) => {
            validatePassword(e.target.value);
            setNewPassword(e.target.value);
          }}
        />
        <FormHelperText className={classes.helperText}>
          {validPassword.number === false || validPassword.number === null ? (
            <CancelRoundedIcon fontSize="small" className={classes.iconWarning} />
          ) : (
            <CheckCircleRoundedIcon fontSize="small" className={classes.iconSuccess} />
          )}
          <FormattedMessage
            id="resetPasswordDialog.numberValidation"
            defaultMessage="Must contain at least one number"
          />
        </FormHelperText>
        <FormHelperText className={classes.helperText}>
          {validPassword.lowerCase === false || validPassword.lowerCase === null ? (
            <CancelRoundedIcon fontSize="small" className={classes.iconWarning} />
          ) : (
            <CheckCircleRoundedIcon fontSize="small" className={classes.iconSuccess} />
          )}
          <FormattedMessage
            id="resetPasswordDialog.lowerCaseValidation"
            defaultMessage="Must contain at least one lowercase letter"
          />
        </FormHelperText>
        <FormHelperText className={classes.helperText}>
          {validPassword.upperCase === false || validPassword.upperCase === null ? (
            <CancelRoundedIcon fontSize="small" className={classes.iconWarning} />
          ) : (
            <CheckCircleRoundedIcon fontSize="small" className={classes.iconSuccess} />
          )}
          <FormattedMessage
            id="resetPasswordDialog.upperCaseValidation"
            defaultMessage="Must contain at least one uppercase letter"
          />
        </FormHelperText>
        <FormHelperText className={classes.helperText}>
          {validPassword.specialCharacter === false || validPassword.specialCharacter === null ? (
            <CancelRoundedIcon fontSize="small" className={classes.iconWarning} />
          ) : (
            <CheckCircleRoundedIcon fontSize="small" className={classes.iconSuccess} />
          )}
          <FormattedMessage
            id="resetPasswordDialog.specialCharacterValidation"
            defaultMessage="Must contain at least one special character <b> ~|!,;`\/@#$%^&+= </b>"
            values={{
              b: (message) => <strong className={classes.specialCharacters}>{message}</strong>
            }}
          />
        </FormHelperText>
        <FormHelperText className={classes.helperText}>
          {validPassword.length === false || validPassword.length === null ? (
            <CancelRoundedIcon fontSize="small" className={classes.iconWarning} />
          ) : (
            <CheckCircleRoundedIcon fontSize="small" className={classes.iconSuccess} />
          )}
          <FormattedMessage
            id="resetPasswordDialog.lengthValidation"
            defaultMessage="Length must be at least 8 characters "
          />
        </FormHelperText>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          onClick={onSubmit}
          autoFocus
          disabled={newPassword === '' || updating || !validPassword.valid}
        >
          {updating ? <CircularProgress size={20} /> : <FormattedMessage id="words.submit" defaultMessage="Submit" />}
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}
