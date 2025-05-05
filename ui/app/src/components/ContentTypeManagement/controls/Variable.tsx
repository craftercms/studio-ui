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
import React, { useEffect, useId, useState } from 'react';
import FormsEngineField from '../../FormsEngine/components/FormsEngineField';
import { ControlProps } from '../../FormsEngine/types';
import controlDescriptors from '../descriptors/controls';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage, useIntl } from 'react-intl';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { DropDownMenu } from '../../DropDownMenuButton';
import { postFixesMap, PostFixesType } from '../postFixesMap';
import { useStableFormContext } from '../../FormsEngine/lib/formsEngineContext';
import { useAtomValue } from 'jotai';
import useUpdateRefs from '../../../hooks/useUpdateRefs';

export interface VariableProps extends ControlProps {
	value: string;
}

const disabledFields = ['internal-name', 'file-name'];
const disablePostFixes = ['internal-name', 'file-name', 'disabled'];

export function Variable(props: VariableProps) {
	const { field, value, setValue, readonly, autoFocus, contentType } = props;
	const [allowAutoValue, setAllowAutoValue] = useState<boolean>(value === '');
	const htmlId = useId();
	const maxLength = field.validations.maxLength?.value;
	const controlDescriptor = contentType?.id && controlDescriptors[contentType?.id];
	const supportedPostFixes: PostFixesType[] = controlDescriptor?.supportedPostFixes;
	const { formatMessage } = useIntl();
	const disabled = readonly || disabledFields.includes(value);
	const showPostFixes = supportedPostFixes && !disablePostFixes.includes(value);
	const effectRefs = useUpdateRefs({
		value,
		setValue,
		supportedPostFixes,
		allowAutoValue,
		disabled
	});
	const {
		atoms: { valueByFieldId }
	} = useStableFormContext();
	const title = (useAtomValue(valueByFieldId['title']) as string) || '';

	useEffect(() => {
		const { setValue, supportedPostFixes, allowAutoValue, disabled } = effectRefs.current;
		// If allowAutoValue is true and the field is not disabled, set the value from the title.
		if (allowAutoValue && !disabled && title) {
			setValue(getValueFromTitle(title, supportedPostFixes));
		}
	}, [title, effectRefs]);

	const handleChange: OutlinedInputProps['onChange'] = (e) => {
		const newValue = cleanVariable(e.currentTarget.value);
		// If when manually updating the variable, the value is empty, allow auto value to be set again.
		setAllowAutoValue(newValue === '');
		setValue(newValue);
	};

	const onAddPostFix = (postFix: string) => {
		setValue(getValueWithPostFix(value, postFix, supportedPostFixes));
	};

	return (
		<FormsEngineField htmlFor={htmlId} field={field} max={maxLength} length={value?.length}>
			<OutlinedInput
				autoFocus={autoFocus}
				id={htmlId}
				fullWidth
				inputProps={{ maxLength }}
				value={value}
				onChange={handleChange}
				disabled={disabled}
				endAdornment={
					showPostFixes && (
						<Tooltip title={<FormattedMessage defaultMessage="Add/update postfix" />}>
							<DropDownMenu
								onMenuItemClick={(event, optionId) => onAddPostFix(optionId)}
								options={supportedPostFixes.map((postFix) => {
									const translation = formatMessage(postFixesMap[postFix].description);
									return {
										id: postFix,
										primaryText: postFix,
										secondaryText: translation
									};
								})}
								endIcon={null}
								sx={{
									color: (theme) => theme.palette.text.primary,
									minWidth: 'unset',
									borderRadius: '50%',
									'&:hover': {
										backgroundColor: (theme) => theme.palette.action.hover
									}
								}}
							>
								<AddCircleOutlineOutlinedIcon />
							</DropDownMenu>
						</Tooltip>
					)
				}
			/>
		</FormsEngineField>
	);
}

const cleanVariable = (value) => {
	return value.replace(/[-\s]/g, '_').replace(/[^A-Za-z0-9-_]/g, '');
};

const getValueWithPostFix = (value: string, postFix: string, supportedPostFixes: PostFixesType[]): string => {
	const currentPostFix = value.match(/_[a-z]+$/)?.[0];
	const isPostfix = currentPostFix && supportedPostFixes?.includes(currentPostFix as PostFixesType);
	return isPostfix ? value.replace(/_[a-z]+$/, `${postFix}`) : `${value}${postFix}`;
};

const getValueFromTitle = (title: string, supportedPostFixes: PostFixesType[]): string => {
	let newValue = cleanVariable(title);
	// Lowercase the first letter
	newValue = newValue.charAt(0).toLowerCase() + newValue.slice(1);
	// If there are supported post fixes and the value is not in the disablePostFixes list, add the first one.
	if (supportedPostFixes?.length && !disablePostFixes.includes(newValue)) {
		newValue = getValueWithPostFix(newValue, supportedPostFixes[0], supportedPostFixes);
	}
	return newValue;
};

export default Variable;
