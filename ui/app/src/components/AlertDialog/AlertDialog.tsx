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

import * as React from 'react';
import { AlertDialogProps } from './utils';
import useOnClose from '../../hooks/useOnClose';
import { Dialog } from '@mui/material';
import AlertDialogContainer from './AlertDialogContainer';
import { getStyles } from './styles';

export function AlertDialog(props: AlertDialogProps) {
  const {
    open,
    disableBackdropClick,
    disableEnforceFocus,
    hideBackdrop,
    maxWidth,
    disableEscapeKeyDown,
    onClose,
    ...rest
  } = props;
  const sx = getStyles();

  const onCloseHandler = useOnClose({
    onClose: onClose,
    disableBackdropClick: disableBackdropClick,
    disableEscapeKeyDown: disableEscapeKeyDown
  });

  return (
    <Dialog
      open={open}
      onClose={onCloseHandler}
      aria-labelledby="confirmDialogTitle"
      aria-describedby="confirmDialogBody"
      disableEnforceFocus={disableEnforceFocus}
      hideBackdrop={hideBackdrop}
      sx={sx.dialog}
      maxWidth={maxWidth ?? 'xs'}
      fullWidth
    >
      <AlertDialogContainer {...rest} />
    </Dialog>
  );
}

export default AlertDialog;
