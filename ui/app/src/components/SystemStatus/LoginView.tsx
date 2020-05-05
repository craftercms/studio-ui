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

import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  login,
  sendPasswordRecovery,
  setPassword as setPasswordService
} from '../../services/auth';
import { insureSingleSlash, isBlank } from '../../utils/string';
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
import PasswordTextField from '../PasswordTextField';

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
  };
}

export interface LoginViewProps {
  passwordRequirementsRegex: string;
}

type Modes = 'login' | 'recover' | 'reset';

type SubViewProps = React.PropsWithChildren<{
  token?: string;
  language?: string;
  setMode?: React.Dispatch<React.SetStateAction<Modes>>;
  children: React.ReactNode;
  isFetching: boolean;
  onSubmit: React.Dispatch<React.SetStateAction<boolean>>;
  classes: { [props: string]: string };
  formatMessage: Function;
  onSnack: React.Dispatch<React.SetStateAction<{ open: boolean; message: string }>>;
}>;

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
    defaultMessage: 'If your username exists, an email will be sent to you with a rest link.'
  },
  recoverYourPasswordSuccessMessage: {
    id: 'loginView.recoverYourPasswordSuccessMessage',
    defaultMessage:
      'Password reset was sent successfully. Please check your email to reset your password.'
  },
  resetPasswordFieldPlaceholderLabel: {
    id: 'resetView.resetPasswordFieldPlaceholderLabel',
    defaultMessage: 'New Password'
  },
  resetPasswordConfirmFieldPlaceholderLabel: {
    id: 'resetView.resetPasswordConfirmFieldPlaceholderLabel',
    defaultMessage: 'Confirm Password'
  },
  resetPasswordSuccess: {
    id: 'resetView.resetPasswordSuccess',
    defaultMessage: 'Password successfully reset. Please login with your new password.'
  },
  resetPasswordError: {
    id: 'resetView.resetPasswordError',
    defaultMessage: 'Error resetting password. Token may be invalid or expired.'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    dialogRoot: {
      transition: 'all 600ms ease'
    },
    dialogRootFetching: {
      opacity: 0.2
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
      margin: `0 auto ${theme.spacing(1.5)}px`
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
        marginRight: theme.spacing(0.5),
        color: palette.white
      }
    },
    resetPassword: {
      marginBottom: 10
    }
  })
);

const dispatchLanguageChange = (language: string) => {
  let event = new CustomEvent('setlocale', { detail: language });
  document.dispatchEvent(event);
};

function LoginView(props: SubViewProps) {
  const { children, isFetching, onSubmit, classes, formatMessage, language } = props;
  const [username, setUsername] = useState(() => localStorage.getItem('userName') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!(isBlank(password) || isBlank(username))) {
      onSubmit(true);
      setRequestForgeryToken();
      login({ username, password }).subscribe(
        () => {
          setError('');
          onSubmit(false);
          localStorage.setItem('crafterStudioLanguage', language);
          localStorage.setItem('userName', username);
          localStorage.setItem(`${username}_crafterStudioLanguage`, language);
          setTimeout(() => {
            let redirectUrl = parse(window.location.search).redirect as string;
            redirectUrl = decodeURIComponent(redirectUrl ?? '/studio');
            if (!redirectUrl.includes('/studio')) {
              redirectUrl = '/studio';
            } else if (!redirectUrl.startsWith('/studio')) {
              redirectUrl = redirectUrl.substring(redirectUrl.indexOf('/studio'));
            }
            redirectUrl = insureSingleSlash(redirectUrl.replace(/\.\./g, ''));
            window.location.href = redirectUrl + window.location.hash;
          });
        },
        () => {
          onSubmit(false);
          setError(formatMessage(translations.incorrectCredentialsMessage));
        }
      );
    }
  };
  return (
    <>
      <DialogContent>
        <HeaderView error={error} introMessage="" classes={classes} />
        <LogInForm
          classes={classes}
          onSubmit={submit}
          username={username}
          password={password}
          isFetching={isFetching}
          enableUsernameInput={true}
          onSetPassword={setPassword}
          onSetUsername={setUsername}
        />
        {children}
      </DialogContent>
      <DialogActions>
        <Button
          type="button"
          color="primary"
          onClick={submit}
          disabled={isFetching}
          variant="contained"
          fullWidth
        >
          <FormattedMessage id="loginView.loginButtonLabel" defaultMessage="Log In" />
        </Button>
      </DialogActions>
    </>
  );
}

function RecoverView(props: SubViewProps) {
  const { children, isFetching, onSubmit, classes, formatMessage, onSnack, setMode } = props;
  const [username, setUsername] = useState(() => localStorage.getItem('userName') ?? '');
  const [error, setError] = useState('');
  const onSubmitRecover = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    onSubmit(true);
    setRequestForgeryToken();
    !isBlank(username) &&
    sendPasswordRecovery(username).subscribe(
      () => {
        onSubmit(false);
        setMode('login');
        onSnack({
          open: true,
          message: formatMessage(translations.recoverYourPasswordSuccessMessage)
        });
      },
      (error) => {
        onSubmit(false);
        setError(error.message);
      }
    );
  };
  return (
    <>
      <DialogContent>
        <HeaderView
          error={error}
          classes={classes}
          introMessage={formatMessage(translations.recoverYourPasswordViewTitle)}
        />
        <form onSubmit={onSubmitRecover}>
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
              <FormattedMessage id="loginView.usernameTextFieldLabel" defaultMessage="Username" />
            }
          />
          {/* This button is just to have the form submit when pressing enter. */}
          <Button
            children=""
            type="submit"
            onClick={onSubmitRecover}
            disabled={isFetching}
            style={{ display: 'none' }}
          />
        </form>
        {children}
      </DialogContent>
      <DialogActions>
        <Button
          type="button"
          color="primary"
          onClick={onSubmitRecover}
          disabled={isFetching}
          variant="contained"
          fullWidth
        >
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </Button>
      </DialogActions>
      <DialogActions>
        <Button
          fullWidth
          type="button"
          color="primary"
          variant="text"
          disabled={isFetching}
          onClick={() => setMode('login')}
        >
          &laquo;{' '}
          <FormattedMessage
            id="loginView.recoverYourPasswordBackButtonLabel"
            defaultMessage="Back"
          />
        </Button>
      </DialogActions>
    </>
  );
}

function ResetView(props: SubViewProps) {
  const { children, isFetching, onSubmit, classes, formatMessage, onSnack, setMode, token } = props;
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordsMismatch, setPasswordMismatch] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isBlank(newPasswordConfirm) || newPasswordConfirm === newPassword) {
      setPasswordMismatch(false);
    } else if (newPasswordConfirm !== newPassword) {
      setPasswordMismatch(true);
    }
  }, [newPassword, newPasswordConfirm]);
  const submit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBlank(newPassword) && !isBlank(newPasswordConfirm)) {
      onSubmit(true);
      setRequestForgeryToken();
      setPasswordService(token, newPassword, newPasswordConfirm).subscribe(
        () => {
          onSubmit(false);
          setMode('login');
          onSnack({ open: true, message: formatMessage(translations.resetPasswordSuccess) });
        },
        () => {
          onSubmit(false);
          setError(formatMessage(translations.resetPasswordError));
        }
      );
    }
  };
  return (
    <>
      <DialogContent>
        <HeaderView
          error={error}
          classes={classes}
          introMessage={
            <FormattedMessage
              id="loginView.resetYourPasswordIntroText"
              defaultMessage="Please enter your new password"
            />
          }
        />
        <form onSubmit={submit}>
          <PasswordTextField
            id="resetFormPasswordField"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={classes.resetPassword}
            placeholder={formatMessage(translations.resetPasswordFieldPlaceholderLabel)}
          />
          <PasswordTextField
            id="resetFormPasswordConfirmField"
            fullWidth
            error={passwordsMismatch}
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            className={classes.resetPassword}
            placeholder={formatMessage(translations.resetPasswordConfirmFieldPlaceholderLabel)}
          />
          {/* This button is just to have the form submit when pressing enter. */}
          <Button
            children=""
            type="submit"
            onClick={submit}
            disabled={isFetching}
            style={{ display: 'none' }}
          />
        </form>
        {children}
      </DialogContent>
      <DialogActions>
        <Button
          type="button"
          color="primary"
          onClick={submit}
          disabled={isFetching}
          variant="contained"
          fullWidth
        >
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </Button>
      </DialogActions>
    </>
  );
}

function HeaderView({ error, introMessage, classes }: any) {
  return (
    <Typography variant="body2" className={classes[error ? 'errorMessage' : 'recoverInfoMessage']}>
      {error ? (
        <>
          <WarningRounded /> {error}
        </>
      ) : (
        introMessage
      )}
    </Typography>
  );
}

function UnrecognizedView({ classes }: any) {
  return (
    <DialogContent>
      <Typography variant="body2" className={classes.recoverInfoMessage}>
        Unrecognized mode.
      </Typography>
    </DialogContent>
  )
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
        {languages?.map(({ id, label }) => (
          <MenuItem value={id} key={id}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

export default function(props: LoginViewProps) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const token = parse(window.location.search).token as string;

  const [mode, setMode] = useState<Modes>(token ? 'reset' : 'login');
  const [language, setLanguage] = useState(() => getCurrentLocale());
  const [languages, setLanguages] = useState<SystemLang[]>();
  const [snack, onSnack] = useState({ open: false, message: '' });
  const [isFetching, onSubmit] = useState(false);

  let [CurrentView, setCurrentView] = useState<React.ElementType>(() => LoginView);
  let currentViewProps: SubViewProps = {
    setMode,
    token,
    language,
    formatMessage,
    isFetching,
    classes,
    onSubmit,
    onSnack,
    children: (
      <LanguageDropDown
        language={language}
        languages={languages}
        onChange={setLanguage}
        classes={{
          label: classes.languageSelectLabel,
          dropDown: classes.languageSelect
        }}
      />
    )
  };

  // Retrieve Platform Languages.
  useEffect(() => {
    getProductLanguages().subscribe(setLanguages);
  }, []);

  // View specific adjustments (based on mode).
  useEffect(() => {
    switch (mode) {
      case 'login':
        setCurrentView(() => LoginView);
        break;
      case 'recover':
        setCurrentView(() => RecoverView);
        const EVENT = 'keydown';
        const handler = (e: any) => {
          if (e.key === 'Escape') {
            setMode('login');
          }
        };
        document.addEventListener(EVENT, handler, false);
        return () => {
          document.removeEventListener(EVENT, handler, false);
        };
      case 'reset':
        setCurrentView(() => ResetView);
        break;
      default:
        setCurrentView(() => UnrecognizedView);
        break;
    }
  }, [mode]);

  // Dispatch custom event when language is changed.
  useEffect(() => {
    language && dispatchLanguageChange(language);
  }, [language]);

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
        <CurrentView {...currentViewProps} />
        {mode !== 'reset' && <DialogActions>
          <Button
            type="button"
            color="primary"
            disabled={isFetching}
            variant="text"
            fullWidth
            onClick={() => setMode('recover')}
          >
            <FormattedMessage
              id="loginView.forgotPasswordButtonLabel"
              defaultMessage="Forgot your password?"
            />
          </Button>
        </DialogActions>}
      </Dialog>
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => onSnack({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={snack.message}
      />
    </>
  );
}
