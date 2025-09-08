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

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
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
import Grid from '@mui/material/Grid';
import { nanoid } from 'nanoid';

export interface CheckboxGroupProps extends ControlProps {
	value: Array<{ key: string; value_smv: string }>;
}

// TODO: move to hook
function useWindowWidth() {
	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return width;
}

const buildOption = (
	option: KVPLoaderItem['items'][0],
	onChange: CheckboxProps['onChange'],
	checkedValuesLookup: LookupTable<boolean>,
	readonly: boolean = false
) => (
	<FormControlLabel
		key={option.key}
		control={
			<Checkbox
				disabled={readonly}
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
	const { contentType, field, value, setValue, autoFocus, readonly: formReadonly } = props;
	const [searchFieldValue, setSearchFieldValue] = useState('');
	const [keyword, setKeyword] = useState('');
	const windowWidth = useWindowWidth();

	// region field properties/validations
	const readonly = formReadonly || (field.properties.readonly?.value as boolean);
	const selectAll = (field.properties.selectAll?.value as boolean) ?? false;
	const listDirection = (field.properties.listDirection?.value as 'vertical' | 'horizontal') ?? 'vertical';
	// TODO: check in TB - minSelection not ending up in field
	// const minSelection = (field.validations.minSelection?.value as number) ?? 0;
	// endregion

	const onKeyword$ = useDebouncedInput(() => {
		setKeyword(searchFieldValue);
	});
	// TODO:
	//  - Min selection
	const options = useKVPLoader(
		useActiveSiteId(),
		// Checkbox Group supports only 1 datasource.
		useMemo(() => [field.properties.datasource?.value as string], [field.properties.datasource?.value]),
		contentType.dataSources
	)?.[0].items;
	const finalOptions = useMemo(() => {
		let finalOptions = options ? [...options] : [];
		// TODO: sort options depending on width breaking points
		const numColumns = windowWidth >= 900 ? 3 : windowWidth >= 600 ? 2 : 1;
		// const numColumns = windowWidth >= 600 ? 2 : 1;
		// console.log('numColumns', numColumns);

		if (listDirection === 'vertical') {
			switch (numColumns) {
				case 2: {
					const sortedOptions = [];
					const numRows = Math.ceil(finalOptions.length / 2);

					for (let i = 0; i < numRows; i++) {
						sortedOptions.push(finalOptions[i]);
						if (finalOptions[i + numRows]) {
							sortedOptions.push(finalOptions[i + Math.ceil(finalOptions.length / 2)]);
						}
					}
					finalOptions = sortedOptions;
					break;
				}
				case 3: {
					const sortedOptions = [];
					const numRows = Math.ceil(finalOptions.length / 3);
					for (let i = 0; i < numRows; i++) {
						sortedOptions.push(finalOptions[i]);
						if (finalOptions[i + numRows]) {
							sortedOptions.push(finalOptions[i + Math.ceil(finalOptions.length / 3)]);
						}
						console.log('finalOptions', finalOptions);
						if (finalOptions[i + Math.ceil((finalOptions.length * 2) / 3)]) {
							// console.log('this should not be added', finalOptions[i + Math.ceil((finalOptions.length * 2) / 3)]);
							// Fix for when there are 2 items in the last row, the 3rd column should not be added
							// 7 items: 1,4,6 | 2,5 | 3,7
							// 8 items: 1,4,7 | 2,5 | 3,6,8
							// 10 items: 1,4,7 | 2,5,8 | 3,6,9,10
							// 11 items: 1,4,8 | 2,5,9 | 3,6,10,11
							// if we have already added the second item in the last row and there are only 2 items in that row,
							// we should not add the third item
							// console.log('i', i);
							// console.log('finalOptions.length', finalOptions.length);
							// console.log('(finalOptions.length + 1) % 3', (finalOptions.length + 1) % 3);
							// console.log('finalOptions[i + Math.ceil((finalOptions.length * 2) / 3)]', finalOptions[i + Math.ceil((finalOptions.length * 2) / 3)]);
							if (i === 0 && finalOptions.length % numRows === 0) {
								// console.log('this should not be added', finalOptions[i + Math.ceil((finalOptions.length * 2) / 3)]);
								sortedOptions.push({ key: nanoid() });
							} else {
								sortedOptions.push(finalOptions[i + Math.ceil((finalOptions.length * 2) / 3)]);
							}
						}
					}
					finalOptions = sortedOptions;
					break;
				}
				default:
					break; // 1 column, no need to sort
			}
		}
		if (!keyword.trim()) {
			return finalOptions;
		}
		const lowerKeyword = keyword.toLowerCase();
		return finalOptions?.filter(
			(option) => option.value.toLowerCase().includes(lowerKeyword) || option.key.includes(lowerKeyword)
		);
	}, [options, keyword, windowWidth, listDirection]);
	const checkedValuesLookup = useMemo(() => {
		return value.reduce((acc, item) => {
			acc[item.key] = true;
			return acc;
		}, {});
	}, [value]);
	if (!finalOptions) {
		return <div>Loading...</div>;
	}
	const showFilter = options?.length > 20;
	const isVirtualized = finalOptions.length > 100;
	const virtualRows = Math.ceil(finalOptions.length / 2);
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const key = e.target.value;
		const checked = e.target.checked;
		if (checked) {
			setValue([...value, { key, value_smv: options.find((option) => option.key === key)?.value }]);
		} else {
			setValue(value.filter((item) => item.key !== key));
		}
	};

	const checkAll = () => {
		if (value.length === finalOptions.length) {
			setValue([]);
		} else {
			setValue(finalOptions.map((option) => ({ key: option.key, value_smv: option.value })));
		}
	};

	return (
		<FormsEngineField field={field} autoFocus={!showFilter && autoFocus}>
			{showFilter && (
				<SearchBar
					disabled={readonly}
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
			{selectAll && (
				<FormControlLabel
					sx={{ mb: 1 }}
					control={
						<Checkbox
							disabled={readonly}
							color="info"
							indeterminate={value.length > 0 && value.length < finalOptions.length}
							checked={value.length === finalOptions.length}
							onChange={checkAll}
						/>
					}
					label="Select All"
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
					<Grid container spacing={2} sx={{ width: '100%' }}>
						{finalOptions?.map((option) => (
							<Grid size={{ xs: 12, sm: 6, md: 4 }} key={option.key}>
								{option.value ? (
									buildOption(option, handleChange, checkedValuesLookup, readonly)
								) : (
									// to keep the grid structure
									<></>
								)}
							</Grid>
						))}
					</Grid>
				)}
			</FormGroup>
		</FormsEngineField>
	);
}

export default CheckboxGroup;
