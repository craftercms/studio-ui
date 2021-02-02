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

import React, { useCallback, useEffect, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../Dialogs/DialogHeader';
import { defineMessages, FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import { useUnmount } from '../../utils/hooks';
import { Token } from '../../models/Token';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputBase from '@material-ui/core/InputBase';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';

interface CopyTokenProps {
  open: boolean;
  token: Token;
  onClose?(): void;
  onClosed?(): void;
  onCopy?(): void;
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
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    input: {
      marginTop: '16px',
      marginBottom: '8px'
    }
  })
);

export default function CopyTokenDialog(props: CopyTokenProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose} onEscapeKeyDown={onClose}>
      <CopyTokenUI {...props} />
    </Dialog>
  );
}

function CopyTokenUI(props: CopyTokenProps) {
  const { onClosed, onClose, token, onCopy } = props;
  const classes = styles();
  const inputRef = useRef<HTMLInputElement>();

  useUnmount(onClosed);

  const copyToken = useCallback(() => {
    const el = inputRef.current;
    el.select();
    document.execCommand('copy');
  }, []);

  const onCopyToken = useCallback(() => {
    copyToken();
    onCopy();
  }, [copyToken, onCopy]);

  useEffect(() => {
    if (inputRef.current && token) {
      copyToken();
    }
  }, [copyToken, onCopyToken, token]);

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="copyTokenDialog.title" defaultMessage="Access Token Created" />}
        onDismiss={onClose}
      />
      <DialogBody>
        <FormHelperText>
          <FormattedMessage
            id="copyTokenDialog.helperText"
            defaultMessage="Token created successfully. Please copy the token and store it securely as you won’t be able to see it’s value again."
          />
        </FormHelperText>
        <InputBase inputRef={inputRef} autoFocus value={token?.token ?? ''} readOnly className={classes.input} />
      </DialogBody>
      <DialogFooter className={classes.footer}>
        <SecondaryButton onClick={onCopyToken}>
          <FormattedMessage id="words.copy" defaultMessage="Copy" />
        </SecondaryButton>
        <PrimaryButton onClick={onClose}>
          <FormattedMessage id="words.done" defaultMessage="Done" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
