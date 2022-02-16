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
import { UIBlockerStateProps } from '../../../components/UIBlocker';
import { blockUI, unblockUI } from '../../actions/system';

const initialState: UIBlockerStateProps = { open: false, progress: 'indeterminate' };

export default createReducer<UIBlockerStateProps>(initialState, {
  [blockUI.type]: (state, { payload }) => ({
    ...state,
    ...payload,
    open: true
  }),
  [unblockUI.type]: () => initialState
});
