/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { RepositoryStatus } from '../../../models';
import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
import { DialogBody } from '../../DialogBody';
import { RepoStatus } from '../RepoStatus';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';

export interface RepoStatusConflictDialogProps extends EnhancedDialogProps {
  status: RepositoryStatus;
  onCommitSuccess?(status: RepositoryStatus): void;
  onRevertSuccess?(): void;
  onConflictResolved?(status: RepositoryStatus): void;
  onFailedPullCancelled?(status: RepositoryStatus): void;
}

export function RepoStatusConflictDialog(props: RepoStatusConflictDialogProps) {
  const {
    status,
    onCommitSuccess,
    onRevertSuccess: onRevertSuccessProp,
    onConflictResolved,
    onFailedPullCancelled,
    ...dialogProps
  } = props;
  const isRepoClean = status?.clean ?? false;
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const onRevertSuccess = () => {
    setOpenConfirmDialog(false);
    onRevertSuccessProp?.();
  };

  const onConfirmDialogOk = () => {
    setOpenConfirmDialog(false);
  };

  const onClose = (e) => {
    if (!isRepoClean) {
      setOpenConfirmDialog(true);
    } else {
      props.onClose?.(e, null);
    }
  };

  return (
    <>
      <EnhancedDialog
        maxWidth="lg"
        {...dialogProps}
        onClose={onClose}
        title={<FormattedMessage defaultMessage="Resolve conflicts" />}
      >
        <DialogBody>
          <RepoStatus
            status={status}
            openConfirmDialog={openConfirmDialog}
            onCommitSuccess={onCommitSuccess}
            onConflictResolved={onConflictResolved}
            onFailedPullCancelled={onFailedPullCancelled}
            onConfirmDialogOk={onConfirmDialogOk}
            onRevertSuccess={onRevertSuccess}
          />
        </DialogBody>
      </EnhancedDialog>
    </>
  );
}

export default RepoStatusConflictDialog;
