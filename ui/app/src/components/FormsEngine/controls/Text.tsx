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
import React, { useId, useMemo, useState } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import { escapeXml, unescapeXml } from '../../../utils/xml';
import { isFieldRequired } from '../lib/validators';
import { FormattedMessage } from 'react-intl';
import FormHelperText from '@mui/material/FormHelperText';

export interface TextProps extends ControlProps {
	value: string;
}

export function Text(props: TextProps) {
	const { field, value: valueProp, setValue, readonly: formReadonly, autoFocus } = props;
	const htmlId = useId();

	// region field properties/validations
	const maxLength = field.validations.maxLength?.value;
	const readonly = formReadonly || (field.properties.readonly?.value as boolean);
	const escapeContent = (field.properties.escapeContent?.value as boolean) ?? false;
	const pattern = field.validations.pattern?.value as string;
	const isRequired = isFieldRequired(field);
	const [patternError, setPatternError] = useState(isRequired && !valueProp);
	// endregion
	const value = useMemo(() => {
		return escapeContent ? unescapeXml(valueProp) : valueProp;
	}, [valueProp, escapeContent]);

	const handleChange: OutlinedInputProps['onChange'] = (e) => {
		let isInError = false;
		if (pattern) {
			isInError = Boolean(e.currentTarget.value) && !e.currentTarget.value.match(pattern);
		}
		if (isRequired && !e.currentTarget.value) {
			isInError = true;
		}
		setPatternError(isInError);
		setValue(escapeContent ? escapeXml(e.currentTarget.value) : e.currentTarget.value);
	};
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
			{Boolean(valueProp) && !valueProp.match(pattern) && (
				<FormHelperText error id="accountId-error">
					<FormattedMessage defaultMessage="The value entered is not allowed in this field." />
				</FormHelperText>
			)}
		</FormsEngineField>
	);
}

export default Text;
