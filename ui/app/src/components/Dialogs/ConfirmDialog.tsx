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

import DialogHeader from './DialogHeader';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import React, { PropsWithChildren } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import { Dialog } from '@material-ui/core';
import { useOnUnmount } from '../../utils/hooks';

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

interface ConfirmDialogBaseProps {
  open: boolean;
  title?: string;
  body?: string;
  disableEnforceFocus?: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
}

export type ConfirmDialogProps = PropsWithChildren<ConfirmDialogBaseProps & {
  onOk?(): any;
  onCancel?(): any;
  onClose?(): any;
  onClosed?(): any;
  onDismiss?(): any;
}>;

export interface ConfirmDialogStateProps extends ConfirmDialogBaseProps {
  onOk?: StandardAction;
  onCancel?: StandardAction;
  onDismiss?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="confirmDialogTitle"
      aria-describedby="confirmDialogBody"
      disableEscapeKeyDown={props.disableEscapeKeyDown}
      disableBackdropClick={props.disableBackdropClick}
      disableEnforceFocus={props.disableEnforceFocus}
    >
      <ConfirmDialogWrapper {...props} />
    </Dialog>
  );
}
function ConfirmDialogWrapper(props: ConfirmDialogProps) {
  const {
    onOk,
    onCancel,
    onDismiss,
    body,
    title,
    children
  } = props;
  const { formatMessage } = useIntl();
  useOnUnmount(props.onClosed);
  return (
    <>
      {title && <DialogHeader id="confirmDialogTitle" title={title} onDismiss={onDismiss} />}
      <DialogBody id="confirmDialogBody">
        {body && <DialogContentText color="textPrimary">{body}</DialogContentText>}
        {children}
      </DialogBody>
      <DialogFooter>
        <DialogActions>
          {onCancel && (
            <Button onClick={onCancel} variant="outlined">
              {formatMessage(messages.cancel)}
            </Button>
          )}
          {onOk && (
            <Button onClick={onOk} variant="contained" color="primary" autoFocus>
              {formatMessage(messages.ok)}
            </Button>
          )}
        </DialogActions>
      </DialogFooter>
    </>
  );
}
