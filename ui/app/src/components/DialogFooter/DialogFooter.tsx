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
import MuiDialogActions, { DialogActionsProps } from '@mui/material/DialogActions';
import { makeStyles } from 'tss-react/mui';

const styles = makeStyles()((theme) => ({
  root: {
    minHeight: '50px',
    backgroundColor: theme.palette.background.paper,
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    padding: `${theme.spacing(1)} ${theme.spacing(1.8)}`
  }
}));

export function DialogFooter(props: DialogActionsProps) {
  const { classes, cx } = styles();
  return <MuiDialogActions {...props} className={cx(classes.root, props.className)} />;
}

export default DialogFooter;
