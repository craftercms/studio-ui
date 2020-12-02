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

import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import React, { PropsWithChildren } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import Dialog from '@material-ui/core/Dialog';
import { useUnmount } from '../../utils/hooks';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import confirmGraphicUrl from '../../assets/confirm.svg';

const messages = defineMessages({
  accept: {
    id: 'words.accept',
    defaultMessage: 'Accept'
  },
  cancel: {
    id: 'words.cancel',
    defaultMessage: 'Cancel'
  }
});

const confirmDialogStyles = makeStyles(() =>
  createStyles({
    dialog: {
      '& .MuiPaper-root': {
        maxWidth: '350px',
        borderRadius: '20px'
      }
    },
    dialogBody: {
      backgroundColor: '#fff',
      textAlign: 'center',
      padding: '40px 20px 0 !important'
    },
    dialogTitle: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
      paddingTop: '35px',
      paddingBottom: '5px',
      letterSpacing: '0.15px'
    },
    bodyText: {
      fontSize: '14px',
      letterSpacing: '0.15px'
    },
    dialogFooter: {
      borderTop: 'none',
      display: 'flex',
      flexDirection: 'column',
      padding: '25px 40px 35px',

      '& button': {
        fontWeight: 600,
        letterSpacing: '0.46px'
      },
      '& > :not(:first-child)': {
        marginTop: '10px',
        marginLeft: 0
      }
    }
  })
);

interface ConfirmDialogBaseProps {
  open: boolean;
  title?: string;
  body?: string;
  hideBackdrop?: boolean;
  disableEnforceFocus?: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
}

export type ConfirmDialogProps = PropsWithChildren<
  ConfirmDialogBaseProps & {
    onOk?(): void;
    onCancel?(): void;
    onClose?(): void;
    onClosed?(): void;
    onDismiss?(): void;
  }
>;

export interface ConfirmDialogStateProps extends ConfirmDialogBaseProps {
  onOk?: StandardAction;
  onCancel?: StandardAction;
  onDismiss?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  const classes = confirmDialogStyles();
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="confirmDialogTitle"
      aria-describedby="confirmDialogBody"
      disableEscapeKeyDown={props.disableEscapeKeyDown}
      disableBackdropClick={props.disableBackdropClick}
      disableEnforceFocus={props.disableEnforceFocus}
      hideBackdrop={props.hideBackdrop}
      className={classes.dialog}
    >
      <ConfirmDialogWrapper {...props} />
    </Dialog>
  );
}

function ConfirmDialogWrapper(props: ConfirmDialogProps) {
  const { onOk, onCancel, body, title, children } = props;
  const { formatMessage } = useIntl();
  const classes = confirmDialogStyles();
  useUnmount(props.onClosed);
  return (
    <>
      <DialogBody id="confirmDialogBody" className={classes.dialogBody}>
        <img src={confirmGraphicUrl} alt="" />
        {title && (
          <Typography variant="h2" component="h2" className={classes.dialogTitle}>
            {title}
          </Typography>
        )}
        {body && (
          <DialogContentText color="textPrimary" className={classes.bodyText}>
            {body}
          </DialogContentText>
        )}
        {children}
      </DialogBody>
      <DialogFooter className={classes.dialogFooter}>
        {onOk && (
          <Button onClick={onOk} variant="contained" color="primary" autoFocus fullWidth={true} size="large">
            {formatMessage(messages.accept)}
          </Button>
        )}
        {onCancel && (
          <Button onClick={onCancel} variant="outlined" fullWidth={true} size="large">
            {formatMessage(messages.cancel)}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
