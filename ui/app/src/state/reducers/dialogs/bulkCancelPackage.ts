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
import { CancelPackageDialogStateProps } from '../../../components/CancelPackageDialog';
import GlobalState from '../../../models/GlobalState';
import {
	bulkCancelPackageDialogClosed,
	closeBulkCancelPackageDialog,
	showBulkCancelPackageDialog,
	updateBulkCancelPackageDialog
} from '../../actions/dialogs';

const initialState: CancelPackageDialogStateProps = {
	open: false,
	isSubmitting: null,
	isMinimized: null,
	hasPendingChanges: null
};

export default createReducer<GlobalState['dialogs']['cancelPackage']>(initialState, (builder) => {
	builder
		.addCase(showBulkCancelPackageDialog, (state, { payload }) => ({
			...state,
			onClose: closeBulkCancelPackageDialog(),
			onClosed: bulkCancelPackageDialogClosed(),
			...(payload as Partial<CancelPackageDialogStateProps>),
			open: true
		}))
		.addCase(updateBulkCancelPackageDialog, (state, { payload }) => ({
			...state,
			...(payload as Partial<CancelPackageDialogStateProps>)
		}))
		.addCase(closeBulkCancelPackageDialog, (state) => ({ ...state, open: false }))
		.addCase(bulkCancelPackageDialogClosed, () => initialState);
});
