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
import React, { PropsWithChildren } from 'react';
import { APIError } from '../../models/GlobalState';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import ErrorState from './ErrorState';
import StandardAction from '../../models/StandardAction';

const useStyles = makeStyles((theme: Theme) => createStyles({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1)
  }
}));


interface ErrorDialogBaseProps {
  error: APIError;
}

export type  ErrorDialogProps =  PropsWithChildren<
  ErrorDialogBaseProps & {
  onClose(): any;
}
>;

export interface ErrorDialogStateProps extends ErrorDialogBaseProps {
  onClose?: StandardAction;
}

export default function ErrorDialog(props: ErrorDialogProps) {
  const { onClose, error } = props;
  const classes = useStyles({});

  return (
    <Dialog
      open={Boolean(error)}
      onClose={onClose}
    >
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={() => onClose()}
      >
        <CloseIcon />
      </IconButton>
      {
        error &&
        <ErrorState error={error} />
      }
    </Dialog>
  );
}
