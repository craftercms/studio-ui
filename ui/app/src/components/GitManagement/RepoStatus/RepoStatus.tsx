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

import React, { useState } from 'react';
import { Resource } from '../../../models/Resource';
import { RepositoryStatus } from '../../../models/Repository';
import RepoStatusUI from './RepoStatusUI';
import CommitResolutionDialog from '../../CommitResolutionDialog/CommitResolutionDialog';
import { cancelFailedPull, resolveConflict as resolveConflictService } from '../../../services/repositories';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../../state/actions/system';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';
import { useIntl } from 'react-intl';
import ConflictedPathDiffDialog from '../../ConflictedPathDiffDialog';
import { useActiveSiteId } from '../../../hooks/useActiveSiteId';
import { messages } from './translations';

export interface RepoStatusProps {
  resource: Resource<RepositoryStatus>;
  setFetching(fetching): void;
  onActionSuccess?(status): void;
}

export default function RepoStatus(props: RepoStatusProps) {
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
    cancelFailedPull(siteId).subscribe({
      next(status) {
        onActionSuccess?.(status);
        setFetching(false);
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.revertPullSuccessMessage)
          })
        );
      },
      error({ response }) {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  const onCommitSuccess = (status) => {
    onActionSuccess?.(status);
    setFetching(false);
    setOpenCommitResolutionDialog(false);
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
        setOpenRemoteRepositoriesDiffDialog(false);
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
      <RepoStatusUI
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
      <ConflictedPathDiffDialog
        open={openRemoteRepositoriesDiffDialog}
        path={diffPath}
        onResolveConflict={resolveConflict}
        onClose={() => setOpenRemoteRepositoriesDiffDialog(false)}
      />
    </>
  );
}
