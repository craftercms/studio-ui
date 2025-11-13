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

import React, { useMemo } from 'react';
import FormsEngineField from '../../FormsEngine/components/FormsEngineField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import { TypeBuilderControl } from '../utils';
import { EmptyState } from '../../EmptyState';

export interface DataSourceMultiSelectorProps extends TypeBuilderControl {
	value: string[];
}

/**
 * Allows the selection of multiple data sources that are compatible with the field type, using a checkbox group layout.
 */
export function DataSourceMultiSelector(props: DataSourceMultiSelectorProps) {
	const { field, value: selectedDataSources, setValue, contentType } = props;
	const type = field.validations?.type?.value ?? '';
	const filteredDataSources = useMemo(() => {
		return (contentType.dataSources ?? []).filter((ds) => ds.interface === type);
	}, [contentType?.dataSources, type]);

	const handleChange: CheckboxProps['onChange'] = (e) => {
		// There may be outdated data sources in the current set value, so we filter to only include those that are still valid
		const newSelected = [
			...(selectedDataSources.filter((dataSourceId) => filteredDataSources.some((ds) => ds.id === dataSourceId)) || [])
		];

		if (e.target.checked) {
			newSelected.push(e.target.name);
		} else {
			const index = newSelected.indexOf(e.target.name);
			if (index !== -1) {
				newSelected.splice(index, 1);
			}
		}

		setValue(newSelected);
	};
	return (
		<FormsEngineField field={field}>
			<FormControl variant="standard">
				{filteredDataSources.length ? (
					filteredDataSources.map((ds) => (
						<FormControlLabel
							key={ds.id}
							control={<Checkbox name={ds.id} checked={selectedDataSources.includes(ds.id)} onChange={handleChange} />}
							label={ds.title}
						/>
					))
				) : (
					<EmptyState title="No Data Sources available" sxs={{ image: { display: 'none' } }} />
				)}
			</FormControl>
		</FormsEngineField>
	);
}

export default DataSourceMultiSelector;
