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

import React, { useCallback } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { FormattedMessage } from 'react-intl';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import NewRemoteRepositoryForm from '../NewRemoteRepositoryForm';
import { useActiveSiteId, useSpreadState } from '../../utils/hooks';
import DialogFooter from '../Dialogs/DialogFooter';
import Button from '@material-ui/core/Button';
import { addRemote } from '../../services/repositories';

const inputsInitialState = {
  authenticationType: 'none',
  expanded: {
    basic: false,
    token: false,
    key: false
  },
  repoAuthentication: 'none',
  repoUsername: '',
  repoToken: '',
  repoPassword: '',
  repoKey: '',
  remoteName: '',
  remoteUrl: '',
  submitted: false
};

export interface NewRemoteRepositoryDialogProps {
  open: boolean;
  onClose(): void;
  onCreateSuccess?(): void;
}

export default function NewRemoteRepositoryDialog(props: NewRemoteRepositoryDialogProps) {
  const { open, onClose, onCreateSuccess } = props;
  const siteId = useActiveSiteId();
  const [inputs, setInputs] = useSpreadState(inputsInitialState);

  const isFormValid = useCallback(() => {
    if (!inputs.remoteName || !inputs.remoteUrl) {
      return false;
    } else if (inputs.repoAuthentication === 'none') {
      return true;
    } else if (inputs.repoAuthentication === 'basic' && inputs.repoUsername !== '' && inputs.repoPassword !== '') {
      return true;
    } else if (inputs.repoAuthentication === 'token' && inputs.repoUsername !== '' && inputs.repoToken !== '') {
      return true;
    } else if (inputs.repoAuthentication === 'key' && inputs.repoKey) {
      return true;
    } else {
      return false;
    }
  }, [inputs]);

  const createRemote = () => {
    setInputs({ submitted: true });
    if (isFormValid()) {
      addRemote({
        siteId,
        remoteName: inputs.remoteName,
        remoteUrl: inputs.remoteUrl,
        authenticationType: inputs.repoAuthentication,
        ...(inputs.repoAuthentication === 'basic'
          ? { remoteUsername: inputs.repoUsername, remotePassword: inputs.repoPassword }
          : inputs.repoAuthentication === 'token'
          ? { remoteUsername: inputs.repoUsername, remoteToken: inputs.repoToken }
          : inputs.repoAuthentication === 'key'
          ? { remotePrivateKey: inputs.repoToken }
          : {})
      }).subscribe(() => {
        onCreateSuccess?.();
        onClose();
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
        <Button variant="contained" color="primary" disabled={false} onClick={createRemote}>
          <FormattedMessage id="words.create" defaultMessage="Create" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
