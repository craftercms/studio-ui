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

import { createAction, createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import { reversePluckProps } from '../../../utils/object';
import { MinimizedTab } from '../../../models/MinimizedTab';

interface Payload {
  id: string;
}

export const pushTab = /*#__PURE__*/ createAction<MinimizedTab>('PUSH_TAB');

export const popTab = /*#__PURE__*/ createAction<Payload>('POP_TAB');

export const updateTab = /*#__PURE__*/ createAction<Partial<MinimizedTab> & Payload>('UPDATE_TAB');

export default createReducer<GlobalState['dialogs']['minimizedTabs']>({}, (builder) => {
  builder
    .addCase(pushTab, (state, { payload }) => ({
      ...state,
      [payload.id]: {
        ...payload
      }
    }))
    .addCase(popTab, (state, { payload }) => reversePluckProps(state, payload.id))
    .addCase(updateTab, (state, { payload }) => ({
      ...state,
      [payload.id]: { ...state[payload.id], ...payload }
    }));
});
