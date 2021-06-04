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

import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import { SetWorkflowStateDialogContainer } from './SetWorkFlowStateDialogContainer';
import { StatesToUpdate } from '../../services/workflowStates';

export interface SetWorkflowStateDialogProps {
  open: boolean;
  title: React.ReactNode;
  onClose(): void;
  onClosed?(): void;
  onConfirm(update: StatesToUpdate): void;
}

export default function SetWorkflowStateDialog(props: SetWorkflowStateDialogProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <SetWorkflowStateDialogContainer {...props} />
    </Dialog>
  );
}
