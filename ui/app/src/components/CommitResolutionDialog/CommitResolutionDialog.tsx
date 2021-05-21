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

import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import { FormattedMessage } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { commitResolution } from '../../services/repositories';
import { useActiveSiteId } from '../../utils/hooks';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { isBlank } from '../../utils/string';

export interface CommitResolutionDialogProps {
  open: boolean;
  onClose(): void;
  onCommit?(): void;
  onCommitSuccess?(status): void;
  onCommitError?(status): void;
}

export default function CommitResolutionDialog(props: CommitResolutionDialogProps) {
  const { open, onClose, onCommit, onCommitSuccess, onCommitError } = props;
  const siteId = useActiveSiteId();
  const [message, setMessage] = useState('');
  const [disableQuickDismiss, setDisableQuickDismiss] = useState(false);

  const onChange = (e: any) => {
    e.persist();
    setMessage(e.target.value);
    setDisableQuickDismiss(Boolean(e.target.value));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isBlank(message)) {
      onCommit?.();
      commitResolution(siteId, message).subscribe(
        (status) => {
          onCommitSuccess?.(status);
          onClose();
        },
        ({ response }) => {
          onCommitError?.(response);
          onClose();
        }
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      disableBackdropClick={disableQuickDismiss}
      disableEscapeKeyDown={disableQuickDismiss}
    >
      <form onSubmit={onSubmit}>
        <DialogHeader
          title={<FormattedMessage id="repositories.commitResolution" defaultMessage="Commit Resolution" />}
          onDismiss={onClose}
        />
        <DialogBody>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <TextField
                autoFocus
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
        </DialogBody>
        <DialogFooter>
          <SecondaryButton onClick={onClose}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isBlank(message)}>
            <FormattedMessage id="repositories.commitResolution" defaultMessage="Commit Resolution" />
          </PrimaryButton>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
