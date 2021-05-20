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

import React, { useCallback, useEffect, useState } from 'react';
import { useActiveSiteId, useSpreadState } from '../../utils/hooks';
import { addRemote } from '../../services/repositories';
import NewRemoteRepositoryDialogUI from './NewRemoteRepositoryDialogUI';

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
  const [disableQuickDismiss, setDisableQuickDismiss] = useState(false);

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

  useEffect(() => {
    const { remoteName, repoKey, repoPassword, repoToken, repoUsername } = inputs;
    setDisableQuickDismiss(Boolean(remoteName || repoKey || repoPassword || repoToken || repoUsername));
  }, [inputs, setDisableQuickDismiss]);

  return (
    <NewRemoteRepositoryDialogUI
      open={open}
      inputs={inputs}
      setInputs={setInputs}
      disableQuickDismiss={disableQuickDismiss}
      onCreate={createRemote}
      onClose={onClose}
    />
  );
}
