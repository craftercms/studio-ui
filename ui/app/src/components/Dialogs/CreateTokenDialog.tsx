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

import React, { PropsWithChildren, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from './DialogHeader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useUnmount } from '../../utils/hooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import StandardAction from '../../models/StandardAction';
import { FormHelperText } from '@material-ui/core';
import { createToken } from '../../services/token';

interface CreateTokenBaseProps {
  open: boolean;
}

export type CreateTokenProps = PropsWithChildren<
  CreateTokenBaseProps & {
    onClose?(): void;
    onClosed?(): void;
    onCreated?(response: any): void;
  }
>;

export interface CreateTokenStateProps extends CreateTokenBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onCreated?: StandardAction;
}

export const translations = defineMessages({
  placeholder: {
    id: 'words.label',
    defaultMessage: 'Label'
  }
});

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
  const [label, setLabel] = useState('');
  // const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  useUnmount(onClosed);

  const onOk = () => {
    setInProgress(true);
    createToken(label).subscribe((resp) => {
      setInProgress(false);
      console.log(resp);
    });
    onCreated && onCreated({});
  };
  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="createTokenDialog.title" defaultMessage="Create Access Token" />}
        onDismiss={onClose}
      />
      <DialogBody>
        <FormHelperText>
          <FormattedMessage
            id="createTokenDialog.helperText"
            defaultMessage="Type a name for the new token. The token will be created by the server and shown to you after. Store it securely as you won’t be able to see it’s value again."
          />
        </FormHelperText>
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
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose} variant="contained">
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </Button>
        <Button onClick={() => onOk()} variant="contained" color="primary" autoFocus disabled={inProgress}>
          {inProgress && <CircularProgress size={15} style={{ marginRight: '5px' }} />}
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        </Button>
      </DialogFooter>
    </>
  );
}
