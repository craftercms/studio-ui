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
import { closePackageDetailsDialog, packageDetailsDialogClosed, showPackageDetailsDialog } from '../../actions/dialogs';
import { PackageDetailsDialogStateProps } from '../../../components';
import { GlobalState } from '../../../models';

const initialState = {
	open: false,
	packageId: null
};

export default createReducer<GlobalState['dialogs']['packageDetails']>(initialState, (builder) => {
	builder
		.addCase(showPackageDetailsDialog, (state, { payload }) => ({
			...state,
			onClose: closePackageDetailsDialog(),
			onClosed: packageDetailsDialogClosed(),
			...(payload as Partial<PackageDetailsDialogStateProps>),
			open: true
		}))
		.addCase(closePackageDetailsDialog, (state) => ({ ...state, open: false }))
		.addCase(packageDetailsDialogClosed, () => initialState);
});
