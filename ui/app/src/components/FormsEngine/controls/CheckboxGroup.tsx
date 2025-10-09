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

import React, { ChangeEvent, useId, useMemo, useState } from 'react';
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
import { FormattedMessage } from 'react-intl';
import { useWindowWidth } from '../../../hooks/useWindowWidth';

export interface CheckboxGroupProps extends ControlProps {
	value: Array<{ key: string; value_smv: string }>;
}

export function CheckboxGroup(props: CheckboxGroupProps) {
	const htmlId = useId();
	const theme = useTheme();
	const { contentType, field, value, setValue, autoFocus, readonly: formReadonly } = props;
	const [searchFieldValue, setSearchFieldValue] = useState('');
	const [keyword, setKeyword] = useState('');
	const windowWidth = useWindowWidth();
	const numColumns = windowWidth >= 1200 ? 3 : windowWidth >= 900 ? 2 : 1;

	// region field properties/validations
	const readonly = formReadonly || Boolean(field.properties?.readonly?.value as boolean);
	const selectAll = Boolean(field.properties?.selectAll?.value as boolean);
	const listDirection: 'horizontal' | 'vertical' = useMemo(() => {
		let listDirection: 'horizontal' | 'vertical' = 'horizontal';
		let directionArray: Array<{ value: string; selected?: boolean }> = [];
		try {
			const raw = field.properties?.listDirection?.value as string;
			const parsed = raw ? JSON.parse(raw) : [];
			directionArray = Array.isArray(parsed) ? parsed : [];
		} catch {
			directionArray = [];
		}
		const verticalValue = Boolean(directionArray.find((item) => item.value === 'vertical')?.selected);
		if (verticalValue) listDirection = 'vertical';
		return listDirection;
	}, [field.properties?.listDirection]);
	// endregion

	const onKeyword$ = useDebouncedInput(() => {
		setKeyword(searchFieldValue);
	});
	const options = useKVPLoader(
		useActiveSiteId(),
		// Checkbox Group supports only 1 datasource.
		useMemo(() => [field.properties.datasource?.value as string], [field.properties.datasource?.value]),
		contentType.dataSources
	)?.[0].items;
	const finalOptions = useMemo(() => {
		let finalOptions = options ? [...options] : [];
		// If the list direction is vertical, we need to reorder the options to be top-down instead of left-right
		// The logic is different depending on the number of columns (2 or 3).
		if (listDirection === 'vertical') {
			switch (numColumns) {
				case 2: {
					// When there are two columns, we need to reorder the options to be top-down instead of left-right
					// So we need to take the first half and interleave it with the second half.
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
					// When there are three columns, we need to reorder the options to be top-down instead of left-right
					// So we need to take the first third, interleave it with the second third, and then the last third.
					const sortedOptions = [];
					const numRows = Math.ceil(finalOptions.length / 3);
					for (let i = 0; i < numRows; i++) {
						sortedOptions.push(finalOptions[i]);
						if (finalOptions[i + numRows]) {
							sortedOptions.push(finalOptions[i + Math.ceil(finalOptions.length / 3)]);
						}
						if (finalOptions[i + Math.ceil((finalOptions.length * 2) / 3)]) {
							// There's a scenario where the last column is empty, that happens when the number of items is
							// a multiple of the number of rows, in that case, we add an empty item to keep the grid structure.
							if (i === 0 && finalOptions.length % numRows === 0) {
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
		return finalOptions?.filter((option) => {
			const label = typeof option.value === 'string' ? option.value.toLowerCase() : '';
			return label.includes(lowerKeyword) || option.key?.includes(lowerKeyword);
		});
	}, [options, keyword, listDirection, numColumns]);
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
	const virtualRows = Math.ceil(finalOptions.length / numColumns);
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
					label={<FormattedMessage defaultMessage="Select All" />}
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
						itemData={{ options: finalOptions, onChange: handleChange, checkedValuesLookup, numColumns, readonly }}
					/>
				) : (
					<Grid container spacing={2} sx={{ width: '100%' }}>
						{finalOptions?.map((option) => (
							<Grid size={{ sm: 12, md: 6, lg: 4 }} key={option.key}>
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

const buildOption = (
	option: KVPLoaderItem['items'][0],
	onChange: CheckboxProps['onChange'],
	checkedValuesLookup: LookupTable<boolean>,
	readonly: boolean = false
) => (
	<FormControlLabel
		key={option.key}
		sx={{ width: '50%' }}
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
		numColumns: number;
		readonly: boolean;
	}>
) => {
	const {
		index,
		style,
		data: { options, onChange, checkedValuesLookup, numColumns, readonly }
	} = props;
	const adjustedIndex = index * numColumns;
	return (
		<Grid container className="checkbox-group-virtual-row" spacing={2} sx={{ width: '100%' }} style={style}>
			{options.slice(adjustedIndex, adjustedIndex + numColumns).map((option) => (
				<Grid size={{ sm: 12, md: 6, lg: 4 }} key={option.key}>
					{option.value ? (
						buildOption(option, onChange, checkedValuesLookup, readonly)
					) : (
						// to keep the grid structure
						<></>
					)}
				</Grid>
			))}
		</Grid>
	);
};

export default CheckboxGroup;
