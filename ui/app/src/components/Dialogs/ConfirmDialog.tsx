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

import DialogContent from '@material-ui/core/DialogContent';
import DialogFooter from './DialogFooter';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import React, { PropsWithChildren } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import Dialog from '@material-ui/core/Dialog';
import { useUnmount } from '../../utils/hooks';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import questionGraphicUrl from '../../assets/question.svg';
import { CSSProperties } from '@material-ui/styles';

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

type ConfirmDialogStateClassKey = 'dialog' | 'dialogBody' | 'dialogTitle' | 'dialogFooter';

type ConfirmDialogStateStyles = Partial<Record<ConfirmDialogStateClassKey, CSSProperties>>;

const useStyles = makeStyles(() =>
  createStyles<ConfirmDialogStateClassKey, ConfirmDialogStateStyles>({
    dialog: (styles) => ({
      '& .MuiPaper-root': {
        borderRadius: '20px'
      },
      ...styles.dialog
    }),
    dialogBody: (styles) => ({
      textAlign: 'center',
      padding: '40px 20px 0 !important',
      ...styles.dialogBody
    }),
    dialogTitle: (styles) => ({
      paddingTop: '35px',
      paddingBottom: '5px',
      ...styles.dialogTitle
    }),
    dialogFooter: (styles) => ({
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
      },
      ...styles.dialogFooter
    })
  })
);

interface ConfirmDialogBaseProps {
  open: boolean;
  title?: string;
  body?: string;
  hideBackdrop?: boolean;
  imageUrl?: string;
  disableEnforceFocus?: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  styles?: ConfirmDialogStateStyles;
}

export type ConfirmDialogProps = PropsWithChildren<
  ConfirmDialogBaseProps & {
    classes?: Partial<Record<ConfirmDialogStateClassKey, string>>;
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
  const classes = useStyles(props.styles);
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
      maxWidth="xs"
      fullWidth
    >
      <ConfirmDialogWrapper {...props} classes={classes} />
    </Dialog>
  );
}

function ConfirmDialogWrapper(props: ConfirmDialogProps) {
  const { onOk, onCancel, body, title, children, classes, imageUrl = questionGraphicUrl } = props;
  const { formatMessage } = useIntl();
  useUnmount(props.onClosed);
  return (
    <>
      <DialogContent id="confirmDialogBody" className={classes.dialogBody}>
        <img src={imageUrl} alt="" />
        {title && (
          <Typography variant="body1" component="h2" className={classes.dialogTitle}>
            {title}
          </Typography>
        )}
        {body && (
          <DialogContentText color="textPrimary" variant="body2">
            {body}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogFooter className={classes.dialogFooter}>
        {onOk && (
          <Button onClick={onOk} variant="contained" color="primary" autoFocus fullWidth size="large">
            {formatMessage(messages.accept)}
          </Button>
        )}
        {onCancel && (
          <Button onClick={onCancel} variant="outlined" fullWidth size="large">
            {formatMessage(messages.cancel)}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
