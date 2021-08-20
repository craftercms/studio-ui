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
import GlobalState from '../../../models/GlobalState';
import { reversePluckProps } from '../../../utils/object';
import { MinimizedDialog } from '../../../models/MinimizedDialog';

interface Payload {
  id: string;
}

export const pushDialog = /*#__PURE__*/ createAction<MinimizedDialog>('PUSH_DIALOG');

export const popDialog = /*#__PURE__*/ createAction<Payload>('POP_DIALOG');

export const minimizeDialog = /*#__PURE__*/ createAction<Payload>('MINIMIZE_DIALOG');

export const maximizeDialog = /*#__PURE__*/ createAction<Payload>('MAXIMIZE_DIALOG');

export const minimizedDialogUpdate = /*#__PURE__*/ createAction<Partial<MinimizedDialog> & Payload>(
  'MINIMIZED_DIALOG_UPDATE'
);

export default createReducer<GlobalState['dialogs']['minimizedDialogs']>(
  {},
  {
    [pushDialog.type]: (state, { payload }) => ({
      ...state,
      [payload.id]: {
        onMaximized: maximizeDialog({ id: payload.id }),
        ...payload
      }
    }),
    [popDialog.type]: (state, { payload }) => reversePluckProps(state, payload.id),
    [minimizedDialogUpdate.type]: (state, { payload }) => ({
      ...state,
      [payload.id]: { ...state[payload.id], ...payload }
    }),
    [minimizeDialog.type]: (state, { payload }) => ({
      ...state,
      [payload.id]: { ...state[payload.id], ...payload, minimized: true }
    }),
    [maximizeDialog.type]: (state, { payload }) => ({
      ...state,
      [payload.id]: { ...state[payload.id], ...payload, minimized: false }
    })
  }
);
