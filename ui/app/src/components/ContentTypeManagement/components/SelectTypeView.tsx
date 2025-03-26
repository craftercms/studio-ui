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

import { TypeListControlBar, TypeListControlBarProps } from './TypeListControlBar';
import TypeList, { TypeListProps } from './TypeList';
import Box, { BoxProps } from '@mui/material/Box';
import React, { useEffect, useState } from 'react';
import type { ObjectTypeOption } from '../../ContentTypeFilter';
import useDebouncedInput from '../../../hooks/useDebouncedInput';
import { filterTypesByKeywordsAndObjectType } from '../../../utils/contentType';
import useUpdateRefs from '../../../hooks/useUpdateRefs';
import ContentType from '../../../models/ContentType';
import { consolidateSx } from '../../../utils/system';

export interface SelectContentTypeProps {
	sx?: BoxProps['sx'];
	initialCompact?: boolean;
	initialObjectTypeFilter?: ObjectTypeOption;
	contentTypesList: ContentType[];
	slotProps?: Partial<{
		box: Partial<BoxProps>;
		bar: Partial<TypeListControlBarProps>;
		listing: Partial<TypeListProps>;
	}>;
}

export function SelectTypeView(props: SelectContentTypeProps) {
	const { slotProps, contentTypesList, initialCompact = false, initialObjectTypeFilter = 'all', sx } = props;
	const [compact, setCompact] = useState(initialCompact); // TODO: Add preference storage. Note this is used in several places, not just type builder.
	const [keywords, setKeywords] = useState('');
	const [filteredTypes, setFilteredTypes] = useState<ContentType[]>();
	const [objectTypeFilter, setObjectTypeFilter] = useState<ObjectTypeOption>(initialObjectTypeFilter);
	const onKeyword$ = useDebouncedInput((keywords) => {
		setFilteredTypes(filterTypesByKeywordsAndObjectType(contentTypesList, keywords, objectTypeFilter));
	});

	const effectRefs = useUpdateRefs({ keywords, filterTypes: filterTypesByKeywordsAndObjectType });
	useEffect(() => {
		setFilteredTypes(
			filterTypesByKeywordsAndObjectType(contentTypesList, effectRefs.current.keywords, objectTypeFilter)
		);
	}, [contentTypesList, objectTypeFilter, effectRefs]);

	const handleKeywordsChange: TypeListControlBarProps['onKeywordsChange'] = (value) => {
		setKeywords(value);
		onKeyword$.next(value);
	};

	return (
		<Box {...slotProps.box} sx={consolidateSx(sx, slotProps?.box?.sx)}>
			<TypeListControlBar
				{...slotProps.bar}
				compact={compact}
				onCompactChange={setCompact}
				keywords={keywords}
				onKeywordsChange={handleKeywordsChange}
				objectTypeFilter={objectTypeFilter}
				onObjectTypeFilterChange={setObjectTypeFilter}
			/>
			<TypeList {...slotProps.listing} showTypeId compact={compact} contentTypes={filteredTypes} />
		</Box>
	);
}

export default SelectTypeView;
