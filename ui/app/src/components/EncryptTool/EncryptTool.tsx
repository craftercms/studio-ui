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

import React, { useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { encrypt as encryptService } from '../../services/security';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { green, red } from '@mui/material/colors';
import { setRequestForgeryToken } from '../../utils/auth';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import GlobalAppToolbar from '../GlobalAppToolbar';
import Box from '@mui/material/Box';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import Paper from '@mui/material/Paper';

interface EncryptToolProps {
  site?: string;
  embedded?: boolean;
  showAppsButton?: boolean;
}

const messages = defineMessages({
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
  form: {
    padding: '20px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  title: {
    color: '#555555'
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

export const EncryptTool = (props: EncryptToolProps) => {
  const { site, embedded = false, showAppsButton } = props;
  const classes = useStyles({});
  const inputRef = useRef();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [fetching, setFetching] = useState(null);
  const [notificationSettings, setNotificationSettings] = useSpreadState(notificationInitialState);

  const { formatMessage } = useIntl();

  const focus = () => {
    const toolRawTextInput: HTMLInputElement = document.querySelector('#encryptionToolRawText');
    toolRawTextInput.focus();
  };

  const encrypt = (e: any) => {
    e.preventDefault();
    if (text) {
      setRequestForgeryToken();
      setFetching(true);
      setResult(null);
      encryptService(text, site).subscribe(
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

  return (
    <Paper elevation={0}>
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="encryptTool.pageTitle" defaultMessage="Encryption Tool" />}
          showAppsButton={showAppsButton}
        />
      )}
      <Box p="20px">
        <form onSubmit={encrypt}>
          <div className={classes.formGroup}>
            <TextField
              label={formatMessage(messages.inputLabel)}
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              id="encryptionToolRawText"
              name="encryptionToolRawText"
              autoFocus
              disabled={fetching}
            />
          </div>
          {result && (
            <div className={classes.formGroup}>
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
          )}
          <div className={classes.formGroup}>
            <Button type="button" onClick={clear} disabled={fetching} variant="outlined">
              {formatMessage(messages.clearResultButtonText)}
            </Button>{' '}
            <Button type="submit" onClick={encrypt} disabled={fetching} color="primary" variant="contained">
              {formatMessage(messages.buttonText)}
            </Button>
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
            <SnackbarContent
              className={`${notificationSettings.variant === 'success' ? classes.success : classes.error} ${
                classes.iconVariant
              }`}
              aria-describedby="encryptToolSnackbar"
              message={
                <span id="encryptToolSnackbar" className={classes.message}>
                  {notificationSettings.variant === 'success' ? (
                    <CheckCircleIcon className={`${classes.icon} ${classes.iconVariant}`} />
                  ) : (
                    <ErrorIcon className={`${classes.icon} ${classes.iconVariant}`} />
                  )}
                  {formatMessage(
                    notificationSettings.variant === 'success' ? messages.successMessage : messages.errorMessage
                  )}
                </span>
              }
              action={[
                <IconButton
                  key="close"
                  aria-label="close"
                  color="inherit"
                  onClick={() => setNotificationSettings({ open: false })}
                  size="large"
                >
                  <CloseIcon className={classes.icon} />
                </IconButton>
              ]}
            />
          </Snackbar>
        </form>
      </Box>
    </Paper>
  );
};

export default EncryptTool;
