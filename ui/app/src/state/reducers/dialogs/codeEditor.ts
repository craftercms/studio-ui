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
import {
  closeCodeEditorDialog,
  codeEditorDialogClosed,
  showCodeEditorDialog,
  updateCodeEditorDialog
} from '../../actions/dialogs';
import { CodeEditorDialogStateProps } from '../../../components/CodeEditorDialog/utils';
import { commonDialogProps } from '../../../utils/state';
import { changeSite } from '../../actions/sites';

const initialState: CodeEditorDialogStateProps = commonDialogProps({
  path: null,
  contentType: null,
  readonly: false,
  isFullScreen: false,
  isMinimized: false
});

export default createReducer<GlobalState['dialogs']['codeEditor']>(initialState, (builder) => {
  builder
    .addCase(showCodeEditorDialog, (state, { payload }) => {
      return state.open
        ? state
        : {
            ...state,
            onClose: closeCodeEditorDialog(),
            onClosed: codeEditorDialogClosed(),
            onMinimize: updateCodeEditorDialog({ isMinimized: true }),
            onMaximize: updateCodeEditorDialog({ isMinimized: false }),
            onFullScreen: updateCodeEditorDialog({ isFullScreen: true }),
            onCancelFullScreen: updateCodeEditorDialog({ isFullScreen: false }),
            ...(payload as object),
            open: true
          };
    })
    .addCase(updateCodeEditorDialog, (state, { payload }) => ({
      ...state,
      ...(payload as object)
    }))
    .addCase(closeCodeEditorDialog, (state) => ({
      ...state,
      open: false
    }))
    .addCase(codeEditorDialogClosed, () => initialState)
    .addCase(changeSite, () => initialState);
});
