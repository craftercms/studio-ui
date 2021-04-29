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
import ConfirmDialog from '../ConfirmDialog';
import Alert from '@material-ui/lab/Alert';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import { clearLock } from '../../services/publishing';

export interface UnlockPublisherDialogProps {
  site: string;
  open: boolean;
  password?: string;
  onError(e): void;
  onCancel(): void;
  onComplete(): void;
  onClosed?(): void;
}

function UnlockPublisherDialog(props: UnlockPublisherDialogProps) {
  const { open, onCancel, password = 'unlock', site, onError, onComplete, onClosed } = props;
  const [submitting, setSubmitting] = useState(false);
  const [confirmPasswordPassed, setConfirmPasswordPassed] = useState(false);
  const [passwordFieldValue, setPasswordFieldValue] = useState('');
  useEffect(() => {
    setConfirmPasswordPassed(passwordFieldValue === password);
  }, [password, passwordFieldValue]);
  const onSubmit = () => {
    if (confirmPasswordPassed) {
      setSubmitting(true);
      clearLock(site).subscribe(
        () => {
          setSubmitting(false);
          onComplete?.();
        },
        (e) => {
          setSubmitting(false);
          onError?.(e);
        }
      );
    }
  };
  return (
    <ConfirmDialog
      open={open}
      title={<FormattedMessage id="unlockPublisherDialog.dialogTitle" defaultMessage="Confirm Publisher Unlock" />}
      description={
        <FormattedMessage
          id="unlockPublisherDialog.dialogCopy"
          defaultMessage="Please confirm the release of the publisher lock"
        />
      }
      onOk={onSubmit}
      disableOkButton={!confirmPasswordPassed || submitting}
      disableCancelButton={submitting}
      disableBackdropClick={submitting}
      disableEscapeKeyDown={submitting}
      onCancel={onCancel}
      onClose={onCancel}
    >
      <Alert severity="warning" icon={false}>
        <FormattedMessage
          id="unlockPublisherDialog.typeConfirmPassword"
          defaultMessage={`Type the word "<b>{password}</b>" to confirm you understand the implications and wish to proceed.`}
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
      <Foo onClosed={onClosed} />
    </ConfirmDialog>
  );
}

function Foo({ onClosed }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onClosed, []);
  return null;
}

export default UnlockPublisherDialog;
