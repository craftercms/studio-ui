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
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import { PublishDialogContainer, PublishDialogContainerProps } from './PublishDialogContainer';

export type PublishDialogProps = DialogProps & PublishDialogContainerProps;

export function PublishDialog(props: PublishDialogProps) {
  const { items, scheduling, onClosed, onDismiss, onSuccess, ...dialogProps } = props;
  return (
    <Dialog fullWidth maxWidth="md" {...dialogProps}>
      <PublishDialogContainer
        items={items}
        scheduling={scheduling}
        onClosed={onClosed}
        onDismiss={onDismiss}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}

export default PublishDialog;
