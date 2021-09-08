/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { WidgetDescriptor } from '../Widget';
import React, { PropsWithChildren } from 'react';
import StandardAction from '../../models/StandardAction';
import { useDispatch } from 'react-redux';
import useStyles from './styles';
import { Dialog } from '@mui/material';
import { WidgetDialogUI } from '.';
import { useMinimizeDialog } from '../../utils/hooks/useMinimizeDialog';

interface WidgetDialogBaseProps {
  open: boolean;
  title: string;
  id: string;
  widget: WidgetDescriptor;
}

export type WidgetDialogProps = PropsWithChildren<
  WidgetDialogBaseProps & {
    onClose(): void;
    onClosed?(): void;
  }
>;

export interface WidgetDialogStateProps extends WidgetDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export default function WidgetDialog(props: WidgetDialogProps) {
  const { open, widget, onClose, title, id } = props;
  const dispatch = useDispatch();
  const classes = useStyles();

  const minimized = useMinimizeDialog({
    id,
    title,
    minimized: false
  });

  const onMinimize = () => {
    dispatch(minimizeDialog({ id }));
  };
  return (
    <Dialog
      open={open && !minimized}
      keepMounted={minimized}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <WidgetDialogUI onClose={onClose} onMinimize={onMinimize} title={title} widget={widget} />
    </Dialog>
  );
}
