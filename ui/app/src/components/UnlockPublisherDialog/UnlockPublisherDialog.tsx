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

import * as React from 'react';
import { useEffect, useState } from 'react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { Alert } from '@mui/material';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { TextField } from '@mui/material';
import { clearLock } from '../../services/publishing';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import StandardAction from '../../models/StandardAction';
import { fetchPublishingStatus } from '../../state/actions/publishingStatus';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';

export interface UnlockPublisherDialogProps {
  open: boolean;
  password?: string;
  onError({ error: any }): void;
  onCancel(): void;
  onComplete(): void;
}

export interface UnlockPublisherDialogStateProps {
  open: boolean;
  password: string;
  onError: StandardAction<{ error: any }>;
  onCancel: StandardAction;
  onComplete: StandardAction;
}

const messages = defineMessages({
  unlockComplete: {
    id: 'unlockPublisherDialog.unlockCompleteMessage',
    defaultMessage: 'Publisher lock released successfully.'
  },
  unlockFailed: {
    id: 'unlockPublisherDialog.unlockFailedMessage',
    defaultMessage: 'Error releasing publisher lock.'
  }
});

function UnlockPublisherDialog(props: UnlockPublisherDialogProps) {
  const { open, onCancel, onComplete, onError, password = 'unlock' } = props;
  const [submitting, setSubmitting] = useState(false);
  const [confirmPasswordPassed, setConfirmPasswordPassed] = useState(false);
  const [passwordFieldValue, setPasswordFieldValue] = useState('');
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  useEffect(() => {
    setConfirmPasswordPassed(passwordFieldValue.toLowerCase() === password.toLowerCase());
  }, [password, passwordFieldValue]);
  useEffect(() => {
    !open && setPasswordFieldValue('');
  }, [open]);
  const onSubmit = () => {
    if (confirmPasswordPassed) {
      setSubmitting(true);
      clearLock(site).subscribe(
        () => {
          setSubmitting(false);
          dispatch(showSystemNotification({ message: formatMessage(messages.unlockComplete) }));
          dispatch(fetchPublishingStatus());
          onComplete?.();
        },
        (error) => {
          setSubmitting(false);
          const response = error.response?.response ?? error.response ?? error;
          dispatch(
            showSystemNotification({
              message: response?.message ?? formatMessage(messages.unlockFailed),
              options: { variant: 'error' }
            })
          );
          onError?.({ error });
        }
      );
    }
  };
  return (
    <ConfirmDialog
      open={open}
      disableOkButton={!confirmPasswordPassed || submitting}
      disableCancelButton={submitting}
      disableBackdropClick={submitting}
      disableEscapeKeyDown={submitting}
      title={<FormattedMessage id="unlockPublisherDialog.dialogTitle" defaultMessage="Confirm Publisher Unlock" />}
      body={
        <FormattedMessage
          id="unlockPublisherDialog.dialogCopy"
          defaultMessage="Please confirm the release of the publisher lock"
        />
      }
      onOk={onSubmit}
      onCancel={onCancel}
    >
      <Alert severity="warning" icon={false}>
        <FormattedMessage
          id="unlockPublisherDialog.typeConfirmPassword"
          defaultMessage='Type the word "<b>{password}</b>" to confirm you understand the implications and wish to proceed.'
          values={{
            password,
            b: (message) => <strong>{message}</strong>
          }}
        />
        <TextField
          fullWidth
          autoFocus
          disabled={submitting}
          style={{ marginTop: '1em' }}
          value={passwordFieldValue}
          onChange={(e) => setPasswordFieldValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
        />
      </Alert>
    </ConfirmDialog>
  );
}

export default UnlockPublisherDialog;
