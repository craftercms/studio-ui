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

import React, { useEffect, useReducer, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { login, sendPasswordRecovery } from '../../services/auth';
import { isBlank } from '../../utils/string';
import Typography from '@material-ui/core/Typography';
import { setRequestForgeryToken } from '../../utils/auth';
import { LogInForm } from './LoginForm';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { getProductLanguages } from '../../services/configuration';
import { palette } from '../../styles/theme';
import WarningRounded from '@material-ui/icons/WarningRounded';
import { parse } from 'query-string';
import { getCurrentLocale } from '../CrafterCMSNextBridge';
import TextField from '@material-ui/core/TextField';
import { Snackbar } from '@material-ui/core';

const translations = defineMessages({
  loginDialogTitle: {
    id: 'loginView.dialogTitleText',
    defaultMessage: 'Login to Crafter CMS'
  },
  incorrectCredentialsMessage: {
    id: 'loginView.incorrectCredentialsMessage',
    defaultMessage: 'Incorrect username or password. Please try again.'
  },
  languageDropDownLabel: {
    id: 'words.language',
    defaultMessage: 'Language'
  },
  recoverYourPasswordViewTitle: {
    id: 'loginView.recoverYourPasswordIntroText',
    defaultMessage: 'If your email/username exists, an email will be sent to you with a rest link.'
  },
  recoverYourPasswordSuccessMessage: {
    id: 'loginView.recoverYourPasswordSuccessMessage',
    defaultMessage: 'Password reset was sent successfully. Please check your email to reset your password.'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  dialogRoot: {
    transition: 'all 600ms ease'
  },
  dialogRootFetching: {
    opacity: .2
  },
  dialogPaper: {
    minWidth: 300,
    backgroundColor: 'rgba(255, 255, 255, .8)',
    '& .MuiInputLabel-root': {
      color: '#000'
    }
  },
  logo: {
    maxWidth: 250,
    display: 'block',
    margin: `${theme.spacing(2)}px auto ${theme.spacing(1)}px`
  },
  username: {
    marginBottom: theme.spacing(2),
    '& .MuiInput-input': { backgroundColor: '#fff' }
  },
  password: {
    '& .MuiInput-input': { backgroundColor: '#fff' }
  },
  languageSelect: {
    margin: 0,
    backgroundColor: '#fff'
  },
  languageSelectLabel: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '& + .language-select-dropdown': {
      marginTop: '0 !important'
    }
  },
  recoverInfoMessage: {
    maxWidth: 300,
    textAlign: 'center',
    marginBottom: theme.spacing(1.5)
  },
  errorMessage: {
    backgroundColor: palette.red.tint,
    color: palette.white,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    border: `1px solid ${palette.red.main}`,
    display: 'flex',
    placeContent: 'center',
    lineHeight: 1.7,
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(.5),
      color: palette.white
    }
  }
}));

const dispatchLanguageChange = (language: string) => {
  let event = new CustomEvent('setlocale', { 'detail': language });
  document.dispatchEvent(event);
};

export default function LoginView() {

  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const [username, setUsername] = useState(() => (localStorage.getItem('userName') ?? ''));
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'recover'>('login');
  const [language, setLanguage] = useState(() => getCurrentLocale());
  const [languages, setLanguages] = useState<SystemLang[]>();
  const [recoverSnack, setRecoverSnack] = useState({ open: false, message: '' });
  const [{ error, isFetching }, setState] = useReducer(
    (state: any, nextState: any) => ({ ...state, ...nextState }),
    { error: null, isFetching: false }
  );

  useEffect(() => {
    getProductLanguages().subscribe(setLanguages);
  }, []);

  useEffect(() => {
    if (mode === 'recover') {
      const EVENT = 'keydown';
      const handler = (e: any) => {
        if (e.key === 'Escape') {
          setMode('login');
        }
      };
      document.addEventListener(EVENT, handler, false);
      return () => {
        document.removeEventListener(EVENT, handler, false);
      }
    }
  }, [mode]);

  useEffect(() => {
    language && dispatchLanguageChange(language);
  }, [language]);

  const onSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setRequestForgeryToken();
    if (!(isBlank(password) || isBlank(username))) {
      setState({ isFetching: true, error: null });
      login({ username, password }).subscribe(
        () => {
          localStorage.setItem('crafterStudioLanguage', language);
          localStorage.setItem('userName', username);
          localStorage.setItem(`${username}_crafterStudioLanguage`, language);
          setTimeout(() => {
            const redirectUrl = parse(window.location.search)['redirect'] as string;
            window.location.href = redirectUrl ?? '/studio';
          });
        },
        () => {
          setState({
            isFetching: false,
            error: { message: formatMessage(translations.incorrectCredentialsMessage) }
          });
        }
      );
    }
  };

  const onSubmitReset = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setRequestForgeryToken();
    !isBlank(username) && sendPasswordRecovery(username).subscribe(
      () => {
        setMode('login');
        setRecoverSnack({ open: true, message: formatMessage(translations.recoverYourPasswordSuccessMessage) });
      },
      (error) => {
        setRecoverSnack({ open: true, message: error.message });
      }
    );
  };

  return (
    <>
      <Dialog
        open={true}
        className={`${classes.dialogRoot} ${isFetching ? classes.dialogRootFetching : ''}`}
        PaperProps={{ className: classes.dialogPaper }}
        aria-labelledby="loginDialog"
      >
        <DialogTitle id="loginDialog">
          <img
            className={classes.logo}
            src="/studio/static-assets/images/logo.svg"
            alt={formatMessage(translations.loginDialogTitle)}
          />
        </DialogTitle>
        {
          mode === 'login' ? (
            <>
              <DialogContent>
                {
                  error &&
                  <Typography variant="body2" className={classes.errorMessage}>
                    <WarningRounded /> {error.message}
                  </Typography>
                }
                <LogInForm
                  classes={classes}
                  onSubmit={onSubmit}
                  username={username}
                  password={password}
                  isFetching={isFetching}
                  enableUsernameInput={true}
                  onSetPassword={setPassword}
                  onSetUsername={setUsername}
                />
                <LanguageDropDown
                  language={language}
                  languages={languages}
                  onChange={setLanguage}
                  classes={{
                    label: classes.languageSelectLabel,
                    dropDown: classes.languageSelect
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  type="button"
                  color="primary"
                  onClick={onSubmit}
                  disabled={isFetching}
                  variant="contained"
                  fullWidth
                >
                  <FormattedMessage id="loginView.loginButtonLabel" defaultMessage="Log In" />
                </Button>
              </DialogActions>
              <DialogActions>
                <Button
                  type="button"
                  color="primary"
                  disabled={isFetching}
                  variant="text"
                  fullWidth
                  onClick={() => setMode('recover')}
                >
                  <FormattedMessage id="loginView.forgotPasswordButtonLabel" defaultMessage="Forgot your password?" />
                </Button>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogContent>
                <Typography variant="body2" className={classes.recoverInfoMessage}>
                  {formatMessage(translations.recoverYourPasswordViewTitle)}
                </Typography>
                <form onSubmit={onSubmitReset}>
                  <TextField
                    id="recoverFormUsernameField"
                    fullWidth
                    autoFocus
                    disabled={isFetching}
                    type="text"
                    value={username}
                    onChange={(e: any) => setUsername(e.target.value)}
                    className={classes?.username}
                    label={
                      <FormattedMessage
                        id="loginView.usernameTextFieldLabel"
                        defaultMessage="Email/Username"
                      />
                    }
                  />
                  {/* This button is just to have the form submit when pressing enter. */}
                  <Button
                    children=""
                    type="submit"
                    onClick={onSubmitReset}
                    disabled={isFetching}
                    style={{ display: 'none' }}
                  />
                </form>
                <LanguageDropDown
                  language={language}
                  languages={languages}
                  onChange={setLanguage}
                  classes={{
                    label: classes.languageSelectLabel,
                    dropDown: classes.languageSelect
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  type="button"
                  color="primary"
                  onClick={onSubmitReset}
                  disabled={isFetching}
                  variant="contained"
                  fullWidth
                >
                  <FormattedMessage
                    id="loginView.loginButtonLabel"
                    defaultMessage="Submit"
                  />
                </Button>
              </DialogActions>
              <DialogActions>
                <Button
                  type="button"
                  color="primary"
                  disabled={isFetching}
                  variant="text"
                  onClick={() => setMode('login')}
                  fullWidth
                >
                  &laquo; <FormattedMessage
                  id="loginView.recoverYourPasswordBackButtonLabel"
                  defaultMessage="Back"
                />
                </Button>
              </DialogActions>
            </>
          )
        }
      </Dialog>
      <Snackbar
        open={recoverSnack.open}
        autoHideDuration={5000}
        onClose={() => setRecoverSnack({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={recoverSnack.message}
      />
    </>
  );
}

interface SystemLang {
  id: string;
  label: string;
}

interface LanguageDropDownProps {
  language: string;
  onChange: Function;
  languages: SystemLang[];
  classes?: {
    label?: string;
    dropDown?: string;
  }
}

function LanguageDropDown(props: LanguageDropDownProps) {

  const { formatMessage } = useIntl();
  const { classes, language, languages, onChange } = props;

  return (
    <>
      <InputLabel id="languageSelectDropDown-label" className={classes?.label}>
        {formatMessage(translations.languageDropDownLabel)}
      </InputLabel>
      <Select
        fullWidth
        value={language}
        id="languageSelectDropDown"
        onChange={(e: any) => onChange(e.target.value)}
        className={`${classes?.dropDown} language-select-dropdown`}
      >
        {
          languages?.map(({ id, label }) =>
            <MenuItem value={id} key={id}>
              {label}
            </MenuItem>
          )
        }
      </Select>
    </>
  );
}
