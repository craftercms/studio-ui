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

import { createAction, createReducer } from '@reduxjs/toolkit';
import StandardAction from '../../../models/StandardAction';
import GlobalState from '../../../models/GlobalState';
import { EmbeddedLegacyEditorsStateProps } from '../../../modules/Preview/EmbeddedLegacyEditors';

export const showEdit = createAction<Partial<EmbeddedLegacyEditorsStateProps>>(
  'SHOW_EDIT'
);

export const updateEditConfig = createAction<any>('UPDATE_EDIT_CONFIG');

export const closeEdit = createAction<StandardAction>(
  'CLOSE_EDIT'
);

export const newContentCreationComplete = createAction<StandardAction>(
  'NEW_CONTENT_CREATION_COMPLETE',
);

export default createReducer<GlobalState['dialogs']['edit']>(
  { open: false },
  {
    [showEdit.type]: (state, { payload }) => ({
      onDismiss: closeEdit(),
      ...payload,
      open: true
    }),
    [updateEditConfig.type]: (state, { payload}) => ({
      ...state,
      ...payload
    }),
    [closeEdit.type]: (state, { payload }) => ({
      ...state,
      ...payload,
      open: false,
      onClose: state.onClose
    })
  }
);
