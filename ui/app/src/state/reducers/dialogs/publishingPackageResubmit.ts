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
import { PublishingPackageResubmitDialogStateProps } from '../../../components/PublishingPackageResubmitDialog/types';
import { GlobalState } from '../../../models';
import {
	closePublishingPackageResubmitDialog,
	publishingPackageResubmitDialogClosed,
	showPublishingPackageResubmitDialog,
	updatePublishingPackageResubmitDialog
} from '../../actions/dialogs';

const initialState: PublishingPackageResubmitDialogStateProps = {
	open: false,
	pkg: null,
	type: null,
	isSubmitting: null,
	isMinimized: null,
	hasPendingChanges: null
};

export default createReducer<GlobalState['dialogs']['publishingPackageResubmit']>(initialState, (builder) => {
	builder
		.addCase(showPublishingPackageResubmitDialog, (state, { payload }) => ({
			...state,
			onClose: closePublishingPackageResubmitDialog(),
			onClosed: publishingPackageResubmitDialogClosed(),
			...(payload as Partial<PublishingPackageResubmitDialogStateProps>),
			open: true
		}))
		.addCase(updatePublishingPackageResubmitDialog, (state, { payload }) => ({
			...state,
			...(payload as Partial<PublishingPackageResubmitDialogStateProps>)
		}))
		.addCase(closePublishingPackageResubmitDialog, (state) => ({ ...state, open: false }))
		.addCase(publishingPackageResubmitDialogClosed, () => initialState);
});
