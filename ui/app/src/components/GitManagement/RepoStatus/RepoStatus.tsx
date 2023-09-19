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
import RepoStatusSkeleton from './RepoStatusSkeleton';
import { RepositoryStatus } from '../../../models/Repository';
import RepoStatusUI from './RepoStatusUI';
import CommitResolutionDialog from '../../CommitResolutionDialog/CommitResolutionDialog';
import { cancelFailedPull, resolveConflict } from '../../../services/repositories';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../../state/actions/system';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';
import { FormattedMessage, useIntl } from 'react-intl';
import ConflictedPathDiffDialog from '../../ConflictedPathDiffDialog';
import { useActiveSiteId } from '../../../hooks/useActiveSiteId';
import { messages } from './translations';
import { ConfirmDialog } from '../../ConfirmDialog';

export interface RepoStatusProps {
  status: RepositoryStatus;
  openConfirmDialog?: boolean;
  onCommitSuccess?(status: RepositoryStatus): void;
  onConflictResolved?(status: RepositoryStatus): void;
  onFailedPullCancelled?(status: RepositoryStatus): void;
  onRevertSuccess?(): void;
  onConfirmDialogOk?(): void;
  onConfirmDialogCancel?(): void;
}

export function RepoStatus(props: RepoStatusProps) {
  const {
    status,
    openConfirmDialog,
    onCommitSuccess: onCommitSuccessProp,
    onRevertSuccess,
    onFailedPullCancelled,
    onConflictResolved,
    onConfirmDialogOk
  } = props;
  const siteId = useActiveSiteId();
  const [openCommitResolutionDialog, setOpenCommitResolutionDialog] = useState(false);
  const [openRemoteRepositoriesDiffDialog, setOpenRemoteRepositoriesDiffDialog] = useState(false);
  const [diffPath, setDiffPath] = useState(null);
  const dispatch = useDispatch();
  const [fetching, setFetching] = useState(false);
  const { formatMessage } = useIntl();

  if (!props.status || fetching) {
    return <RepoStatusSkeleton />;
  }

  const onRevertPull = () => {
    setFetching(true);
    cancelFailedPull(siteId).subscribe({
      next(status) {
        onFailedPullCancelled?.(status);
        setFetching(false);
        onRevertSuccess?.();
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

  const onCommitSuccess = (status: RepositoryStatus) => {
    onCommitSuccessProp?.(status);
    setFetching(false);
    setOpenCommitResolutionDialog(false);
    dispatch(
      showSystemNotification({
        message: formatMessage(messages.commitSuccessMessage)
      })
    );
  };

  const onResolveConflict = (resolution: string, path: string) => {
    setFetching(true);
    resolveConflict(siteId, path, resolution).subscribe({
      next(status) {
        onConflictResolved?.(status);
        setFetching(false);
        setOpenRemoteRepositoriesDiffDialog(false);
      },
      error({ response }) {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  const onCommitError = (response) => {
    dispatch(showErrorDialog({ error: response }));
  };

  const openDiffDialog = (path) => {
    setDiffPath(path);
    setOpenRemoteRepositoriesDiffDialog(true);
  };

  return (
    <>
      <RepoStatusUI
        status={status}
        onRevertPull={onRevertPull}
        onCommitClick={() => setOpenCommitResolutionDialog(true)}
        onResolveConflict={onResolveConflict}
        onDiffClick={openDiffDialog}
      />
      <CommitResolutionDialog
        open={openCommitResolutionDialog}
        onClose={() => setOpenCommitResolutionDialog(false)}
        onCommitRequestSent={() => setFetching(true)}
        onCommitSuccess={onCommitSuccess}
        onCommitError={onCommitError}
      />
      <ConflictedPathDiffDialog
        open={openRemoteRepositoriesDiffDialog}
        path={diffPath}
        onResolveConflict={onResolveConflict}
        onClose={() => setOpenRemoteRepositoriesDiffDialog(false)}
      />
      <ConfirmDialog
        open={openConfirmDialog}
        body={<FormattedMessage defaultMessage="A resolution is required before continuing" />}
        okButtonText={<FormattedMessage defaultMessage="Stay and continue resolution" />}
        cancelButtonText={<FormattedMessage defaultMessage="Revert all and close" />}
        onOk={onConfirmDialogOk}
        onCancel={() => onRevertPull()}
      />
    </>
  );
}

export default RepoStatus;
