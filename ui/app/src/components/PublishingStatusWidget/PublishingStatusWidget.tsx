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

import * as React from 'react';
import { PublishingStatus } from '../../models/Publishing';
import Paper from '@material-ui/core/Paper';
import { PublishingStatusDialogBody } from '../PublishingStatusDialog';

type PublishingStatusWidgetProps = {
  state: PublishingStatus;
  onRefresh?(): void;
  onStartStop?(): void;
  onUnlock?(): void;
};

export default function PublishingStatusWidget(props: PublishingStatusWidgetProps) {
  const { state, onRefresh, onStartStop, onUnlock } = props;
  const { enabled, status, message, lockOwner, lockTTL } = state;

  return (
    <Paper elevation={2}>
      <PublishingStatusDialogBody
        enabled={enabled}
        status={status}
        message={message}
        lockOwner={lockOwner}
        lockTTL={lockTTL}
        isFetching={!state}
        onClose={null}
        onRefresh={onRefresh}
        onStartStop={onStartStop}
        onUnlock={lockOwner ? onUnlock : null}
      />
    </Paper>
  );
}
