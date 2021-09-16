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

import React from 'react';
import { EnhancedDialog as Dialog } from '../Dialog';
import { CreateFolderProps } from './utils';
import CreateFolderContainer from './CreateFolderContainer';
import { useDispatch } from 'react-redux';
import { updateCreateFolderDialog } from '../../state/actions/dialogs';
import { useWithPendingChangesCloseRequest } from '../../utils/hooks/useWithPendingChangesCloseRequest';

export function CreateFolderDialog(props: CreateFolderProps) {
  const { open, onClose, isSubmitting, hasPendingChanges, minimized, ...rest } = props;
  const dispatch = useDispatch();
  const onMinimize = () => dispatch(updateCreateFolderDialog({ minimized: true }));
  const onMaximize = () => dispatch(updateCreateFolderDialog({ minimized: false }));
  const onWithPendingChangesCloseRequest = useWithPendingChangesCloseRequest(onClose);
  return (
    <Dialog
      open={open}
      title="Create a New Folder"
      maxWidth="xs"
      onClose={onClose}
      isSubmitting={isSubmitting}
      hasPendingChanges={hasPendingChanges}
      minimized={minimized}
      onMaximize={onMaximize}
      onMinimize={onMinimize}
      onWithPendingChangesCloseRequest={onWithPendingChangesCloseRequest}
    >
      <CreateFolderContainer {...rest} onClose={onClose} isSubmitting={isSubmitting} />
    </Dialog>
  );
}

export default CreateFolderDialog;
