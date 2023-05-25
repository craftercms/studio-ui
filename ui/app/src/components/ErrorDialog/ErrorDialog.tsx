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

import React, { PropsWithChildren } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/CloseRounded';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from 'tss-react/mui';
import StandardAction from '../../models/StandardAction';
import { ApiResponse } from '../../models/ApiResponse';
import ApiResponseErrorState from '../ApiResponseErrorState';
import { useUnmount } from '../../hooks/useUnmount';

interface ErrorDialogBaseProps {
  open: boolean;
  error?: ApiResponse;
}

export type ErrorDialogProps = PropsWithChildren<
  ErrorDialogBaseProps & {
    onClose?(): void;
    onClosed?(): void;
    onDismiss?(): void;
  }
>;

export interface ErrorDialogStateProps extends ErrorDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

const useStyles = makeStyles()((theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1)
  },
  body: {
    padding: theme.spacing(2)
  }
}));

function ErrorDialogBody(props: ErrorDialogProps) {
  const { onDismiss, error } = props;
  const { classes } = useStyles();
  useUnmount(props.onClosed);
  return (
    <div className={classes.body}>
      <IconButton aria-label="close" className={classes.closeButton} onClick={() => onDismiss()} size="large">
        <CloseIcon />
      </IconButton>
      {error && <ApiResponseErrorState error={error} />}
    </div>
  );
}

export function ErrorDialog(props: ErrorDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <ErrorDialogBody {...props} />
    </Dialog>
  );
}

export default ErrorDialog;
