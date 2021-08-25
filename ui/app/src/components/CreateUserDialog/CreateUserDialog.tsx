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

import Dialog from '@material-ui/core/Dialog';
import React, { useState } from 'react';
import { CreateUserDialogUIProps, CreateUserDialogContainer } from './CreateUserDialogContainer';
import { useOnClose } from '../../utils/hooks/useOnClose';

export interface CreateUserDialogProps extends CreateUserDialogUIProps {
  open: boolean;
}

export function CreateUserDialog(props: CreateUserDialogProps) {
  const { open, onClose } = props;
  const [disableQuickDismiss, setDisableQuickDismiss] = useState(false);
  const onCloseHandler = useOnClose({
    onClose,
    disableBackdropClick: disableQuickDismiss,
    disableEscapeKeyDown: disableQuickDismiss
  });

  return (
    <Dialog open={open} onClose={onCloseHandler} fullWidth maxWidth="md">
      <CreateUserDialogContainer setDisableBackdropClick={setDisableQuickDismiss} {...props} />
    </Dialog>
  );
}

export default CreateUserDialog;
