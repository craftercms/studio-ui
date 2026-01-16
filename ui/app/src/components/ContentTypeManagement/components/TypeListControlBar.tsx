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

import ContentTypesFilter, { ContentTypesFilterProps, ObjectTypeOption } from '../../ContentTypeFilter';
import React, { ReactNode, Ref } from 'react';
import Paper from '@mui/material/Paper';
import { SearchBar, SearchBarProps } from '../../SearchBar';
import { isEmpty } from '../../../utils/string';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { FormattedMessage } from 'react-intl';
import { BoxProps } from '@mui/material/Box';
import { consolidateSx } from '../../../utils/system';
import { type SelectProps } from '@mui/material/Select';
import Button from '@mui/material/Button';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

export interface TypeListControlBarProps {
	compact: boolean;
	onCompactChange(value: boolean): void;
	keywords: string;
	onKeywordsChange(value: string): void;
	objectTypeFilter: ObjectTypeOption;
	onObjectTypeFilterChange(value: ObjectTypeOption): void;
	sortOrder?: 'descending' | 'ascending';
	onToggleSortOrder?(): void;
	groupTypes: boolean;
	onGroupTypesChange(value: boolean): void;
	searchInputRef?: Ref<HTMLInputElement>;
	leftChildren?: ReactNode;
	slotProps?: Partial<{
		paper: Partial<BoxProps>;
		searchBar: Partial<SearchBarProps>;
		contentTypesFilter: Partial<ContentTypesFilterProps>;
	}>;
}

const dividerSx: BoxProps['sx'] = { my: -1, mx: 2 };

export function TypeListControlBar(props: TypeListControlBarProps) {
	const {
		compact,
		keywords,
		objectTypeFilter,
		onKeywordsChange,
		onObjectTypeFilterChange,
		sortOrder,
		onToggleSortOrder,
		onCompactChange,
		searchInputRef,
		leftChildren,
		slotProps,
		groupTypes,
		onGroupTypesChange
	} = props;

	return (
		<Paper {...slotProps} sx={consolidateSx({ p: 1, mb: 2, display: 'flex' }, slotProps?.paper?.sx)}>
			{leftChildren && (
				<>
					{leftChildren}
					<Divider orientation="vertical" flexItem sx={dividerSx} />
				</>
			)}
			<SearchBar
				keyword={keywords}
				onChange={(value) => onKeywordsChange(value)}
				showActionButton={!isEmpty(keywords)}
				inputRef={searchInputRef}
				sxs={{
					root: {
						background: 'none !important',
						border: 'none !important',
						borderRadius: 0,
						boxShadow: 'none',
						flexGrow: 1,
						...slotProps?.searchBar?.sxs?.root
					},
					inputInput: { padding: '8px 5px', ...slotProps?.searchBar?.sxs?.inputInput }
				}}
			/>
			<Divider orientation="vertical" flexItem sx={dividerSx} />
			<ContentTypesFilter
				variant="standard"
				{...(slotProps?.contentTypesFilter as Omit<SelectProps, 'variant' | 'ref'>)}
				value={objectTypeFilter}
				onChange={(event) => onObjectTypeFilterChange(event.target.value as ObjectTypeOption)}
				sx={consolidateSx(
					{
						mr: 2,
						background: 'transparent',
						'&::before': { borderBottom: 'none' }
					},
					slotProps?.contentTypesFilter?.sx
				)}
			/>
			<FormControlLabel
				control={<Switch checked={groupTypes} onChange={(e, checked) => onGroupTypesChange(checked)} />}
				label={<FormattedMessage defaultMessage="Group Types" />}
				slotProps={{ typography: { variant: 'body2' } }}
			/>
			<FormControlLabel
				control={<Switch checked={compact} onChange={(e, checked) => onCompactChange(checked)} />}
				label={<FormattedMessage defaultMessage="Compact" />}
				slotProps={{ typography: { variant: 'body2' } }}
			/>
			{onToggleSortOrder && (
				<Button
					variant="text"
					endIcon={
						sortOrder === 'ascending' ? (
							<ArrowUpwardRoundedIcon color="primary" />
						) : (
							<ArrowDownwardRoundedIcon color="primary" />
						)
					}
					onClick={onToggleSortOrder}
					sx={{
						color: 'text.primary',
						fontWeight: 'normal',
						fontSize: (theme) => theme.typography.fontSize
					}}
				>
					<FormattedMessage defaultMessage="Sort" />
				</Button>
			)}
		</Paper>
	);
}

export default TypeListControlBar;
