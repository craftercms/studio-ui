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

import { Resource } from '../../models/Resource';
import { MergeStrategy, Repository } from '../../models/Repository';
import RemoteRepositoriesGridUI from './RemoteRepositoriesGridUI';
import React, { useState } from 'react';
import PullFromRemoteDialog from '../RemoteRepositoriesPullDialog';
import { defineMessages, useIntl } from 'react-intl';
import PushToRemoteDialog from '../RemoteRepositoriesPushDialog';
import { deleteRemote as deleteRemoteService } from '../../services/repositories';
import { showSystemNotification } from '../../state/actions/system';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';

export interface RemoteRepositoriesGridProps {
  resource: Resource<Array<Repository>>;
  disableActions: boolean;
  fetchStatus(): void;
  fetchRepositories(): void;
}

const messages = defineMessages({
  mergeStrategyNone: {
    id: 'repositories.mergeStrategyNone',
    defaultMessage: 'None'
  },
  mergeStrategyOurs: {
    id: 'repositories.mergeStrategyOurs',
    defaultMessage: 'Accept Ours'
  },
  mergeStrategyTheirs: {
    id: 'repositories.mergeStrategyTheirs',
    defaultMessage: 'Accept Theirs'
  },
  remoteDeleteSuccessMessage: {
    id: 'repositories.remoteDeleteSuccessMessage',
    defaultMessage: 'Remote repository deleted successfully.'
  },
  pullSuccessMessage: {
    id: 'repositories.pullSuccessMessage',
    defaultMessage: 'Successfully pulled.'
  },
  pushSuccessMessage: {
    id: 'repositories.pushSuccessMessage',
    defaultMessage: 'Successfully pushed.'
  }
});

export function RemoteRepositoriesGrid(props: RemoteRepositoriesGridProps) {
  const { resource, disableActions, fetchStatus, fetchRepositories } = props;
  const [repositoriesPullDialogBranches, setRepositoriesPullDialogBranches] = useState([]);
  const [repositoriesPushDialogBranches, setRepositoriesPushDialogBranches] = useState([]);
  const [pullRemoteName, setPullRemoteName] = useState(null);
  const [pushRemoteName, setPushRemoteName] = useState(null);
  const { formatMessage } = useIntl();
  const mergeStrategies: MergeStrategy[] = [
    {
      key: 'none',
      value: formatMessage(messages.mergeStrategyNone)
    },
    {
      key: 'ours',
      value: formatMessage(messages.mergeStrategyOurs)
    },
    {
      key: 'theirs',
      value: formatMessage(messages.mergeStrategyTheirs)
    }
  ];
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();
  const pushToRemoteDialogState = useEnhancedDialogState();
  const pullFromRemoteDialogState = useEnhancedDialogState();

  const onClickPull = (remoteName: string, branches: string[]) => {
    setRepositoriesPullDialogBranches(branches);
    setPullRemoteName(remoteName);
    pullFromRemoteDialogState.onOpen();
  };

  const onClickPush = (remoteName: string, branches: string[]) => {
    setRepositoriesPushDialogBranches(branches);
    setPushRemoteName(remoteName);
    pushToRemoteDialogState.onOpen();
  };

  const onPullSuccess = () => {
    fetchStatus();
    pullFromRemoteDialogState.onClose();
    dispatch(
      showSystemNotification({
        message: formatMessage(messages.pullSuccessMessage)
      })
    );
  };

  const onPullError = (response) => {
    fetchStatus();
    pullFromRemoteDialogState.onClose();
    dispatch(
      showSystemNotification({
        message: response.message,
        options: { variant: 'error' }
      })
    );
  };

  const onPushSuccess = () => {
    pushToRemoteDialogState.onClose();
    dispatch(
      showSystemNotification({
        message: formatMessage(messages.pushSuccessMessage)
      })
    );
  };

  const onPushError = (response) => {
    pushToRemoteDialogState.onClose();
    dispatch(showErrorDialog({ error: response }));
  };

  const deleteRemote = (remoteName: string) => {
    deleteRemoteService(siteId, remoteName).subscribe(
      () => {
        fetchRepositories();
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.remoteDeleteSuccessMessage)
          })
        );
      },
      ({ response }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  return (
    <>
      <RemoteRepositoriesGridUI
        resource={resource}
        disableActions={disableActions}
        onPullClick={onClickPull}
        onPushClick={onClickPush}
        onDeleteRemote={deleteRemote}
      />
      <PullFromRemoteDialog
        open={pullFromRemoteDialogState.open}
        onClose={pullFromRemoteDialogState.onClose}
        branches={repositoriesPullDialogBranches}
        remoteName={pullRemoteName}
        mergeStrategies={mergeStrategies}
        onPullSuccess={onPullSuccess}
        onPullError={onPullError}
        isMinimized={pullFromRemoteDialogState.isMinimized}
        isSubmitting={pullFromRemoteDialogState.isSubmitting}
        hasPendingChanges={pullFromRemoteDialogState.hasPendingChanges}
      />
      <PushToRemoteDialog
        open={pushToRemoteDialogState.open}
        branches={repositoriesPushDialogBranches}
        remoteName={pushRemoteName}
        onClose={pushToRemoteDialogState.onClose}
        onPushSuccess={onPushSuccess}
        onPushError={onPushError}
        isMinimized={pushToRemoteDialogState.isMinimized}
        isSubmitting={pushToRemoteDialogState.isSubmitting}
        hasPendingChanges={pushToRemoteDialogState.hasPendingChanges}
      />
    </>
  );
}

export default RemoteRepositoriesGrid;
