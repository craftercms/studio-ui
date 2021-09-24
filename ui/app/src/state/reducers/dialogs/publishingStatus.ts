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

const publishingStatus = createReducer<GlobalState['dialogs']['publishingStatus']>(initialState, {
  [showPublishingStatusDialog.type]: (state, { payload }) => ({
    ...state,
    ...payload,
    // Only show unlock if there is a lockOwner (i.e. if there's a lock)
    onUnlock: payload?.lockOwner ? showUnlockPublisherDialog({}) : null,
    open: true
  }),
  [closePublishingStatusDialog.type]: (state) => ({ ...state, open: false }),
  [updatePublishingStatus.type]: (state, { payload }) => ({ ...state, ...payload }),
  [fetchPublishingStatus.type]: (state) => ({ ...state, isFetching: true }),
  [fetchPublishingStatusComplete.type]: (state, { payload }) => ({ ...state, ...payload, isFetching: false }),
  [fetchPublishingStatusFailed.type]: (state) => ({ ...state, isFetching: false })
});

export default publishingStatus;
