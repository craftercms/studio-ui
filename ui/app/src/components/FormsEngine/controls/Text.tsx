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
import React, { useEffect, useId, useMemo, useState } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import { escapeXml, unescapeXml } from '../../../utils/xml';
import { isFieldRequired } from '../lib/validators';
import { nnou, nou } from '../../../utils/object';

export interface TextProps extends ControlProps {
	value: string;
}

export function Text(props: TextProps) {
	const { field, value, setValue, readonly: formReadonly, autoFocus } = props;
	const htmlId = useId();

	// region field properties/validations
	const maxLength = field.validations?.maxLength?.value;
	const readonly = formReadonly || (field.properties?.readonly?.value as boolean);
	const pattern = field.validations?.pattern?.value as string;
	// endregion
	const isRequired = isFieldRequired(field);
	const [patternError, setPatternError] = useState(false);

	useEffect(() => {
		const compiledPattern = getCompiledPattern(pattern);
		let isInError = false;
		if (isRequired && !value) {
			isInError = true;
		} else if (compiledPattern) {
			isInError = Boolean(value) && !compiledPattern.test(value);
		}
		setPatternError(isInError);
	}, [value, pattern, isRequired]);

	const handleChange: OutlinedInputProps['onChange'] = (e) => setValue(e.currentTarget.value);
	return (
		<FormsEngineField htmlFor={htmlId} field={field} max={maxLength} length={value.length}>
			<OutlinedInput
				autoFocus={autoFocus}
				id={htmlId}
				fullWidth
				error={patternError}
				inputProps={{
					maxLength,
					pattern
				}}
				value={value}
				onChange={handleChange}
				disabled={readonly}
			/>
		</FormsEngineField>
	);
}

/**
 * Compiles a string pattern into a regular expression.
 * If the pattern is empty or invalid, it returns `null` instead of throwing an error.
 *
 * @param pattern {string} - The string pattern to compile into a regular expression.
 * @returns {RegExp | null} - The compiled `RegExp` object, or `null` if the pattern is empty or invalid.
 */
function getCompiledPattern(pattern: string) {
	if (!pattern) return null;
	try {
		return new RegExp(`^(?:${pattern})$`);
	} catch {
		return null; // ignore invalid pattern strings
	}
}

export default Text;
