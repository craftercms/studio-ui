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

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import React, { PropsWithChildren, ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  ok: {
    id: 'words.ok',
    defaultMessage: 'Ok'
  },
  cancel: {
    id: 'words.cancel',
    defaultMessage: 'Cancel'
  }
});

type ConfirmDialogProps = PropsWithChildren<{
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  disableEnforceFocus?: boolean;
  disableOkButton?: boolean;
  disableCancelButton?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  onOk?(): any;
  onCancel?(): any;
  onClose(): any;
}>;

export default function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open,
    onOk,
    onClose,
    onCancel,
    description,
    title,
    disableEnforceFocus = false,
    children,
    disableOkButton = false,
    disableCancelButton = false,
    disableBackdropClick = false,
    disableEscapeKeyDown = false
  } = props;
  const { formatMessage } = useIntl();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmDialogTitle"
      aria-describedby="confirmDialogBody"
      disableEnforceFocus={disableEnforceFocus}
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
    >
      {title && <DialogTitle id="confirmDialogTitle">{title}</DialogTitle>}
      <DialogContent id="confirmDialogBody" dividers>
        {description && <DialogContentText>{description}</DialogContentText>}
      </DialogContent>
      {children}
      <DialogActions>
        {onCancel && (
          <Button onClick={onCancel} variant="outlined" disabled={disableCancelButton}>
            {formatMessage(messages.cancel)}
          </Button>
        )}
        {onOk && (
          <Button onClick={onOk} variant="contained" color="primary" autoFocus disabled={disableOkButton}>
            {formatMessage(messages.ok)}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
