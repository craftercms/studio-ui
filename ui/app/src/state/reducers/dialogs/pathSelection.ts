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
import GlobalState from '../../../models/GlobalState';
import { closePathSelectionDialog, pathSelectionDialogClosed, showPathSelectionDialog } from '../../actions/dialogs';
import { PathSelectionDialogStateProps } from '../../../components/PathSelectionDialog/PathSelectionDialog';

const initialState: PathSelectionDialogStateProps = {
  open: false,
  rootPath: '/site',
  showCreateFolderOption: true
};

export default createReducer<GlobalState['dialogs']['pathSelection']>(initialState, (builder) => {
  builder
    .addCase(showPathSelectionDialog, (state, { payload }) => ({
      ...state,
      onClose: closePathSelectionDialog(),
      onClosed: pathSelectionDialogClosed(),
      onOk: closePathSelectionDialog(),
      ...(payload as Partial<PathSelectionDialogStateProps>),
      open: true
    }))
    .addCase(closePathSelectionDialog, (state) => ({
      ...state,
      open: false
    }))
    .addCase(pathSelectionDialogClosed, () => initialState);
});
