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

import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { encrypt as encryptService } from '../../services/security';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { green, red } from '@mui/material/colors';
import { setRequestForgeryToken } from '../../utils/auth';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import GlobalAppToolbar from '../GlobalAppToolbar';
import Box from '@mui/material/Box';
import { useSpreadState } from '../../hooks/useSpreadState';
import Paper from '@mui/material/Paper';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { copyToClipboard } from '../../utils/system';

export interface EncryptToolProps {
  site?: string;
  embedded?: boolean;
  showAppsButton?: boolean;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
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

const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    padding: '20px'
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

export const EncryptTool = (props: EncryptToolProps) => {
  const { site, embedded = false, showAppsButton, onSubmittingAndOrPendingChange } = props;
  const { classes } = useStyles();
  const inputRef = useRef<HTMLInputElement>();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [fetching, setFetching] = useState(null);
  const [notificationSettings, setNotificationSettings] = useSpreadState(notificationInitialState);
  const { formatMessage } = useIntl();
  const fnRefs = useUpdateRefs({ onSubmittingAndOrPendingChange });
  const hasText = Boolean(text);

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
      encryptService(text, site).subscribe({
        next(encryptedText) {
          const resultingText = `\${enc:${encryptedText}}`;
          setFetching(false);
          setText('');
          setResult(resultingText);
          copyToClipboard(resultingText)
            .then(() => {
              setNotificationSettings({ open: true, variant: 'success' });
            })
            .catch(() => {
              inputRef.current.focus();
              inputRef.current.select();
            });
        },
        error() {
          setNotificationSettings({ open: true, variant: 'error' });
        }
      });
    } else {
      focus();
    }
  };

  const clear = () => {
    setText('');
    setResult(null);
    focus();
  };

  useEffect(() => {
    fnRefs.current.onSubmittingAndOrPendingChange?.({ hasPendingChanges: hasText });
  }, [hasText, fnRefs]);

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
          <TextField
            sx={{ mb: 2 }}
            label={formatMessage(messages.inputLabel)}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                encrypt(e);
              }
            }}
            fullWidth
            id="encryptionToolRawText"
            name="encryptionToolRawText"
            autoFocus
            disabled={fetching}
            multiline
          />

          {result && (
            <TextField
              fullWidth
              type="text"
              color="success"
              sx={{ mb: 2 }}
              ref={inputRef}
              label={<FormattedMessage id="words.result" defaultMessage="Result" />}
              slotProps={{
                input: { readOnly: true }
              }}
              value={result}
              onClick={(e: any) => {
                const input = e.target;
                const value = input.value;
                input.select();
                copyToClipboard(value).then(() => {
                  setNotificationSettings({ open: true, variant: 'success' });
                });
              }}
            />
          )}
          <div>
            <Button type="button" onClick={clear} disabled={fetching} variant="outlined" sx={{ mr: 1 }}>
              {formatMessage(messages.clearResultButtonText)}
            </Button>
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
