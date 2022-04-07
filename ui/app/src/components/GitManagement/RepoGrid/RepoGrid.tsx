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

import { Resource } from '../../../models/Resource';
import { MergeStrategy, Repository } from '../../../models/Repository';
import RepoGridUI from './RepoGridUI';
import React, { useState } from 'react';
import PullDialog from '../PullDialog';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import PushDialog from '../PushDialog';
import { deleteRemote as deleteRemoteService, PullResponse } from '../../../services/repositories';
import { showSystemNotification } from '../../../state/actions/system';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { useActiveSiteId } from '../../../hooks/useActiveSiteId';
import { useEnhancedDialogState } from '../../../hooks/useEnhancedDialogState';
import SnackbarContent, { snackbarContentClasses } from '@mui/material/SnackbarContent';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useSnackbar } from 'notistack';
import { copyToClipboard } from '../../../utils/system';
import { PublishCommitDialog } from '../PublishCommitDialog';
import { useSpreadState } from '../../../hooks';

export interface RepoGridProps {
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
    defaultMessage:
      'Successfully pulled {numberOfCommits} commits. Merge commit id was copied to clipboard. Would you like to publish this now?'
  },
  pullSuccessNoChangesMessage: {
    id: 'repositories.pullSuccessNoChangesMessage',
    defaultMessage: 'Pull successful: already up to date.'
  },
  pushSuccessMessage: {
    id: 'repositories.pushSuccessMessage',
    defaultMessage: 'Successfully pushed.'
  }
});

export function RepoGrid(props: RepoGridProps) {
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
  const { enqueueSnackbar } = useSnackbar();
  const [postPullState, setPostPullState] = useSpreadState({
    openPublishCommitDialog: false,
    openPostPullSnack: false,
    mergeCommitId: '',
    commitsMerged: 0
  });

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

  const onPullSuccess = (result: PullResponse) => {
    fetchStatus();
    pullFromRemoteDialogState.onClose();
    if (result.mergeCommitId) {
      setPostPullState({ openPostPullSnack: true, ...result });
    } else {
      dispatch(
        showSystemNotification({
          message: formatMessage(messages.pullSuccessNoChangesMessage)
        })
      );
    }
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
    pushToRemoteDialogState.onResetState();
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

  const onClosePostPullSnack = () =>
    setPostPullState({ openPostPullSnack: false, commitsMerged: null, mergeCommitId: null });

  return (
    <>
      <RepoGridUI
        resource={resource}
        disableActions={disableActions}
        onPullClick={onClickPull}
        onPushClick={onClickPush}
        onDeleteRemote={deleteRemote}
      />
      <Snackbar
        autoHideDuration={10000}
        onClose={onClosePostPullSnack}
        open={postPullState.openPostPullSnack}
        sx={{ maxWidth: '500px' }}
      >
        <SnackbarContent
          sx={{ [`.${snackbarContentClasses.message}`]: { width: '100%' } }}
          message={
            <>
              {formatMessage(messages.pullSuccessMessage, { numberOfCommits: postPullState.commitsMerged })}
              <InputBase
                sx={{ display: 'block', mt: 1, borderRadius: 1, pr: 0.5, pl: 0.5 }}
                autoFocus
                value={postPullState.mergeCommitId}
                readOnly
                onClick={(e) => {
                  (e.target as HTMLInputElement).select();
                  copyToClipboard(postPullState.mergeCommitId).then(function () {
                    enqueueSnackbar('Copied');
                  });
                }}
              />
            </>
          }
          action={
            <>
              <Button
                size="small"
                onClick={() => setPostPullState({ openPublishCommitDialog: true, openPostPullSnack: false })}
              >
                <FormattedMessage id="words.yes" defaultMessage="Yes" />
              </Button>
              <Button size="small" onClick={onClosePostPullSnack}>
                <FormattedMessage id="words.no" defaultMessage="No" />
              </Button>
            </>
          }
        />
      </Snackbar>
      <PullDialog
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
      <PushDialog
        open={pushToRemoteDialogState.open}
        branches={repositoriesPushDialogBranches}
        remoteName={pushRemoteName}
        onClose={pushToRemoteDialogState.onClose}
        onPushSuccess={onPushSuccess}
        onPushError={onPushError}
        isMinimized={pushToRemoteDialogState.isMinimized}
        isSubmitting={pushToRemoteDialogState.isSubmitting}
        hasPendingChanges={pushToRemoteDialogState.hasPendingChanges}
        onSubmittingChange={pushToRemoteDialogState.onSubmittingChange}
      />
      <PublishCommitDialog
        commitId={postPullState.mergeCommitId}
        open={postPullState.openPublishCommitDialog}
        onClose={() => {
          setPostPullState({ openPublishCommitDialog: false });
        }}
      />
    </>
  );
}

export default RepoGrid;
