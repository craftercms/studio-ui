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

import React, { useEffect } from 'react';
import { addRemote } from '../../services/repositories';
import NewRemoteRepositoryDialogUI from './NewRemoteRepositoryDialogUI';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useSpreadState } from '../../utils/hooks/useSpreadState';

export interface NewRemoteRepositoryDialogContainerProps {
  open: boolean;
  setDisableQuickDismiss?(disable: boolean): void;
  onClose(): void;
  onCreateSuccess?(): void;
}

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

const isFormValid = (inputs) => {
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
};

export default function NewRemoteRepositoryDialogContainer(props: NewRemoteRepositoryDialogContainerProps) {
  const { open, onClose, onCreateSuccess, setDisableQuickDismiss } = props;
  const siteId = useActiveSiteId();
  const [inputs, setInputs] = useSpreadState(inputsInitialState);

  const createRemote = () => {
    setInputs({ submitted: true });
    if (isFormValid(inputs)) {
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
      });
    }
  };

  useEffect(() => {
    const { remoteName, repoKey, repoPassword, repoToken, repoUsername } = inputs;
    setDisableQuickDismiss?.(Boolean(remoteName || repoKey || repoPassword || repoToken || repoUsername));
  }, [inputs, setDisableQuickDismiss]);

  return (
    <NewRemoteRepositoryDialogUI
      open={open}
      inputs={inputs}
      setInputs={setInputs}
      onCreate={createRemote}
      onClose={onClose}
    />
  );
}
