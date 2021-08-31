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

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import GlobalState from '../../models/GlobalState';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FormHelperText from '@material-ui/core/FormHelperText';
import Collapse from '@material-ui/core/Collapse';
import DateTimePicker from '../Controls/DateTimePicker';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { useSelection } from '../../utils/hooks/useSelection';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { getUserTimeZone } from '../../utils/datetime';

export interface CreateTokenUIProps {
  disabled: boolean;
  onOk({ label, expiresAt }): void;
  onDismiss?(): void;
  onClosed?(): void;
  setDisableQuickDismiss?(disabled: boolean): void;
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

const useStyles = makeStyles(() =>
  createStyles({
    expiresWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  })
);

export function CreateTokenDialogUI(props: CreateTokenUIProps) {
  const classes = useStyles();
  const { onClosed, onDismiss, onOk, disabled, setDisableQuickDismiss } = props;
  const [expires, setExpires] = useState(false);
  const [expiresAt, setExpiresAt] = useState(new Date());
  const [label, setLabel] = useState('');
  const { formatMessage } = useIntl();
  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOk({ label, expiresAt: expires ? expiresAt : null });
  };
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);

  useUnmount(onClosed);

  useEffect(() => {
    setDisableQuickDismiss(Boolean(expires || label));
  }, [setDisableQuickDismiss, expires, label]);

  return (
    <form onSubmit={onSubmit}>
      <DialogHeader
        title={<FormattedMessage id="createTokenDialog.title" defaultMessage="Create Access Token" />}
        onDismiss={onDismiss}
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
            timeZone={locale.dateTimeFormatOptions.timeZone ?? getUserTimeZone()}
            disablePast
            localeCode={locale.localeCode}
            dateTimeFormatOptions={locale.dateTimeFormatOptions}
          />
        </Collapse>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onDismiss}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" autoFocus disabled={disabled || label === ''} loading={disabled}>
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default CreateTokenDialogUI;
