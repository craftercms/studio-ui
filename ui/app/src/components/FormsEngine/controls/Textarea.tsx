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
import React, { useEffect, useId, useMemo } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import { escapeXml, unescapeXml } from '../../../utils/xml';

export interface TextareaProps extends ControlProps {
	value: string;
}

export function Textarea(props: TextareaProps) {
	const { field, value: valueProp, setValue, readonly: formReadonly, autoFocus } = props;
	const htmlId = useId();

	// region field properties/validations
	const maxLength = field.validations?.maxLength?.value;
	const readonly = formReadonly || (field.properties?.readonly?.value as boolean);
	const escapeContent = (field.properties?.escapeContent?.value as boolean) ?? false;
	const rows = (field.properties?.rows?.value as number) ?? 1;
	const defaultValue = field.defaultValue as string;
	// endregion

	const value = useMemo(() => {
		return valueProp ? (escapeContent ? unescapeXml(valueProp) : valueProp) : (defaultValue ?? '');
	}, [valueProp, escapeContent, defaultValue]);

	useEffect(() => {
		// If there's a default value and no value has been set yet, set it as the value.
		if (defaultValue && !valueProp) {
			setValue(defaultValue);
		}
	}, [defaultValue, setValue, valueProp]);

	const handleChange: OutlinedInputProps['onChange'] = (e) => {
		setValue(escapeContent ? escapeXml(e.currentTarget.value) : e.currentTarget.value);
	};

	return (
		<FormsEngineField htmlFor={htmlId} field={field} max={maxLength} length={value.length}>
			<OutlinedInput
				autoFocus={autoFocus}
				fullWidth
				multiline
				rows={rows}
				inputProps={{ maxLength }}
				id={htmlId}
				value={value}
				onChange={handleChange}
				disabled={readonly}
			/>
		</FormsEngineField>
	);
}

export default Textarea;
