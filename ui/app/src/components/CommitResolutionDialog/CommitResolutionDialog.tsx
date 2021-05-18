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

import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

export interface CommitResolutionDialogProps {
  open: boolean;
  message: string;
  setMessage(message): void;
  onClose(): void;
  onCommit(): void;
}

export default function CommitResolutionDialog(props: CommitResolutionDialogProps) {
  const { open, message, setMessage, onClose, onCommit } = props;

  const onChange = (e: any) => {
    e.persist();
    setMessage(e.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeader
        title={<FormattedMessage id="repositories.commitResolution" defaultMessage="CommitResolution" />}
        onDismiss={onClose}
      />
      <DialogBody>
        <form>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <TextField
                label={<FormattedMessage id="repositories.messageLabel" defaultMessage="Conflict resolution message" />}
                multiline
                fullWidth
                rows={4}
                placeholder="Please supply a message for the repository history log."
                variant="outlined"
                value={message}
                onChange={onChange}
                helperText={
                  <FormattedMessage
                    id="repositories.commitResolutionHelper"
                    defaultMessage="After committing this resolution. you should 'push' the changes to remote(s) to sync up the new state that you have just defined."
                  />
                }
              />
            </Grid>
          </Grid>
        </form>
      </DialogBody>
      <DialogFooter>
        <Button variant="outlined" color="default" onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onCommit}
          disabled={!message || message.replace(/ /g, '') === ''}
        >
          <FormattedMessage id="words.commitResolution" defaultMessage="Commit Resolution" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
