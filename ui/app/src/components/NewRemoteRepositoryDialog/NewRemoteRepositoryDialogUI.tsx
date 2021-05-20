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

import DialogHeader from '../Dialogs/DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import NewRemoteRepositoryForm from '../NewRemoteRepositoryForm/NewRemoteRepositoryForm';
import DialogFooter from '../Dialogs/DialogFooter';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog/Dialog';
import React from 'react';
import { SiteState } from '../../models/Site';

export interface NewRemoteRepositoryDialogUIProps {
  open: boolean;
  inputs: Partial<SiteState>;
  setInputs(inputs): void;
  disableQuickDismiss: boolean;
  onClose(): void;
  onCreate(): void;
}

export default function NewRemoteRepositoryDialogUI(props: NewRemoteRepositoryDialogUIProps) {
  const { open, inputs, setInputs, onClose, onCreate, disableQuickDismiss } = props;

  const onSubmit = (e) => {
    e.preventDefault();
    onCreate();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      disableBackdropClick={disableQuickDismiss}
      disableEscapeKeyDown={disableQuickDismiss}
    >
      <form onSubmit={onSubmit}>
        <DialogHeader
          title={<FormattedMessage id="repositories.newRemoteDialogTitle" defaultMessage="New Remote Repository" />}
          onDismiss={onClose}
        />
        <DialogBody>
          <NewRemoteRepositoryForm inputs={inputs} setInputs={setInputs} />
        </DialogBody>
        <DialogFooter>
          <Button variant="outlined" color="default" onClick={onClose}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </Button>
          <Button type="submit" variant="contained" color="primary">
            <FormattedMessage id="words.create" defaultMessage="Create" />
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
