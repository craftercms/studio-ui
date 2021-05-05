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
import Group from '../../models/Group';
import Dialog from '@material-ui/core/Dialog';
import EditGroupDialogContainer from './EditGroupDialogContainer';

export interface EditGroupDialogProps {
  open: boolean;
  group?: Group;
  onClose(): void;
  onClosed?(): void;
  onGroupSaved(group: Group): void;
  onGroupDeleted(group: Group): void;
}

export default function EditGroupDialog(props: EditGroupDialogProps) {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <EditGroupDialogContainer {...props} />
    </Dialog>
  );
}
