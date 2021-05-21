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
import { Resource } from '../../models/Resource';
import { RepositoryStatus } from '../../models/Repository';
import RemoteRepositoriesStatusUI from './RemoteRepositoriesStatusUI';
import CommitResolutionDialog from '../CommitResolutionDialog/CommitResolutionDialog';
import { cancelFailedPull, resolveConflict as resolveConflictService } from '../../services/repositories';
import { useActiveSiteId } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { defineMessages, useIntl } from 'react-intl';
import RemoteRepositoriesDiffDialog from '../RemoteRepositoriesDiffDialog';

export interface RemoteRepositoriesStatusProps {
  resource: Resource<RepositoryStatus>;
  setFetching(fetching): void;
  onActionSuccess?(status): void;
}

const messages = defineMessages({
  revertPullSuccessMessage: {
    id: 'repositories.revertPullSuccessMessage',
    defaultMessage: 'Successfully reverted repository.'
  },
  commitSuccessMessage: {
    id: 'repositories.commitSuccessMessage',
    defaultMessage: 'Successfully committed.'
  }
});

export default function RemoteRepositoriesStatus(props: RemoteRepositoriesStatusProps) {
  const { resource, setFetching, onActionSuccess } = props;
  const status = resource.read();
  const siteId = useActiveSiteId();
  const [openCommitResolutionDialog, setOpenCommitResolutionDialog] = useState(false);
  const [openRemoteRepositoriesDiffDialog, setOpenRemoteRepositoriesDiffDialog] = useState(false);
  const [diffPath, setDiffPath] = useState(null);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const revertPull = () => {
    setFetching(true);
    cancelFailedPull(siteId).subscribe(
      (status) => {
        onActionSuccess?.(status);
        setFetching(false);
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.revertPullSuccessMessage)
          })
        );
      },
      ({ response }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCommitSuccess = (status) => {
    onActionSuccess?.(status);
    setFetching(false);
    dispatch(
      showSystemNotification({
        message: formatMessage(messages.commitSuccessMessage)
      })
    );
  };

  const onCommitError = (response) => {
    dispatch(showErrorDialog({ error: response }));
  };

  const resolveConflict = (resolution: string, path: string) => {
    setFetching(true);
    resolveConflictService(siteId, path, resolution).subscribe(
      (status) => {
        onActionSuccess?.(status);
        setFetching(false);
      },
      ({ response }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const openDiffDialog = (path) => {
    setDiffPath(path);
    setOpenRemoteRepositoriesDiffDialog(true);
  };

  return (
    <>
      <RemoteRepositoriesStatusUI
        status={status}
        onRevertPull={revertPull}
        onClickCommit={() => setOpenCommitResolutionDialog(true)}
        onResolveConflict={resolveConflict}
        onDiffClick={openDiffDialog}
      />
      <CommitResolutionDialog
        open={openCommitResolutionDialog}
        onClose={() => setOpenCommitResolutionDialog(false)}
        onCommit={() => setFetching(true)}
        onCommitSuccess={onCommitSuccess}
        onCommitError={onCommitError}
      />
      <RemoteRepositoriesDiffDialog
        open={openRemoteRepositoriesDiffDialog}
        path={diffPath}
        onResolveConflict={resolveConflict}
        onClose={() => setOpenRemoteRepositoriesDiffDialog(false)}
      />
    </>
  );
}
