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
import { applyContentNameRules } from '../../../utils/content';
import { FormsEngineField } from '../components/FormsEngineField';
import InputAdornment from '@mui/material/InputAdornment';
import { ControlProps } from '../types';
import { useItemMetaContext, useStableFormContext } from '../lib/formsEngineContext';
import { useAtom, useAtomValue } from 'jotai';
import { PrimitiveAtom } from 'jotai/index';

export interface SlugProps extends ControlProps {
	value: string;
}

// TODO: Check behaviour for embedded components. Seems to be hidden on current engine.

export function Slug(props: SlugProps) {
	const { field, readonly, autoFocus } = props;
	const { atoms } = useStableFormContext();
	const { pathInSite } = useItemMetaContext();
	const htmlId = useId();
	if (field.id === 'fileName') {
		throw new Error('Detected field ID "fileName" instead "file-name" at the "Slug" Control.');
	}
	// It'd be better to avoid this. A specific control should refer to a specific field ID/property all the time.
	const fieldId = field.id === 'file-name' ? 'folder-name' : field.id;
	const [value, setValue] = useAtom(atoms.valueByFieldId[fieldId] as PrimitiveAtom<string>);
	const validityState = useAtomValue(atoms.validationByFieldId[fieldId]);
	const handleChange: OutlinedInputProps['onChange'] = (e) => setValue(applyContentNameRules(e.currentTarget.value));
	const webUrlRoot = pathInSite.replace('/site/website', '/');
	return (
		<FormsEngineField
			isValid={validityState.isValid}
			htmlFor={htmlId}
			field={field}
			min={field.validations.minValue?.value}
			max={field.validations.maxLength?.value}
			length={value.length}
		>
			<OutlinedInput
				autoFocus={autoFocus}
				fullWidth
				id={htmlId}
				value={value}
				onChange={handleChange}
				disabled={readonly}
				startAdornment={
					<InputAdornment position="start" title={webUrlRoot} sx={{ mr: 0 }}>
						{webUrlRoot}
					</InputAdornment>
				}
			/>
		</FormsEngineField>
	);
}

export default Slug;
