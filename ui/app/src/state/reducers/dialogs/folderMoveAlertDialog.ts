/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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
import {
	closeFolderMoveAlertDialog,
	folderMoveAlertDialogClosed,
	showFolderMoveAlertDialog
} from '../../actions/dialogs';
import { FolderMoveAlertDialogStateProps } from '../../../components/FolderMoveAlert/FolderMoveAlertDialog';

const initialState: FolderMoveAlertDialogStateProps = {
	open: false,
	isSubmitting: false,
	isMinimized: false,
	hasPendingChanges: false,
	item: null
};

export default createReducer<FolderMoveAlertDialogStateProps>(initialState, (builder) => {
	builder
		.addCase(showFolderMoveAlertDialog, (state, { payload }) => ({
			...state,
			onClose: closeFolderMoveAlertDialog(),
			onClosed: folderMoveAlertDialogClosed(),
			...(payload as Partial<FolderMoveAlertDialogStateProps>),
			open: true
		}))
		.addCase(closeFolderMoveAlertDialog, (state) => ({ ...state, open: false }))
		.addCase(folderMoveAlertDialogClosed, () => initialState);
});
