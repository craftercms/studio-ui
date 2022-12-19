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

import Box from '@mui/material/Box';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import useStyles from './styles';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import { dispatchLanguageChange, getCurrentLocale, setStoredLanguage } from '../../utils/i18n';
import { SystemLang } from '../LoginView/LoginView';
import { fetchProductLanguages } from '../../services/configuration';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Skeleton from '@mui/material/Skeleton';
import PasswordTextField from '../PasswordTextField/PasswordTextField';
import PrimaryButton from '../PrimaryButton';
import { setMyPassword } from '../../services/users';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import { useActiveUser } from '../../hooks/useActiveUser';
import { PasswordStrengthDisplayPopper } from '../PasswordStrengthDisplayPopper';

interface AccountManagementProps {
  passwordRequirementsMinComplexity?: number;
}

const translations = defineMessages({
  languageUpdated: {
    id: 'accountManagement.languageUpdated',
    defaultMessage: 'Language preference changed'
  },
  passwordChanged: {
    id: 'accountManagement.passwordChanged',
    defaultMessage: 'Password changed successfully'
  }
});

export function AccountManagement(props: AccountManagementProps) {
  const { passwordRequirementsMinComplexity = 4 } = props;

  const { classes, cx: clsx } = useStyles();
  const user = useActiveUser();
  const [language, setLanguage] = useState(() => getCurrentLocale());
  const [languages, setLanguages] = useState<SystemLang[]>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [anchorEl, setAnchorEl] = useState(null);

  // Retrieve Platform Languages.
  useEffect(() => {
    fetchProductLanguages().subscribe(setLanguages);
  }, []);

  const onLanguageChanged = (language: string) => {
    setLanguage(language);
    setStoredLanguage(language, user.username);
    dispatchLanguageChange(language);
    dispatch(
      showSystemNotification({
        message: formatMessage(translations.languageUpdated)
      })
    );
  };

  const onSave = () => {
    setMyPassword(user.username, currentPassword, newPassword).subscribe({
      next() {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.passwordChanged)
          })
        );
        setCurrentPassword('');
        setVerifiedPassword('');
        setNewPassword('');
      },
      error({ response: { response } }) {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar title={<FormattedMessage id="words.account" defaultMessage="Account" />} />
      <Container maxWidth="md">
        <Paper className={clsx(classes.paper, 'mt20')}>
          <Box display="flex" alignItems="center">
            <Avatar className={classes.avatar}>
              {user.firstName.charAt(0)}
              {user.lastName?.charAt(0) ?? ''}
            </Avatar>
            <section>
              <Typography>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography>{user.email}</Typography>
            </section>
          </Box>
        </Paper>
        <Paper className={classes.paper}>
          <Typography variant="h5">
            <FormattedMessage id="accountManagement.changeLanguage" defaultMessage="Change Language" />
          </Typography>
          <Box marginTop="16px">
            {languages ? (
              <TextField
                fullWidth
                select
                label={<FormattedMessage id="words.language" defaultMessage="Language" />}
                value={language}
                onChange={(event) => onLanguageChanged(event.target.value)}
              >
                {languages?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Skeleton width="100%" height="80px" />
            )}
          </Box>
        </Paper>
        <Paper className={classes.paper}>
          <Typography variant="h5">
            <FormattedMessage id="accountManagement.changePassword" defaultMessage="Change Password" />
          </Typography>
          <FormHelperText>
            <FormattedMessage
              id="accountManagement.changeHelperText"
              defaultMessage="Once your password has been successfully updated, you'll be required to login again."
            />
          </FormHelperText>
          <Box display="flex" flexDirection="column">
            <PasswordTextField
              margin="normal"
              label={<FormattedMessage id="accountManagement.currentPassword" defaultMessage="Current Password" />}
              required
              fullWidth
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
              }}
            />
            <PasswordTextField
              margin="normal"
              label={<FormattedMessage id="accountManagement.newPassword" defaultMessage="New Password" />}
              required
              fullWidth
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
              error={Boolean(newPassword) && !validPassword}
              helperText={
                newPassword &&
                !validPassword && (
                  <FormattedMessage id="accountManagement.passwordInvalid" defaultMessage="Password is invalid." />
                )
              }
              onFocus={(e) => setAnchorEl(e.target)}
              onBlur={() => setAnchorEl(null)}
              inputProps={{ autoComplete: 'new-password' }}
            />
            <PasswordTextField
              margin="normal"
              label={<FormattedMessage id="accountManagement.confirmPassword" defaultMessage="Confirm Password" />}
              required
              fullWidth
              value={verifiedPassword}
              onChange={(e) => {
                setVerifiedPassword(e.target.value);
              }}
              error={newPassword !== verifiedPassword}
              helperText={
                newPassword !== verifiedPassword && (
                  <FormattedMessage
                    id="accountManagement.passwordMatch"
                    defaultMessage="Must match the previous password."
                  />
                )
              }
            />
            <PrimaryButton
              disabled={!validPassword || newPassword !== verifiedPassword || currentPassword === ''}
              className={classes.save}
              onClick={() => onSave()}
            >
              <FormattedMessage id="words.save" defaultMessage="Save" />
            </PrimaryButton>
          </Box>
        </Paper>
      </Container>

      <PasswordStrengthDisplayPopper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="top"
        value={newPassword}
        passwordRequirementsMinComplexity={passwordRequirementsMinComplexity}
        onValidStateChanged={setValidPassword}
      />
    </Paper>
  );
}

export default AccountManagement;
