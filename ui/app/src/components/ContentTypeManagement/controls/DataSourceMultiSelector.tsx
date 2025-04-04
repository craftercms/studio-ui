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

import React, { useId, useMemo } from 'react';
import { ControlProps } from '../../FormsEngine/types';
import FormsEngineField from '../../FormsEngine/components/FormsEngineField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';

export interface DataSourceMultiSelectorProps extends ControlProps {
	value: string;
}

/**
 * Allows the selection of multiple data sources that are compatible with the field type, using a checkbox group layout.
 */
export function DataSourceMultiSelector(props: DataSourceMultiSelectorProps) {
	const { field, value, setValue, contentType } = props;
	const selectedDataSources = value?.split(',') ?? [];
	const htmlId = useId();
	// @ts-expect-error 'type' does not exist on type Partial<ContentTypeFieldValidations>
	const type = field.validations.type;
	const filteredDataSources = useMemo(() => {
		return (contentType.dataSources ?? []).filter((ds) => ds.interface === type);
	}, [contentType?.dataSources, type]);

	const handleChange: CheckboxProps['onChange'] = (e) => {
		const newSelected = selectedDataSources;

		if (e.target.checked) {
			newSelected.push(e.target.name);
		} else {
			newSelected.splice(newSelected.indexOf(e.target.name), 1);
		}

		setValue(newSelected.join(','));
	};
	return (
		<FormsEngineField htmlFor={htmlId} field={field}>
			<FormControl variant="standard">
				{filteredDataSources.map((ds) => (
					<FormControlLabel
						key={ds.id}
						control={<Checkbox name={ds.id} checked={selectedDataSources.includes(ds.id)} onChange={handleChange} />}
						label={ds.title}
					/>
				))}
			</FormControl>
		</FormsEngineField>
	);
}

export default DataSourceMultiSelector;
