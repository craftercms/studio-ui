/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import Dialog, { DialogProps } from '@mui/material/Dialog';
import { PublishDialogContainer, PublishDialogContainerProps } from './PublishDialogContainer';
import { useOnClose } from '../../utils/hooks/useOnClose';

export type PublishDialogProps = DialogProps & PublishDialogContainerProps;

export function PublishDialog(props: PublishDialogProps) {
  const { items, scheduling, onClosed, onDismiss, onSuccess, onClose, disableQuickDismiss, ...dialogProps } = props;
  const onCloseInternal = useOnClose({
    onClose,
    disableBackdropClick: disableQuickDismiss,
    disableEscapeKeyDown: disableQuickDismiss
  });
  return (
    <Dialog fullWidth maxWidth="md" {...dialogProps} onClose={onCloseInternal}>
      <PublishDialogContainer
        items={items}
        scheduling={scheduling}
        onClosed={onClosed}
        onDismiss={onDismiss}
        onSuccess={onSuccess}
        disableQuickDismiss={disableQuickDismiss}
      />
    </Dialog>
  );
}

export default PublishDialog;
