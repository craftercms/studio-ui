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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import { PublishingStatusDialogStateProps } from '../../../components/PublishingStatusDialog';
import {
  closePublishingStatusDialog,
  showPublishingStatusDialog,
  showUnlockPublisherDialog
} from '../../actions/dialogs';
import {
  fetchPublishingStatus,
  fetchPublishingStatusComplete,
  fetchPublishingStatusFailed,
  updatePublishingStatus
} from '../../actions/publishingStatus';
import { commonDialogProps } from '../../../utils/state';

const initialState: PublishingStatusDialogStateProps = commonDialogProps({
  open: false,
  enabled: null,
  status: null,
  published: null,
  message: null,
  lockOwner: null,
  lockTTL: null,
  isFetching: false,
  onClose: closePublishingStatusDialog(),
  onRefresh: fetchPublishingStatus(),
  onUnlock: null,
  numberOfItems: null,
  totalItems: null,
  publishingTarget: null,
  submissionId: null
});

const publishingStatus = createReducer<GlobalState['dialogs']['publishingStatus']>(initialState, (builder) => {
  builder
    .addCase(showPublishingStatusDialog, (state, { payload }) => {
      const data: Partial<PublishingStatusDialogStateProps> = payload;
      return {
        ...state,
        ...data,
        // Only show unlock if there is a lockOwner (i.e. if there's a lock)
        onUnlock: data?.lockOwner ? showUnlockPublisherDialog({}) : null,
        open: true
      };
    })
    .addCase(closePublishingStatusDialog, (state) => ({ ...state, open: false }))
    .addCase(updatePublishingStatus, (state, { payload }) => ({
      ...state,
      ...(payload as Partial<PublishingStatusDialogStateProps>)
    }))
    .addCase(fetchPublishingStatus, (state) => ({ ...state, isFetching: true }))
    .addCase(fetchPublishingStatusComplete, (state, { payload }) => ({
      ...state,
      ...(payload as Partial<PublishingStatusDialogStateProps>),
      isFetching: false
    }))
    .addCase(fetchPublishingStatusFailed, (state) => ({ ...state, isFetching: false }));
});

export default publishingStatus;
