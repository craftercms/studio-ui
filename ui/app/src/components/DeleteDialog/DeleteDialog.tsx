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
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import { DeleteDialogContainer, DeleteDialogContainerProps } from './DeleteDialogContainer';
import { useOnClose } from '../../utils/hooks/useOnClose';

export type DeleteDialogProps = DialogProps & DeleteDialogContainerProps;

export default function DeleteDialog(props: DeleteDialogProps) {
  const {
    items,
    isFetching,
    onClose,
    onClosed,
    onSuccess,
    childItems,
    dependentItems,
    disableQuickDismiss,
    ...dialogProps
  } = props;
  const containerProps: DeleteDialogContainerProps = {
    items,
    onClose: props.onClose,
    isFetching,
    onClosed,
    onSuccess,
    childItems,
    dependentItems,
    disableQuickDismiss
  };
  const onCloseInternal = useOnClose({
    onClose,
    disableEscapeKeyDown: disableQuickDismiss,
    disableBackdropClick: disableQuickDismiss
  });
  return (
    <Dialog {...dialogProps} onClose={onCloseInternal} fullWidth maxWidth="md">
      <DeleteDialogContainer {...containerProps} />
    </Dialog>
  );
}
