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

import { closeUnlockPublisherDialog, showUnlockPublisherDialog } from '../../actions/dialogs';
import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import { UnlockPublisherDialogStateProps } from '../../../components/UnlockPublisherDialog';

const initialState: UnlockPublisherDialogStateProps = {
  open: false,
  onCancel: closeUnlockPublisherDialog(),
  onComplete: closeUnlockPublisherDialog(),
  onError: void 0,
  password: void 0
};

const unlockPublisher = createReducer<GlobalState['dialogs']['unlockPublisher']>(initialState, (builder) => {
  builder
    .addCase(showUnlockPublisherDialog, (state, { payload }) => ({
      ...state,
      ...(payload as Partial<UnlockPublisherDialogStateProps>),
      open: true
    }))
    .addCase(closeUnlockPublisherDialog, () => initialState);
});

export default unlockPublisher;
