/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License version 3 as published by
 *  the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { createAction, createReducer } from '@reduxjs/toolkit';
import StandardAction from '../../../models/StandardAction';
import GlobalState from '../../../models/GlobalState';
import { PublishDialogStateProps } from '../../../modules/Content/Publish/PublishDialog';

export const showPublishDialog = createAction<Partial<PublishDialogStateProps>>('SHOW_PUBLISH_DIALOG');

export const closePublishDialog = createAction<StandardAction>('CLOSE_PUBLISH_DIALOG');

export default createReducer<GlobalState['dialogs']['publish']>(
  { open: false },
  {
    [showPublishDialog.type]: (state, { payload }) => ({
      onClose: closePublishDialog(),
      onSuccess: closePublishDialog(),
      ...payload,
      open: true
    }),
    [closePublishDialog.type]: (state) => ({ open: false, onClose: state.onClose })
  }
);
