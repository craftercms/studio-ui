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

import OutlinedInput from '@mui/material/OutlinedInput';
import React, { useId } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';

export interface TextareaProps extends ControlProps {
	value: string;
}

export function Textarea(props: TextareaProps) {
	const { field, value, setValue, readonly, autoFocus } = props;
	const htmlId = useId();
	const maxLength = field.validations.maxLength?.value;
	return (
		<FormsEngineField htmlFor={htmlId} field={field} max={maxLength} length={value.length}>
			<OutlinedInput
				autoFocus={autoFocus}
				fullWidth
				multiline
				inputProps={{ maxLength }}
				id={htmlId}
				value={value}
				onChange={(e) => setValue(e.currentTarget.value)}
				disabled={readonly}
			/>
		</FormsEngineField>
	);
}

export default Textarea;
