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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import { CompareVersionsDialogStateProps } from '../../../modules/Content/History/CompareVersionsDialog';
import {
  closeCompareVersionsDialog,
  showCompareVersionsDialog,
  showHistoryDialog
} from '../../actions/dialogs';

const initialState: CompareVersionsDialogStateProps = {
  open: false,
  isFetching: null,
  error: null,
  rootPath: null,
  item: null
};

export default createReducer<GlobalState['dialogs']['compareVersions']>(initialState, {
  [showCompareVersionsDialog.type]: (state, { payload }) => ({
    ...state,
    onDismiss: closeCompareVersionsDialog(),
    ...payload,
    open: true,
    isFetching: true
  }),
  [closeCompareVersionsDialog.type]: (state) => ({
    ...initialState,
    onClose: state.onClose
  }),
  [showHistoryDialog.type]: () => initialState
});
