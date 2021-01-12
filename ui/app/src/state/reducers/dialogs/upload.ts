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
import { closeUploadDialog, showUploadDialog, uploadDialogClosed } from '../../actions/dialogs';
import { UploadDialogStateProps } from '../../../components/Dialogs/UploadDialog';

const initialState: UploadDialogStateProps = {
  open: false,
  path: null,
  maxSimultaneousUploads: 1,
  site: null
};

export default createReducer<GlobalState['dialogs']['upload']>(initialState, {
  [showUploadDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeUploadDialog(),
    onClosed: uploadDialogClosed(),
    onCreate: closeUploadDialog(),
    ...payload,
    open: true
  }),
  [closeUploadDialog.type]: (state) => ({
    ...state,
    open: false
  }),
  [uploadDialogClosed.type]: () => initialState
});
