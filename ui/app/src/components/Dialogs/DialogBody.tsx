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
import MuiDialogContent, { DialogContentProps } from '@mui/material/DialogContent';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';

export type DialogBodyProps = DialogContentProps & { minHeight?: boolean };

const styles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flex: '1 1 auto',
      flexDirection: 'column',
      padding: `${theme.spacing(2)} !important`,
      backgroundColor: theme.palette.background.default
    },
    minHeight: {
      minHeight: '50vh'
    }
  })
);

export default function DialogBody(props: DialogBodyProps) {
  const classes = styles();
  const { minHeight, ...dialogContentProps } = props;
  return (
    <MuiDialogContent
      {...dialogContentProps}
      className={clsx(classes.root, props.className, props.minHeight && classes.minHeight)}
    />
  );
}
