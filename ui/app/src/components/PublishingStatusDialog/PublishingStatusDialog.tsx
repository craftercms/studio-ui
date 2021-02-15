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

import Dialog from '@material-ui/core/Dialog';
import * as React from 'react';
import { PublishingStatusTileProps } from '../PublishingStatusTile';
import StandardAction from '../../models/StandardAction';
import PublishingStatusDialogBody from './PublishingStatusDialogBody';

export interface PublishingStatusDialogBaseProps {
  open: boolean;
  status: PublishingStatusTileProps['status'];
  details: string;
  isFetching: boolean;
}

export interface PublishingStatusDialogProps extends PublishingStatusDialogBaseProps {
  onClose(): void;
  onRefresh?(): void;
}

export interface PublishingStatusDialogStateProps extends PublishingStatusDialogBaseProps {
  onClose: StandardAction;
  onRefresh: StandardAction;
}

function PublishingStatusDialog(props: PublishingStatusDialogProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <PublishingStatusDialogBody {...props} />
    </Dialog>
  );
}

export default PublishingStatusDialog;
