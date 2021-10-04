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
import Paper from '@mui/material/Paper';
import { PublishingStatusDialogContainer } from '../PublishingStatusDialog';
import { clearLock, start, stop } from '../../services/publishing';
import { fetchPublishingStatus } from '../../state/actions/publishingStatus';
import { useDispatch } from 'react-redux';
import { useSelection } from '../../utils/hooks/useSelection';

type PublishingStatusWidgetProps = {
  siteId: string;
};

export default function PublishingStatusWidget(props: PublishingStatusWidgetProps) {
  const { siteId } = props;
  const state = useSelection((state) => state.dialogs.publishingStatus);
  const { enabled, status, lockOwner, lockTTL, numberOfItems, publishingTarget, submissionId, totalItems } = state;
  const dispatch = useDispatch();

  const onStartStop = () => {
    const action = state.status === 'ready' ? stop : start;

    action(siteId).subscribe(() => {
      dispatch(fetchPublishingStatus());
    });
  };

  const onUnlock = () => {
    clearLock(siteId).subscribe(() => {
      dispatch(fetchPublishingStatus());
    });
  };

  const onRefresh = () => {
    dispatch(fetchPublishingStatus());
  };

  return (
    <Paper elevation={2}>
      <PublishingStatusDialogContainer
        enabled={enabled}
        status={status}
        lockOwner={lockOwner}
        lockTTL={lockTTL}
        isFetching={!state}
        onClose={null}
        onRefresh={onRefresh}
        onStartStop={onStartStop}
        onUnlock={lockOwner ? onUnlock : null}
        numberOfItems={numberOfItems}
        publishingTarget={publishingTarget}
        submissionId={submissionId}
        totalItems={totalItems}
      />
    </Paper>
  );
}
