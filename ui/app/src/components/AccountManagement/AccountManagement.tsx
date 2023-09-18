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
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import useSiteLookup from '../../hooks/useSiteLookup';
import Button from '@mui/material/Button';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { preferencesGroups } from './utils';

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
  const sitesLookup = useSiteLookup();
  const sitesIds = Object.keys(sitesLookup);
  const [selectedSite, setSelectedSite] = useState('all');

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

  const onClearPreference = (group, showNotification = true) => {
    if (selectedSite === 'all') {
      sitesIds.forEach((siteId) => {
        group.onClear({
          siteId,
          siteUuid: sitesLookup[siteId].uuid,
          username: user.username
        });
      });
    } else {
      group.onClear({
        siteId: selectedSite,
        siteUuid: sitesLookup[selectedSite].uuid,
        username: user.username
      });
    }
    if (showNotification) {
      dispatch(showSystemNotification({ message: formatMessage({ defaultMessage: 'Preferences cleared' }) }));
    }
  };

  const onClearEverything = () => {
    preferencesGroups.forEach((group) => onClearPreference(group, false));
    dispatch(showSystemNotification({ message: formatMessage({ defaultMessage: 'Preferences cleared' }) }));
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
        <Paper className={classes.paper}>
          <Typography variant="h5" mb={3}>
            <FormattedMessage defaultMessage="Stored Preferences" />
          </Typography>
          <Typography mb={3} variant="body2">
            <FormattedMessage defaultMessage="Studio stores several of your usage preferences. Try cleaning them to restore defaults or troubleshooting seeing the latest changes." />
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>
                <FormattedMessage defaultMessage="Project" />
              </InputLabel>
              <Select
                value={selectedSite}
                label={<FormattedMessage defaultMessage="Project" />}
                onChange={(event) => {
                  setSelectedSite(event.target.value as string);
                }}
              >
                <MenuItem value="all">
                  <FormattedMessage defaultMessage="All Projects" />
                </MenuItem>
                {sitesIds.map((siteId) => (
                  <MenuItem key={siteId} value={siteId}>
                    {sitesLookup[siteId].name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" color="warning" size="large" onClick={onClearEverything}>
              <FormattedMessage defaultMessage="Clear everything" />{' '}
              {selectedSite === 'all' && <FormattedMessage defaultMessage="(All Projects)" />}
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {preferencesGroups.map((group, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {group.label}
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="text" onClick={() => onClearPreference(group)}>
                        <FormattedMessage defaultMessage="Clear" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
