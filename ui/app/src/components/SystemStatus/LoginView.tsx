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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  sendPasswordRecovery,
  setPassword as setPasswordService,
  validatePasswordResetToken
} from '../../services/auth';
import { isBlank } from '../../utils/string';
import Typography from '@material-ui/core/Typography';
import { setRequestForgeryToken } from '../../utils/auth';
import LogInForm from './LoginForm';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { getProductLanguages } from '../../services/configuration';
import WarningRounded from '@material-ui/icons/WarningRounded';
import { parse } from 'query-string';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import PasswordTextField from '../Controls/PasswordTextField';
import { passwordRequirementMessages } from '../../utils/i18n-legacy';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import clsx from 'clsx';
import { filter } from 'rxjs/operators';
import { useDebouncedInput, useMount } from '../../utils/hooks';
import palette from '../../styles/palette';
import { getCurrentLocale } from '../../utils/i18n';
import CrafterCMSLogo from '../Icons/CrafterCMSLogo';
import FormControl from '@material-ui/core/FormControl';

setRequestForgeryToken();

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
  xsrfToken: string;
  xsrfParamName: string;
  passwordRequirementsRegex: string;
}

type Modes = 'login' | 'recover' | 'reset';

type SubViewProps = React.PropsWithChildren<{
  token?: string;
  language?: string;
  setMode?: React.Dispatch<React.SetStateAction<Modes>>;
  passwordRequirementsRegex?: string;
  children: React.ReactNode;
  isFetching: boolean;
  onSubmit: React.Dispatch<React.SetStateAction<boolean>>;
  classes: { [props: string]: string };
  formatMessage: Function;
  onSnack: React.Dispatch<React.SetStateAction<{ open: boolean; message: string }>>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  onRecover: Function;
  xsrfParamName: string;
  xsrfToken: string;
}>;

interface PasswordRequirementsDisplayProps {
  value: string;
  formatMessage: Function;
  onValidStateChanged: (isValid: boolean) => void;
  passwordRequirementsRegex: string;
  classes: { [props: string]: string };
}

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
    defaultMessage: 'If your username exists, an email will be sent to you with a reset link.'
  },
  recoverYourPasswordSuccessMessage: {
    id: 'loginView.recoverYourPasswordSuccessMessage',
    defaultMessage: 'If "{username}" exists, a recovery email has been sent'
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
  },
  resetPasswordInvalidToken: {
    id: 'resetView.resetPasswordInvalidToken',
    defaultMessage: 'Token validation failed.'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    dialogRoot: {
      transition: 'all 600ms ease',
      '& .MuiInput-input': { backgroundColor: theme.palette.background.paper },
      '& .MuiFormControl-root, & .MuiButton-root': { marginBottom: theme.spacing(1) }
    },
    dialogRootFetching: {
      opacity: 0.2
    },
    dialogPaper: {
      minWidth: 300,
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(0, 0, 0, .8)' : 'rgba(255, 255, 255, .8)'
    },
    logo: {
      maxWidth: 250,
      display: 'block',
      margin: `${theme.spacing(2)}px auto ${theme.spacing(1)}px`
    },
    languageSelect: {
      margin: 0
    },
    languageSelectLabel: {},
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
    },
    // Password requirements
    listOfConditions: {
      listStyle: 'none',
      padding: 0,
      margin: `${theme.spacing(1.5)}px 0`
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

const dispatchLanguageChange = (language: string) => {
  let event = new CustomEvent('setlocale', { detail: language });
  document.dispatchEvent(event);
};

const retrieveStoredLangPreferences = () =>
  Object.keys(window.localStorage).filter((key) => key.includes('_crafterStudioLanguage'));

const buildKey = (username: string) => `${username}_crafterStudioLanguage`;

function LoginView(props: SubViewProps) {
  const {
    children,
    isFetching,
    onSubmit,
    classes,
    setLanguage,
    onRecover,
    formatMessage,
    xsrfParamName,
    xsrfToken
  } = props;
  const [username, setUsername] = useState(() => localStorage.getItem('userName') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [storedLangPreferences] = useState(retrieveStoredLangPreferences);
  const username$ = useDebouncedInput(
    useCallback(
      (user: string) => {
        const key = buildKey(user);
        if (storedLangPreferences.includes(key)) {
          setLanguage(window.localStorage.getItem(key));
        }
      },
      [setLanguage, storedLangPreferences]
    ),
    200
  );
  useMount(() => {
    username$.next(username);
  });
  const qsError = parse(window.location.search).error;
  useEffect(() => {
    if (qsError) {
      setError(formatMessage(translations.incorrectCredentialsMessage));
    }
  }, [formatMessage, qsError]);
  const handleSubmit = (e: any) => {
    if (isBlank(password) || isBlank(username)) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      setError('');
      onSubmit(true);
    }
  };
  return (
    <>
      <DialogContent>
        <HeaderView error={error} introMessage="" classes={classes} />
        <LogInForm
          children={children}
          classes={classes}
          onSubmit={handleSubmit}
          username={username}
          password={password}
          isFetching={isFetching}
          enableUsernameInput={true}
          onSetPassword={setPassword}
          onRecover={onRecover}
          onSetUsername={(user) => {
            setUsername(user);
            username$.next(user);
          }}
          xsrfParamName={xsrfParamName}
          xsrfToken={xsrfToken}
        />
      </DialogContent>
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
    !isBlank(username) &&
      sendPasswordRecovery(username).subscribe(
        () => {
          onSubmit(false);
          setMode('login');
          onSnack({
            open: true,
            message: formatMessage(translations.recoverYourPasswordSuccessMessage, { username })
          });
        },
        (error) => {
          onSubmit(false);
          setError(error.message);
        }
      );
  };
  return (
    <form onSubmit={onSubmitRecover}>
      <DialogContent>
        <HeaderView
          error={error}
          classes={classes}
          introMessage={formatMessage(translations.recoverYourPasswordViewTitle)}
        />
        {children}
        <TextField
          id="recoverFormUsernameField"
          fullWidth
          autoFocus
          disabled={isFetching}
          type="text"
          value={username}
          onChange={(e: any) => setUsername(e.target.value)}
          className={classes?.username}
          label={<FormattedMessage id="loginView.usernameTextFieldLabel" defaultMessage="Username" />}
        />
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
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
          &laquo; <FormattedMessage id="loginView.recoverYourPasswordBackButtonLabel" defaultMessage="Back" />
        </Button>
      </DialogActions>
    </form>
  );
}

function ResetView(props: SubViewProps) {
  const {
    children,
    isFetching,
    onSubmit,
    classes,
    formatMessage,
    onSnack,
    setMode,
    token,
    passwordRequirementsRegex
  } = props;
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isValid, setValid] = useState<boolean>(null);
  const [passwordsMismatch, setPasswordMismatch] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isBlank(newPasswordConfirm) || newPasswordConfirm === newPassword) {
      setPasswordMismatch(false);
    } else if (newPasswordConfirm !== newPassword) {
      setPasswordMismatch(true);
    }
  }, [newPassword, newPasswordConfirm]);
  useEffect(() => {
    validatePasswordResetToken(token)
      .pipe(filter((isValid) => !isValid))
      .subscribe(
        () => {
          setError(formatMessage(translations.resetPasswordInvalidToken));
        },
        () => {
          setError(formatMessage(translations.resetPasswordInvalidToken));
        }
      );
  }, [formatMessage, token]);
  const submit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBlank(newPassword) && !isBlank(newPasswordConfirm)) {
      onSubmit(true);
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
    <form onSubmit={submit}>
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
        <PasswordRequirementsDisplay
          classes={classes}
          value={newPassword}
          onValidStateChanged={setValid}
          formatMessage={formatMessage}
          passwordRequirementsRegex={passwordRequirementsRegex}
        />
        <PasswordTextField
          id="resetFormPasswordField"
          fullWidth
          error={isValid !== null && !isValid}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={classes.resetPassword}
          placeholder={formatMessage(translations.resetPasswordFieldPlaceholderLabel)}
        />
        <PasswordTextField
          id="resetFormPasswordConfirmField"
          fullWidth
          helperText={
            passwordsMismatch ? formatMessage(passwordRequirementMessages.passwordConfirmationMismatch) : null
          }
          error={passwordsMismatch}
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          className={classes.resetPassword}
          placeholder={formatMessage(translations.resetPasswordConfirmFieldPlaceholderLabel)}
        />
        {children}
      </DialogContent>
      <DialogActions>
        <Button type="submit" color="primary" disabled={isFetching} variant="contained" fullWidth>
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </Button>
      </DialogActions>
    </form>
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
  );
}

function LanguageDropDown(props: LanguageDropDownProps) {
  const { formatMessage } = useIntl();
  const { classes, language, languages, onChange } = props;
  return (
    <FormControl fullWidth>
      <InputLabel id="languageSelectDropDown-label" className={classes?.label}>
        {formatMessage(translations.languageDropDownLabel)}
      </InputLabel>
      <Select
        fullWidth
        value={language}
        id="languageSelectDropDown"
        labelId="languageSelectDropDown-label"
        onChange={(e: any) => onChange(e.target.value)}
        className={classes?.dropDown}
      >
        {languages?.map(({ id, label }) => (
          <MenuItem value={id} key={id}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function getPrimeMatter(props: Partial<PasswordRequirementsDisplayProps>) {
  const { passwordRequirementsRegex, formatMessage } = props;
  let regEx = null;
  let captureGroups = passwordRequirementsRegex.match(/\(\?<.*?>.*?\)/g);
  let namedCaptureGroupSupport = true;
  let fallback;
  if (!captureGroups) {
    // RegExp may be valid and have no capture groups
    fallback = {
      regEx,
      description: formatMessage(passwordRequirementMessages.validationPassing)
    };
  }
  try {
    regEx = new RegExp(passwordRequirementsRegex);
    captureGroups = passwordRequirementsRegex.match(/\(\?<.*?>.*?\)/g);
  } catch (error) {
    console.warn(error);
    try {
      // reg ex without the capture groups and just need to remove the capture
      // If the reg ex is parsable without the capture groups, we can use the
      // group from the individual pieces later on the mapping.
      namedCaptureGroupSupport = false;
      regEx = new RegExp(passwordRequirementsRegex.replace(/\?<(.*?)>/g, ''));
    } catch (error) {
      // Allow everything and default to backend as regex wasn't
      // parsable/valid for current navigator
      regEx = /(.|\s)*\S(.|\s)*/;
      fallback = {
        regEx,
        description: formatMessage(passwordRequirementMessages.notBlank)
      };
      console.warn('Defaulting password validation to server due to issues in RegExp compilation.');
    }
  }
  return {
    regEx,
    conditions: captureGroups
      ? captureGroups.map((captureGroup) => {
          let description;
          let captureGroupKey = captureGroup.match(/\?<(.*?)>/g)?.[0].replace(/\?<|>/g, '') ?? 'Unnamed condition';
          if (!namedCaptureGroupSupport) {
            captureGroup = captureGroup.replace(/\?<(.*?)>/g, '');
          }
          switch (captureGroupKey) {
            case 'hasSpecialChars':
              const allowedChars = (passwordRequirementsRegex.match(/\(\?<hasSpecialChars>(.*)\[(.*?)]\)/) || [
                '',
                '',
                ''
              ])[2];
              description = formatMessage(passwordRequirementMessages.hasSpecialChars, {
                chars: allowedChars ? `(${allowedChars})` : ''
              });
              break;
            case 'minLength':
              const min = ((passwordRequirementsRegex.match(/\(\?<minLength>(.*){(.*?)}\)/) || [''])[0].match(
                /{(.*?)}/
              ) || ['', ''])[1].split(',')[0];
              description = formatMessage(passwordRequirementMessages.minLength, { min });
              break;
            case 'maxLength':
              const max = ((passwordRequirementsRegex.match(/\(\?<maxLength>(.*){(.*?)}\)/) || [''])[0].match(
                /{(.*?)}/
              ) || ['', ''])[1].split(',')[1];
              description = formatMessage(passwordRequirementMessages.maxLength, { max });
              break;
            case 'minMaxLength':
              const minLength = ((passwordRequirementsRegex.match(/\(\?<minMaxLength>(.*){(.*?)}\)/) || [''])[0].match(
                /{(.*?)}/
              ) || ['', ''])[1].split(',')[0];
              const maxLength = ((passwordRequirementsRegex.match(/\(\?<minMaxLength>(.*){(.*?)}\)/) || [''])[0].match(
                /{(.*?)}/
              ) || ['', ''])[1].split(',')[1];
              description = formatMessage(passwordRequirementMessages.minMaxLength, {
                minLength,
                maxLength
              });
              break;
            default:
              description = formatMessage(
                passwordRequirementMessages[captureGroupKey] ?? passwordRequirementMessages.unnamedGroup
              );
              break;
          }
          return {
            regEx: new RegExp(captureGroup),
            description
          };
        })
      : [fallback]
  };
}

function PasswordRequirementsDisplay(props: PasswordRequirementsDisplayProps) {
  const { passwordRequirementsRegex, formatMessage, value, classes, onValidStateChanged } = props;
  const { regEx, conditions } = useMemo(() => getPrimeMatter({ passwordRequirementsRegex, formatMessage }), [
    passwordRequirementsRegex,
    formatMessage
  ]);
  useEffect(() => {
    onValidStateChanged(isBlank(value) ? null : regEx.test(value));
  }, [onValidStateChanged, regEx, value]);
  return (
    <ul className={classes.listOfConditions}>
      {conditions.map(({ description, regEx: condition }, key) => {
        const blank = isBlank(value);
        const valid = condition.test(value);
        return (
          <Typography
            key={key}
            component="li"
            className={clsx(
              classes.conditionItem,
              !blank && {
                [classes.conditionItemNotMet]: !valid,
                [classes.conditionItemMet]: valid
              }
            )}
          >
            {valid && !blank ? (
              <CheckCircleOutlineRoundedIcon className={classes.conditionItemIcon} />
            ) : (
              <ErrorOutlineRoundedIcon className={classes.conditionItemIcon} />
            )}
            {description}
          </Typography>
        );
      })}
    </ul>
  );
}

export default function LoginViewContainer(props: LoginViewProps) {
  const { formatMessage } = useIntl();
  const classes = useStyles();
  const token = parse(window.location.search).token as string;
  const { passwordRequirementsRegex, xsrfToken, xsrfParamName } = props;

  const [mode, setMode] = useState<Modes>(token ? 'reset' : 'login');
  const [language, setLanguage] = useState(() => getCurrentLocale());
  const [languages, setLanguages] = useState<SystemLang[]>();
  const [snack, onSnack] = useState<{ open: boolean; message: string; autoHideDuration?: number }>({
    open: false,
    message: ''
  });
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
    passwordRequirementsRegex,
    setLanguage,
    onRecover: () => setMode('recover'),
    xsrfToken,
    xsrfParamName,
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
        fullWidth
        open={true}
        maxWidth="xs"
        className={clsx(classes.dialogRoot, isFetching && classes.dialogRootFetching)}
        PaperProps={{ className: classes.dialogPaper }}
        aria-labelledby="loginDialog"
      >
        <DialogTitle id="loginDialog">
          <Typography variant="srOnly">{formatMessage(translations.loginDialogTitle)}</Typography>
          <CrafterCMSLogo className={classes.logo} width="auto" />
        </DialogTitle>
        <CurrentView {...currentViewProps} />
      </Dialog>
      <Snackbar
        open={snack.open}
        autoHideDuration={snack.autoHideDuration ?? 8000}
        onClose={() => onSnack({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={snack.message}
      />
    </>
  );
}
