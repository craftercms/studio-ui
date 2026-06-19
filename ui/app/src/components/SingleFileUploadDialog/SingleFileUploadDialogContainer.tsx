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

import React, { useCallback } from 'react';
import { SingleFileUploadDialogContainerProps } from './utils';
import DialogBody from '../DialogBody/DialogBody';
import SingleFileUploadDialogUI from './SingleFileUploadDialogUI';
import { useEnhancedDialogContext } from '../EnhancedDialog';

export function SingleFileUploadDialogContainer(props: SingleFileUploadDialogContainerProps) {
	const { onUploadComplete, onUploadStart, onUploadError, onFileAdded, ...rest } = props;
	const { updateSubmittingOrHasPendingChanges } = useEnhancedDialogContext();
	const onStart = useCallback(() => {
		onUploadStart?.();
		updateSubmittingOrHasPendingChanges({ isSubmitting: true });
	}, [onUploadStart, updateSubmittingOrHasPendingChanges]);

	const onComplete = useCallback(
		(result) => {
			updateSubmittingOrHasPendingChanges({ isSubmitting: false });
			onUploadComplete?.(result);
		},
		[onUploadComplete, updateSubmittingOrHasPendingChanges]
	);

	const onError = useCallback(
		({ file, error, response }) => {
			updateSubmittingOrHasPendingChanges({ isSubmitting: false });

			onUploadError?.({ file, error, response });
		},
		[onUploadError, updateSubmittingOrHasPendingChanges]
	);

	return (
		<DialogBody>
			<SingleFileUploadDialogUI
				onUploadComplete={onComplete}
				onUploadStart={onStart}
				onUploadError={onError}
				onFileAdded={onFileAdded}
				{...rest}
			/>
		</DialogBody>
	);
}

export default SingleFileUploadDialogContainer;
