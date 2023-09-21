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

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { makeStyles } from 'tss-react/mui';
import React, { useEffect, useState } from 'react';
import GlobalState from '../../models/GlobalState';
import DialogBody from '../DialogBody/DialogBody';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormHelperText from '@mui/material/FormHelperText';
import Collapse from '@mui/material/Collapse';
import DateTimePicker from '../DateTimePicker/DateTimePicker';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { useSelection } from '../../hooks/useSelection';
import { CreateTokenContainerProps } from './utils';
import { createToken } from '../../services/tokens';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import useUpdateRefs from '../../hooks/useUpdateRefs';

const translations = defineMessages({
  placeholder: {
    id: 'words.label',
    defaultMessage: 'Label'
  },
  expiresLabel: {
    id: 'createTokenDialog.expiresLabel',
    defaultMessage: 'Expire Token'
  }
});

const useStyles = makeStyles()(() => ({
  expiresWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
}));

export function CreateTokenDialogContainer(props: CreateTokenContainerProps) {
  const { classes } = useStyles();
  const { isSubmitting, onCreated, onClose, onSubmittingAndOrPendingChange } = props;
  const [expires, setExpires] = useState(false);
  const [expiresAt, setExpiresAt] = useState(new Date());
  const [label, setLabel] = useState('');
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOk({ label, expiresAt: expires ? expiresAt : null });
  };
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);
  const functionRefs = useUpdateRefs({
    onSubmittingAndOrPendingChange
  });

  useEffect(() => {
    onSubmittingAndOrPendingChange({
      hasPendingChanges: Boolean(expires || label)
    });
  }, [onSubmittingAndOrPendingChange, expires, label]);

  const onOk = ({ label, expiresAt }) => {
    functionRefs.current.onSubmittingAndOrPendingChange({
      isSubmitting: true
    });
    createToken(label, expiresAt).subscribe(
      (token) => {
        functionRefs.current.onSubmittingAndOrPendingChange({
          isSubmitting: false
        });
        onCreated?.(token);
      },
      (response) => {
        functionRefs.current.onSubmittingAndOrPendingChange({
          isSubmitting: false
        });
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  return (
    <form onSubmit={onSubmit}>
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
            control={<Switch checked={expires} color="primary" onChange={(e, checked) => setExpires(checked)} />}
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
            onChange={(changes) => {
              setExpiresAt(changes.date);
            }}
            value={expiresAt}
            disablePast
            localeCode={locale.localeCode}
            dateTimeFormatOptions={locale.dateTimeFormatOptions}
          />
        </Collapse>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={(e) => onClose(e, null)}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" autoFocus disabled={isSubmitting || label === ''} loading={isSubmitting}>
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default CreateTokenDialogContainer;
