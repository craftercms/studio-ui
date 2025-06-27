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

import React, { ChangeEvent, useMemo, useState } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel, { formControlLabelClasses } from '@mui/material/FormControlLabel';
import LookupTable from '../../../models/LookupTable';
import { KVPLoaderItem, useKVPLoader } from '../dataSourceHooks/useKVPLoader';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { useTheme } from '@mui/material/styles';
import { typographyClasses } from '@mui/material/Typography';
import { SearchBar } from '../../SearchBar';
import useDebouncedInput from '../../../hooks/useDebouncedInput';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

export interface CheckboxGroupProps extends ControlProps {
	value: Array<{ key: string; value_smv: string }>;
}

const buildOption = (
	option: KVPLoaderItem['items'][0],
	onChange: CheckboxProps['onChange'],
	checkedValuesLookup: LookupTable<boolean>
) => (
	<FormControlLabel
		key={option.key}
		control={
			<Checkbox
				color="info"
				checked={checkedValuesLookup[option.key] ?? false}
				onChange={onChange}
				value={option.key}
			/>
		}
		label={option.value}
	/>
);

const VirtualRow = (
	props: ListChildComponentProps<{
		options: KVPLoaderItem['items'];
		onChange: CheckboxProps['onChange'];
		checkedValuesLookup: LookupTable<boolean>;
	}>
) => {
	const {
		index,
		style,
		data: { options, onChange, checkedValuesLookup }
	} = props;
	const adjustedIndex = index * 3;
	return (
		<div className="checkbox-group-virtual-row" style={style}>
			{options
				.slice(adjustedIndex, adjustedIndex + 3)
				.map((option) => buildOption(option, onChange, checkedValuesLookup))}
		</div>
	);
};

export function CheckboxGroup(props: CheckboxGroupProps) {
	const theme = useTheme();
	const { contentType, field, value, setValue, autoFocus } = props;
	const [searchFieldValue, setSearchFieldValue] = useState('');
	const [keyword, setKeyword] = useState('');
	const onKeyword$ = useDebouncedInput(() => {
		setKeyword(searchFieldValue);
	});
	// TODO:
	//  - Show select all
	//  - List Direction
	//  - Min selection
	const options = useKVPLoader(
		useActiveSiteId(),
		// Checkbox Group supports only 1 datasource.
		useMemo(() => [field.properties.datasource?.value as string], [field.properties.datasource?.value]),
		contentType.dataSources
	)?.[0].items;
	const finalOptions = useMemo(() => {
		if (!keyword.trim()) {
			return options;
		}
		const lowerKeyword = keyword.toLowerCase();
		return options?.filter(
			(option) => option.value.toLowerCase().includes(lowerKeyword) || option.key.includes(lowerKeyword)
		);
	}, [options, keyword]);
	const checkedValuesLookup = useMemo(() => {
		return value.reduce((acc, item) => {
			acc[item.key] = true;
			return acc;
		}, {});
	}, [value]);
	if (!finalOptions) {
		return <div>Loading...</div>;
	}
	const showFilter = options.length > 20;
	const isVirtualized = finalOptions.length > 100;
	const virtualRows = Math.ceil(finalOptions.length / 3);
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const key = e.target.value;
		const checked = e.target.checked;
		if (checked) {
			setValue([...value, { key, value_smv: options.find((option) => option.key === key)?.value }]);
		} else {
			setValue(value.filter((item) => item.key !== key));
		}
	};
	return (
		<FormsEngineField field={field} autoFocus={!showFilter && autoFocus}>
			{showFilter && (
				<SearchBar
					sx={{ mb: 1 }}
					autoFocus={autoFocus}
					showActionButton={searchFieldValue !== ''}
					keyword={searchFieldValue}
					onChange={(value) => {
						setSearchFieldValue(value);
						onKeyword$.next(value);
					}}
				/>
			)}
			<FormGroup
				sx={{
					p: 1,
					gap: 1,
					maxHeight: isVirtualized ? undefined : 350,
					overflow: 'auto',
					flexWrap: 'wrap',
					flexDirection: 'row',
					borderWidth: 1,
					borderRadius: 1,
					borderStyle: 'solid',
					borderColor: 'divider',
					[`.${formControlLabelClasses.root}`]: {
						height: isVirtualized ? '50px' : undefined,
						flexBasis: `calc(32.5% - ${theme.spacing(1)})`,
						[`.${typographyClasses.root}`]: {
							display: '-webkit-box',
							WebkitLineClamp: '2',
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							whiteSpace: 'normal'
						}
					},
					'.checkbox-group-virtual-list': {},
					'.checkbox-group-virtual-row': { display: 'flex' }
				}}
			>
				{isVirtualized ? (
					<FixedSizeList
						height={350}
						itemSize={50}
						itemCount={virtualRows}
						layout="vertical"
						children={VirtualRow}
						width="100%"
						className="checkbox-group-virtual-list"
						itemData={{ options: finalOptions, onChange: handleChange, checkedValuesLookup }}
					/>
				) : (
					finalOptions?.map((option) => buildOption(option, handleChange, checkedValuesLookup))
				)}
			</FormGroup>
		</FormsEngineField>
	);
}

export default CheckboxGroup;
