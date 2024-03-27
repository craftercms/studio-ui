/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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
import { BrokenReferencesDialogStateProps } from '../../../components/BrokenReferencesDialog/types';
import {
  brokenReferencesDialogClosed,
  closeBrokenReferencesDialog,
  showBrokenReferencesDialog,
  updateBrokenReferencesDialog
} from '../../actions/dialogs';

const initialState: BrokenReferencesDialogStateProps = {
  open: false,
  isSubmitting: null,
  isMinimized: null,
  hasPendingChanges: null
};

export default createReducer<GlobalState['dialogs']['brokenReferences']>(initialState, (builder) => {
  builder
    .addCase(showBrokenReferencesDialog, (state, { payload }) => ({
      ...state,
      onClose: closeBrokenReferencesDialog(),
      onClosed: brokenReferencesDialogClosed(),
      ...(payload as Partial<BrokenReferencesDialogStateProps>),
      open: true
    }))
    .addCase(closeBrokenReferencesDialog, (state) => ({ ...state, open: false }))
    .addCase(brokenReferencesDialogClosed, () => initialState)
    .addCase(updateBrokenReferencesDialog, (state, { payload }) => ({
      ...state,
      ...(payload as Partial<BrokenReferencesDialogStateProps>)
    }));
});
