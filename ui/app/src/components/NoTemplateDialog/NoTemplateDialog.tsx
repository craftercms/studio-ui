/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import * as React from 'react';
import NoTemplateDialogContainer from './NoTemplateDialogContainer';
import Dialog from '@mui/material/Dialog';
import { useStyles } from '../ConfirmDialog/styles';
import { NoTemplateDialogProps } from './utils';

export function NoTemplateDialog(props: NoTemplateDialogProps) {
  const { open, ...rest } = props;
  const { classes } = useStyles({});

  return (
    <Dialog open={open} maxWidth="xs" className={classes.dialog}>
      <NoTemplateDialogContainer classes={classes} {...rest} />
    </Dialog>
  );
}

export default NoTemplateDialog;
