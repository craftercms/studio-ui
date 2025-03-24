/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { forwardRef } from 'react';
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl';
import Select, { SelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SystemType from '../../models/SystemType';

export type ContentTypesFilterProps = SelectProps;

export type ObjectTypeOption = 'all' | Extract<SystemType, 'page' | 'component'>;

const options: Record<ObjectTypeOption, MessageDescriptor> = defineMessages({
	all: {
		id: 'newContentDialog.contentTypeAllLabel',
		defaultMessage: 'Show all types'
	},
	page: {
		id: 'newContentDialog.contentTypePageLabel',
		defaultMessage: 'Pages only'
	},
	component: {
		id: 'newContentDialog.contentTypeComponentLabel',
		defaultMessage: 'Components only'
	}
});

const translationsArray = Object.entries(options);

export const ContentTypesFilter = forwardRef<HTMLDivElement, ContentTypesFilterProps>((props, ref) => {
	const { formatMessage } = useIntl();
	return (
		<Select {...props} ref={ref}>
			{translationsArray.map((option) => (
				<MenuItem key={option[0]} value={option[0]}>
					{formatMessage(option[1])}
				</MenuItem>
			))}
		</Select>
	);
});

export default ContentTypesFilter;
