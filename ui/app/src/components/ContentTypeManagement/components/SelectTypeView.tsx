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
import React, { useCallback, useEffect, useState } from 'react';
import type { ObjectTypeOption } from '../../ContentTypeFilter';
import useDebouncedInput from '../../../hooks/useDebouncedInput';
import { filterTypesByKeywordsAndObjectType } from '../../../utils/contentType';
import useUpdateRefs from '../../../hooks/useUpdateRefs';
import ContentType from '../../../models/ContentType';
import { consolidateSx } from '../../../utils/system';
import {
	getTypeViewCompactMode,
	getViewGroupedTypes,
	setTypeViewCompactMode,
	setViewGroupedTypes
} from '../../../utils/state';
import useActiveUser from '../../../hooks/useActiveUser';
import { nnou, nou } from '../../../utils/object';
import type { LookupTable } from '../../../models';
import Typography from '@mui/material/Typography';
import useArchetypes from '../../../hooks/useArchetypes';
import { FormattedMessage, useIntl } from 'react-intl';
import { getPossibleTranslation } from '../../../utils/i18n';

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
	const { username } = useActiveUser();
	const storedViewCompact = getTypeViewCompactMode(username);
	const [compact, setCompact] = useState(nnou(storedViewCompact) ? storedViewCompact : initialCompact);
	const [keywords, setKeywords] = useState('');
	const [filteredTypes, setFilteredTypes] = useState<ContentType[]>();
	const [objectTypeFilter, setObjectTypeFilter] = useState<ObjectTypeOption>(initialObjectTypeFilter);
	const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>('ascending');
	const onKeyword$ = useDebouncedInput((keywords) => {
		const types = filterTypesByKeywordsAndObjectType(contentTypesList, keywords, objectTypeFilter);
		setFilteredTypes(sortContentTypes(types, sortOrder));
	});
	const storedViewGrouped = getViewGroupedTypes(username);
	const [groupTypes, setGroupTypes] = useState<boolean>(nnou(storedViewGrouped) ? storedViewGrouped : true);
	const archetypes = useArchetypes();
	const { formatMessage } = useIntl();

	const effectRefs = useUpdateRefs({ keywords, filterTypes: filterTypesByKeywordsAndObjectType });
	useEffect(() => {
		const types = filterTypesByKeywordsAndObjectType(contentTypesList, effectRefs.current.keywords, objectTypeFilter);
		setFilteredTypes(sortContentTypes(types, sortOrder));
	}, [contentTypesList, objectTypeFilter, effectRefs, sortOrder]);

	const handleKeywordsChange: TypeListControlBarProps['onKeywordsChange'] = (value) => {
		setKeywords(value);
		onKeyword$.next(value);
	};

	const handleSetCompact = (value: boolean) => {
		setCompact(value);
		setTypeViewCompactMode(username, value);
	};

	const handleSetGrouped = (value: boolean) => {
		setGroupTypes(value);
		setViewGroupedTypes(username, value);
	};

	const handleToggleSortOrder = (contentTypes: ContentType[]) => {
		const newOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		setSortOrder(newOrder);
		if (contentTypes) {
			setFilteredTypes(sortContentTypes(contentTypes, newOrder));
		}
	};

	/**
	 * Groups content types by their archetype while maintaining the sorting order for each group.
	 *
	 * @returns {LookupTable<ContentType[]>} An object where the keys are archetype values and the values
	 * are arrays of `ContentType` objects sorted by the current sort order.
	 */
	const getGroupedTypes = useCallback((): LookupTable<ContentType[]> => {
		const grouped: LookupTable<ContentType[]> = {};
		if (filteredTypes && archetypes) {
			Object.values(archetypes).forEach((archetype) => {
				const typesForArchetype = filteredTypes.filter((contentType) => {
					return contentType.type === archetype.id;
				});
				if (typesForArchetype.length > 0) {
					grouped[archetype.id] = sortContentTypes(typesForArchetype, sortOrder);
				}
			});
			// go through the filtered types and add any that don't match an archetype
			const uncategorizedTypes = filteredTypes.filter((contentType) => {
				return !archetypes[contentType.type];
			});
			if (uncategorizedTypes.length > 0) {
				grouped['other'] = sortContentTypes(uncategorizedTypes, sortOrder);
			}
		}
		return grouped;
	}, [filteredTypes, archetypes, sortOrder]);

	return (
		<Box {...slotProps.box} sx={consolidateSx(sx, slotProps?.box?.sx)}>
			<TypeListControlBar
				{...slotProps.bar}
				compact={compact}
				onCompactChange={handleSetCompact}
				groupTypes={groupTypes}
				onGroupTypesChange={handleSetGrouped}
				keywords={keywords}
				onKeywordsChange={handleKeywordsChange}
				sortOrder={sortOrder}
				onToggleSortOrder={() => handleToggleSortOrder(filteredTypes)}
				objectTypeFilter={objectTypeFilter}
				onObjectTypeFilterChange={setObjectTypeFilter}
			/>
			{groupTypes ? (
				nou(archetypes) ? (
					<TypeList
						{...slotProps.listing}
						skeleton={true}
						skeletonItemCount={6}
						showTypeId
						compact={compact}
						contentTypes={filteredTypes}
					/>
				) : (
					Object.entries(getGroupedTypes()).map(([archetype, types]) => (
						<Box key={archetype} sx={{ mb: 4 }}>
							<Typography variant="h6" sx={{ mb: 1 }}>
								{archetypes[archetype] ? (
									getPossibleTranslation(archetypes[archetype].name, formatMessage)
								) : archetype === 'other' ? (
									<FormattedMessage defaultMessage="Other" />
								) : (
									archetype
								)}
							</Typography>
							<TypeList {...slotProps.listing} showTypeId compact={compact} contentTypes={types} />
						</Box>
					))
				)
			) : (
				<TypeList {...slotProps.listing} showTypeId compact={compact} contentTypes={filteredTypes} />
			)}
		</Box>
	);
}

/**
 * Sorts an array of content types alphabetically by their name property, either in ascending or descending order.
 *
 * @param {ContentType[]} types - The array of content types to be sorted.
 * @param {'ascending' | 'descending'} order - The order in which to sort the content types.
 *        Use 'ascending' for A-Z sorting and 'descending' for Z-A sorting.
 * @returns {ContentType[]} A new array of content types sorted by name in the specified order.
 */
const sortContentTypes = (types: ContentType[], order: 'ascending' | 'descending'): ContentType[] => {
	return [...types].sort((a, b) => {
		const aValue = a.name.toLowerCase();
		const bValue = b.name.toLowerCase();
		if (aValue < bValue) return order === 'ascending' ? -1 : 1;
		if (aValue > bValue) return order === 'ascending' ? 1 : -1;
		return 0;
	});
};

export default SelectTypeView;
