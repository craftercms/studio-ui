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
import GlobalState from '../../../models/GlobalState';
import { closeViewPackagesDialog, showViewPackagesDialog, viewPackagesDialogClosed } from '../../actions/dialogs';
import { ViewPackagesDialogStateProps } from '../../../components/ViewPackagesDialog';

const initialState = {
	open: false,
	item: null
};

export default createReducer<GlobalState['dialogs']['viewPackages']>(initialState, (builder) => {
	builder
		.addCase(showViewPackagesDialog, (state, { payload }) => ({
			...state,
			onClose: closeViewPackagesDialog(),
			onClosed: viewPackagesDialogClosed(),
			...(payload as Partial<ViewPackagesDialogStateProps>),
			open: true
		}))
		.addCase(closeViewPackagesDialog, (state) => ({ ...state, open: false }))
		.addCase(viewPackagesDialogClosed, () => initialState);
});
