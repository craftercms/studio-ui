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

import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import React, { useId } from 'react';
import FormsEngineField from '../../FormsEngine/components/FormsEngineField';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { popDialog, pushDialog } from '../../../state/actions/dialogStack';
import { nanoid } from 'nanoid';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { useStableFormContext } from '../../FormsEngine/lib/formsEngineContext';
import { TypeBuilderControl } from '../utils';

export interface TypeImageSelectorProps extends TypeBuilderControl {
	value: string;
}

// TODO: in legacy - there are image size restrictions, and the cropper was shown if the image was too large
/*
	WIDTHCONSTRAINS = 775;
	HEIGHTCONSTRAINS = 767;
*/

/**
 * Enables image selection through the ImageUploadDialog.
 */
export function TypeImageSelector(props: TypeImageSelectorProps) {
	const { field, value, setValue, autoFocus } = props;
	const htmlId = useId();
	const siteId = useActiveSiteId();
	const dispatch = useDispatch();
	const basePath = '/config/studio/content-types';
	const stableFormContext = useStableFormContext();
	// stableFormContext.originalValues is of type `ContentType`, and `id` is the current contentTypeId.
	const contentTypeId = stableFormContext.originalValues.id;

	const handleChange: OutlinedInputProps['onChange'] = (e) => setValue(e.currentTarget.value);

	const onDeleteImage = () => {
		setValue('');
	};

	const onUploadImage = () => {
		const id = nanoid();
		dispatch(
			pushDialog({
				id,
				component: 'craftercms.components.SingleFileUploadDialog',
				props: {
					site: siteId,
					path: `${basePath}${contentTypeId}`,
					fileTypes: ['image/*'],
					onClose: () => dispatch(popDialog({ id })),
					onUploadComplete: (result) => {
						if (result.successful.length) {
							const uploaded = result.successful[0];
							setValue(uploaded.name);
						} else if (result.failed.length) {
							// Show error notification or alert
							dispatch({
								type: 'SHOW_SYSTEM_NOTIFICATION',
								payload: {
									message: `Failed to upload image: ${result.failed[0]?.name}`,
									options: { variant: 'error' }
								}
							});
						}
						dispatch(popDialog({ id }));
					}
				}
			})
		);
	};

	return (
		<FormsEngineField htmlFor={htmlId} field={field}>
			<OutlinedInput
				autoFocus={autoFocus}
				id={htmlId}
				fullWidth
				value={value}
				onChange={handleChange}
				disabled
				endAdornment={
					<>
						{value && (
							<Tooltip title={<FormattedMessage defaultMessage="Remove image" />}>
								<IconButton onClick={() => onDeleteImage()}>
									<DeleteOutlineRoundedIcon />
								</IconButton>
							</Tooltip>
						)}
						<Tooltip title={<FormattedMessage defaultMessage="Upload Image" />}>
							<IconButton onClick={() => onUploadImage()}>
								<UploadRoundedIcon />
							</IconButton>
						</Tooltip>
					</>
				}
			/>
		</FormsEngineField>
	);
}

export default TypeImageSelector;
