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

import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import React, { useId } from 'react';
import FormsEngineField from '../../../FormsEngine/components/FormsEngineField';
import { ControlProps } from '../../../FormsEngine/types';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import IconButton from '@mui/material/IconButton';
import { useDispatch } from 'react-redux';
import {
	closePathSelectionDialog,
	pathSelectionDialogClosed,
	showPathSelectionDialog
} from '../../../../state/actions/dialogs';
import { batchActions, dispatchDOMEvent } from '../../../../state/actions/misc';
import { createCustomDocumentEventListener } from '../../../../utils/dom';

export interface ContentPathInputProps extends ControlProps {
	value: string;
}

export function ContentPathInput(props: ContentPathInputProps) {
	const { field, value, setValue, readonly, autoFocus } = props;
	const dispatch = useDispatch();
	const htmlId = useId();
	const maxLength = field.validations.maxLength?.value;
	// @ts-expect-error 'root' does not exist in type Partial<ContentTypeFieldValidations>
	const rootPath = field.validations.root;

	const handleChange: OutlinedInputProps['onChange'] = (e) => setValue(e.currentTarget.value);

	const checkForMacros = (value: string) => {
		const isMacro = value.indexOf('{');
		if (isMacro !== -1) {
			value = value.substring(0, isMacro);
			value = value.endsWith('/') ? value.substring(0, value.length - 1) : value;
		}
		return value;
	};

	const onOpenPathSelectionDialog = () => {
		const callbackId = 'pathSelectionDialogCallback';
		const callbackAccept = 'accept';
		dispatch(
			showPathSelectionDialog({
				rootPath,
				allowSwitchingRootPath: false,
				initialPath: value ? checkForMacros(value) : rootPath,
				onClosed: batchActions([dispatchDOMEvent({ id: callbackId, action: 'close' }), pathSelectionDialogClosed()]),
				onOk: batchActions([dispatchDOMEvent({ id: callbackId, action: callbackAccept }), closePathSelectionDialog()])
			})
		);

		createCustomDocumentEventListener(callbackId, (detail) => {
			if (detail.action === callbackAccept) {
				const path = detail.path;
				setValue(path);
			}
		});
	};

	return (
		<FormsEngineField htmlFor={htmlId} field={field} max={maxLength} length={value.length}>
			<OutlinedInput
				autoFocus={autoFocus}
				id={htmlId}
				fullWidth
				inputProps={{ maxLength }}
				value={value}
				onChange={handleChange}
				disabled={readonly}
				endAdornment={
					<IconButton
						aria-label="Maximize"
						onClick={() => onOpenPathSelectionDialog()}
						children={<SearchRoundedIcon />}
					/>
				}
			/>
		</FormsEngineField>
	);
}

export default ContentPathInput;
