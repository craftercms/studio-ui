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
import Dialog from '@mui/material/Dialog';
import EditGroupDialogContainer, { EditGroupDialogContainerProps } from './EditGroupDialogContainer';
import { FormattedMessage } from 'react-intl';
import ConfirmDialog from '../Dialogs/ConfirmDialog';

export interface EditGroupDialogProps extends Omit<EditGroupDialogContainerProps, 'setPendingChanges'> {
  open: boolean;
}

export default function EditGroupDialog(props: EditGroupDialogProps) {
  const { open, onClose, ...rest } = props;
  const [pendingChanges, setPendingChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const onDialogClose = () => {
    if (pendingChanges) {
      setShowConfirmDialog(true);
    } else {
      setPendingChanges(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onDialogClose} fullWidth maxWidth="md">
        <EditGroupDialogContainer onClose={onDialogClose} setPendingChanges={setPendingChanges} {...rest} />
      </Dialog>
      <ConfirmDialog
        open={showConfirmDialog}
        title={
          <FormattedMessage
            id="editGroupDialog.pendingChangesConfirmation"
            defaultMessage="Close without saving changes?"
          />
        }
        onOk={() => {
          setShowConfirmDialog(false);
          setPendingChanges(false);
          onClose();
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
}
