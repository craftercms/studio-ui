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

import React from 'react';
import { useOnClose } from '../../hooks/useOnClose';
import { ConfirmDialogProps } from './utils';
import ConfirmDialogContainer from './ConfirmDialogContainer';
import { Dialog } from '@mui/material';
import { useStyles } from './styles';

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { classes } = useStyles(props.styles);
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
      className={classes.dialog}
      maxWidth={maxWidth ?? 'xs'}
      fullWidth
    >
      <ConfirmDialogContainer {...rest} classes={classes} />
    </Dialog>
  );
}

export default ConfirmDialog;
