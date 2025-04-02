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

import React, { useId, useState } from 'react';
import Box from '@mui/material/Box';
import { ControlProps } from '../../../FormsEngine/types';
import FormsEngineField from '../../../FormsEngine/components/FormsEngineField';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import Tooltip from '@mui/material/Tooltip';

export interface NumberProps extends ControlProps {
	value: string;
}

export function Numeric(props: NumberProps) {
	const { field, setValue } = props;
	const htmlId = useId();
	const maxLength = field.validations.maxLength?.value;
	const value = props.value ? JSON.parse(props.value) : { exact: '', min: '', max: '' };
	const minValue = value ? parseInt(value.min) : 0;
	const maxValue = value ? parseInt(value.max) : 0;
	const exactValue = value ? parseInt(value.exact) : 0;
	// Parsed value is an object like `{ exact: '', min: '50', max: '100' }` or `{ exact: '50', min: '', max: '' }`.
	// So to determine if it's a range or exact value, we check if any of the values are set.
	const [isRange, setIsRange] = useState<boolean>(Boolean(minValue));

	const handleChange: TextFieldProps['onChange'] = (event) => {
		if (isRange) {
			switch (event.currentTarget.name) {
				case 'min':
					setValue(JSON.stringify({ ...value, min: event.currentTarget.value, exact: '' }));
					break;
				case 'max':
					setValue(JSON.stringify({ ...value, max: event.currentTarget.value, exact: '' }));
					break;
			}
		} else {
			setValue(JSON.stringify({ exact: event.currentTarget.value, min: '', max: '' }));
		}
	};
	return (
		<FormsEngineField htmlFor={htmlId} field={field} max={maxLength}>
			<Box sx={{ display: 'flex', mt: 1, gap: 2 }}>
				<Tooltip title={<FormattedMessage defaultMessage="Switch mode" />}>
					<IconButton onClick={() => setIsRange(!isRange)}>
						<CompareArrowsOutlinedIcon />
					</IconButton>
				</Tooltip>
				{isRange ? (
					<>
						<TextField
							fullWidth
							value={minValue ?? ''}
							label={<FormattedMessage defaultMessage="Min" />}
							variant="outlined"
							name="min"
							type="number"
							onChange={handleChange}
						/>
						<TextField
							fullWidth
							value={maxValue ?? ''}
							label={<FormattedMessage defaultMessage="Max" />}
							variant="outlined"
							type="number"
							name="max"
							onChange={handleChange}
						/>
					</>
				) : (
					<TextField
						fullWidth
						value={exactValue ?? ''}
						id="outlined-basic"
						label={<FormattedMessage defaultMessage="Exact" />}
						variant="outlined"
						name="exact"
						type="number"
						onChange={handleChange}
					/>
				)}
			</Box>
		</FormsEngineField>
	);
}

export default Numeric;
