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
import MuiDialogActions, { DialogActionsProps } from '@material-ui/core/DialogActions';
import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';
import clsx from 'clsx';
import { Theme } from '@material-ui/core/styles';

const styles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '50px',
      backgroundColor: theme.palette.background.paper,
      borderTop: '1px solid rgba(0, 0, 0, 0.12)'
    }
  })
);

export default function DialogFooter(props: DialogActionsProps) {
  const classes = styles();
  return (
    <MuiDialogActions
      {...props}
      className={clsx(classes.root, props.className)}
    />
  );
}
