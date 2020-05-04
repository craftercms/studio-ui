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
import { HistoryDialogStateProps } from '../../../modules/Content/History/HistoryDialog';
import {
  changeHistoryDialogItem,
  closeCompareVersionsDialog,
  closeHistoryDialog,
  closeViewVersionDialog,
  showCompareVersionsDialog,
  showHistoryDialog,
  showViewVersionDialog
} from '../../actions/dialogs';

const initialState: HistoryDialogStateProps = {
  open: false,
  rootPath: '/site/website',
  item: null
};

export default createReducer<GlobalState['dialogs']['history']>(
  initialState,
  {
    [showHistoryDialog.type]: (state, { payload }) => ({
      onClose: closeHistoryDialog(),
      ...state,
      onDismiss: closeHistoryDialog(),
      ...payload,
      open: true
    }),
    [changeHistoryDialogItem.type]: (state, {payload}) => ({
      ...state,
      item: payload
    }),
    [closeHistoryDialog.type]: (state) => ({
      ...initialState,
      onClose: state.onClose
    }),
    [closeViewVersionDialog.type]: () => initialState,
    [closeCompareVersionsDialog.type]: () => initialState,
    [showViewVersionDialog.type]: (state) => ({
      ...state,
      open: false
    }),
    [showCompareVersionsDialog.type]: (state) => ({
      ...state,
      open: false
    })
  }
);
