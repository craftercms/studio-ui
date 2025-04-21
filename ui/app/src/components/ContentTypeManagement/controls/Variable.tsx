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
import { ControlProps } from '../../FormsEngine/types';
import controlDescriptors from '../descriptors/controls';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage, useIntl } from 'react-intl';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { DropDownMenu } from '../../DropDownMenuButton';
import { postFixesMap, PostFixesType } from '../postFixesMap';
import { useStableFormContext } from '../../FormsEngine/lib/formsEngineContext';

export interface VariableProps extends ControlProps {
	value: string;
}

export function Variable(props: VariableProps) {
	const { field, value, setValue, readonly, autoFocus, contentType } = props;
	// console.log('props', props);
	// TODO: if internalName or fileName => disabled, no postfixes
	const htmlId = useId();
	const maxLength = field.validations.maxLength?.value;
	const handleChange: OutlinedInputProps['onChange'] = (e) => setValue(e.currentTarget.value);
	const controlDescriptor = contentType?.id && controlDescriptors[contentType?.id];
	const supportedPostFixes: PostFixesType[] = controlDescriptor?.supportedPostFixes;
	const { formatMessage } = useIntl();

	const onAddPostFix = (postFix: string) => {
		const currentPostFix = value.match(/_[a-z]+$/)?.[0];
		const isPosfix = currentPostFix && supportedPostFixes?.includes(currentPostFix as PostFixesType);
		setValue(isPosfix ? value.replace(/_[a-z]+$/, `${postFix}`) : `${value}${postFix}`);
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
					supportedPostFixes && (
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

export default Variable;
