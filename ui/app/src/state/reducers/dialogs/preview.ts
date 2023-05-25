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
import { closePreviewDialog, previewDialogClosed, showPreviewDialog, updatePreviewDialog } from '../../actions/dialogs';
import { PreviewDialogStateProps } from '../../../components/PreviewDialog/utils';

const initialState: PreviewDialogStateProps = {
  open: false,
  isSubmitting: null,
  isMinimized: null,
  isFullScreen: null,
  hasPendingChanges: null,
  type: null,
  title: null,
  url: null,
  content: null
};

export default createReducer<GlobalState['dialogs']['preview']>(initialState, (builder) => {
  builder
    .addCase(showPreviewDialog, (state, { payload }) => ({
      ...state,
      onClose: closePreviewDialog(),
      onClosed: previewDialogClosed(),
      onFullScreen: updatePreviewDialog({ isFullScreen: true }),
      onCancelFullScreen: updatePreviewDialog({ isFullScreen: false }),
      onMinimize: updatePreviewDialog({ isMinimized: true }),
      onMaximize: updatePreviewDialog({ isMinimized: false }),
      ...(payload as object),
      open: true
    }))
    .addCase(updatePreviewDialog, (state, { payload }) => ({
      ...state,
      ...(payload as object)
    }))
    .addCase(closePreviewDialog, (state) => ({
      ...state,
      open: false
    }))
    .addCase(previewDialogClosed, () => initialState);
});
