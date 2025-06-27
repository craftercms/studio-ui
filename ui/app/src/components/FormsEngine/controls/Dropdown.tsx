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

import React, { useMemo } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useContentTypes from '../../../hooks/useContentTypes';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import useUpdateRefs from '../../../hooks/useUpdateRefs';
import ListSubheader from '@mui/material/ListSubheader';
import Skeleton from '@mui/material/Skeleton';
import { useKVPLoader } from '../dataSourceHooks/useKVPLoader';

export interface DropdownProps extends ControlProps {
	value: string;
}

export function Dropdown(props: DropdownProps) {
	const { field, contentType, value, setValue, readonly, autoFocus } = props;
	const contentTypes = useContentTypes();
	const effectRefs = useUpdateRefs({ contentTypes });
	const maxLength = field.validations.maxLength?.value;
	const handleChange = (event: SelectChangeEvent) => setValue(event.target.value);
	const optionGroups = useKVPLoader(
		useActiveSiteId(),
		useMemo(() => (field.properties.datasource.value as string).split(','), [field.properties.datasource?.value]),
		effectRefs.current.contentTypes[contentType.id].dataSources
	);
	if (!optionGroups) {
		return (
			<FormsEngineField field={field} max={maxLength} length={value.length}>
				<Skeleton variant="rounded" height={56} />
			</FormsEngineField>
		);
	}
	// TODO: Add argument typing
	const renderGroup = (group) =>
		group.items.map((option, index) => (
			<MenuItem key={`${group.id}_${index}`} value={option.key}>
				{option.value}
			</MenuItem>
		));
	return (
		<FormsEngineField field={field} max={maxLength} length={value.length}>
			<Select value={value} label="" onChange={handleChange} disabled={readonly} autoFocus={autoFocus}>
				{optionGroups.length > 1
					? optionGroups.map((group) => [
							<ListSubheader key={group.id}>{group.label}</ListSubheader>,
							renderGroup(group)
						])
					: renderGroup(optionGroups[0])}
			</Select>
		</FormsEngineField>
	);
}

export default Dropdown;
