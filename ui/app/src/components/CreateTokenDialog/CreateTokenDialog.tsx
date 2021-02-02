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

import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../Dialogs/DialogHeader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import TextField from '@material-ui/core/TextField';
import { useUnmount } from '../../utils/hooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createToken } from '../../services/tokens';
import { Token } from '../../models/Token';
import DateTimePicker from '../Controls/DateTimePicker';
import moment from 'moment-timezone';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Collapse from '@material-ui/core/Collapse';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { Typography } from '@material-ui/core';

interface CreateTokenProps {
  open: boolean;
  onCreated?(response: Token): void;
  onClose?(): void;
  onClosed?(): void;
}

export const translations = defineMessages({
  placeholder: {
    id: 'words.label',
    defaultMessage: 'Label'
  },
  expiresLabel: {
    id: 'createTokenDialog.expiresLabel',
    defaultMessage: 'Expire Token'
  }
});

const styles = makeStyles((theme) =>
  createStyles({
    expiresWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  })
);

export default function CreateTokenDialog(props: CreateTokenProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose} onEscapeKeyDown={onClose}>
      <CreateTokenUI {...props} />
    </Dialog>
  );
}

function CreateTokenUI(props: CreateTokenProps) {
  const { onClosed, onClose, onCreated } = props;
  const [inProgress, setInProgress] = useState(false);
  const [expires, setExpires] = useState(false);
  const [expiresAt, setExpiresAt] = useState(moment());
  const classes = styles();
  const [label, setLabel] = useState('');
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  useUnmount(onClosed);

  const onOk = () => {
    setInProgress(true);
    createToken(label, expires ? expiresAt : null).subscribe(
      (token) => {
        setInProgress(false);
        onCreated && onCreated(token);
      },
      (response) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="createTokenDialog.title" defaultMessage="Create Access Token" />}
        onDismiss={onClose}
      />
      <DialogBody>
        <Typography variant="body2">
          <FormattedMessage
            id="createTokenDialog.helperText"
            defaultMessage="Type a name for the new token. The token will be created by the server and shown to you after. Store it securely as you won’t be able to see it’s value again."
          />
        </Typography>
        <TextField
          value={label}
          autoFocus
          required
          placeholder={formatMessage(translations.placeholder)}
          margin="normal"
          onChange={(e) => {
            setLabel(e.target.value);
          }}
        />
        <section className={classes.expiresWrapper}>
          <FormControlLabel
            control={
              <Switch
                checked={expires}
                color="primary"
                onChange={(e, checked) => {
                  setExpires(checked);
                }}
              />
            }
            label={formatMessage(translations.expiresLabel)}
          />
          <FormHelperText>
            {expires ? (
              <FormattedMessage
                id="createTokenDialog.expiresHelperNeverText"
                defaultMessage="Switch off to never expire."
              />
            ) : (
              <FormattedMessage
                id="createTokenDialog.expiresHelperText"
                defaultMessage="Switch on to set an expiration."
              />
            )}
          </FormHelperText>
        </section>
        <Collapse in={expires}>
          <DateTimePicker
            onChange={(time) => {
              setExpiresAt(time);
            }}
            date={expiresAt}
            datePickerProps={{
              disablePast: true
            }}
          />
        </Collapse>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={onOk} autoFocus disabled={inProgress || label === ''}>
          {inProgress && <CircularProgress size={15} style={{ marginRight: '5px' }} />}
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
