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

import React, { useReducer, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { encrypt as encryptService } from '../services/security';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { green, red } from '@material-ui/core/colors';

const messages = defineMessages({
  pageTitle: {
    id: 'encryptTool.pageTitle',
    defaultMessage: 'Encryption Tool'
  },
  inputLabel: {
    id: 'encryptTool.inputLabel',
    defaultMessage: 'Raw Text'
  },
  buttonText: {
    id: 'encryptTool.buttonText',
    defaultMessage: 'Encrypt Text'
  },
  successMessage: {
    id: 'encryptTool.successMessage',
    defaultMessage: 'Encrypted text copied to clipboard.'
  },
  errorMessage: {
    id: 'encryptTool.errorMessage',
    defaultMessage: 'Text encryption failed. Please try again momentarily.'
  },
  clearResultButtonText: {
    id: 'encryptTool.clearResultButtonText',
    defaultMessage: 'Clear'
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginTop: 0
  },
  title: {
    color: '#555555',
    padding: '0 20px'
  },
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: red[600]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}));

const notificationInitialState = {
  open: false,
  variant: 'success'
};

function copyToClipboard(input: HTMLInputElement) {

  /* Select the text field */
  input.select();
  /* For mobile devices */
  input.setSelectionRange(0, 99999);

  /* Copy the text inside the text field */
  document.execCommand('copy');

}

function SnackbarContentWrapper(props: any) {
  const classes = useStyles({});
  const { className, message, onClose, variant, ...other } = props;

  return (
    <SnackbarContent
      className={`${className} ${classes.iconVariant}`}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          {
            variant === 'success' ?
              <CheckCircleIcon className={`${classes.icon} ${classes.iconVariant}`}/>
              :
              <ErrorIcon className={`${classes.icon} ${classes.iconVariant}`}/>
          }
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
          <CloseIcon className={classes.icon}/>
        </IconButton>
      ]}
      {...other}
    />
  );
}

const EncryptTool = () => {
  const classes = useStyles({});
  const inputRef = useRef();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [fetching, setFetching] = useState(null);
  // TODO: useSpreadState hook once merged to 2019
  const [notificationSettings, setNotificationSettings] = useReducer(
    (state, nextState) => ({ ...state, ...nextState }),
    notificationInitialState
  );

  const { formatMessage } = useIntl();

  const focus = () => {
    const toolRawTextInput: HTMLInputElement = document.querySelector('#encryptionToolRawText');
    toolRawTextInput.focus();
  };

  const encrypt = () => {
    if (text) {
      setFetching(true);
      setResult(null);
      encryptService(encodeURIComponent(text)).subscribe(
        (encryptedText) => {
          setFetching(false);
          setText('');
          setResult(encryptedText);
          setTimeout(() => {
            copyToClipboard(inputRef.current);
            setNotificationSettings({ open: true, variant: 'success' });
          }, 10);
        },
        () => {
          setNotificationSettings({
            open: true,
            variant: 'error'
          });
        }
      );
    } else {
      focus();
    }
  };

  const clear = () => {
    setText('');
    setResult(null);
    focus();
  };

  console.log(notificationSettings.open);

  return (
    <form onSubmit={encrypt} className="site-config-landing-page">
      <header className={`${classes.header} page-header`} style={{ marginTop: 0 }}>
        <h1 className={classes.title}>{formatMessage(messages.pageTitle)}</h1>
      </header>
      <div className="form-group">
        <label htmlFor="encryptionToolRawText" className="control-label">{formatMessage(messages.inputLabel)}</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="form-control"
          id="encryptionToolRawText"
          name="encryptionToolRawText"
          autoFocus
          disabled={fetching}
        />
      </div>
      {
        result &&
        <div className="form-group">
          <input
            readOnly
            type="text"
            ref={inputRef}
            className="well"
            value={`\${enc:${result}}`}
            onClick={(e: any) => {
              copyToClipboard(e.target);
              setNotificationSettings({ open: true, variant: 'success' });
            }}
            style={{
              display: 'block',
              width: '100%'
            }}
          />
        </div>
      }
      <div className="form-group">
        <button type="submit" className="btn btn-primary" onClick={encrypt} disabled={fetching}>
          <span>{formatMessage(messages.buttonText)}</span>
        </button>
        {' '}
        <button type="button" className="btn btn-default" onClick={clear} disabled={fetching}>
          <span>{formatMessage(messages.clearResultButtonText)}</span>
        </button>
      </div>

      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={notificationSettings.open}
        autoHideDuration={5000}
        onClose={() => {
          setNotificationSettings({ open: false });
        }}
      >
        <SnackbarContentWrapper
          onClose={() => setNotificationSettings({ open: false })}
          variant={notificationSettings.variant}
          className={notificationSettings.variant === 'success' ? classes.success : classes.error}
          message={formatMessage(notificationSettings.variant === 'success' ? messages.successMessage : messages.errorMessage)}
        />
      </Snackbar>
    </form>
  );
};

export default EncryptTool;
