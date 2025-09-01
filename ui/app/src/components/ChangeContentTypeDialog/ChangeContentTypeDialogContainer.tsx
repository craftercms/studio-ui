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

import { ChangeContentTypeDialogContainerProps } from './utils';
import React from 'react';
import DialogBody from '../DialogBody/DialogBody';
import { FormattedMessage } from 'react-intl';
import SelectTypeView from '../ContentTypeManagement/components/SelectTypeView';
import { getNormalizedFolderPathForApi1GetTypes } from '../../utils/contentType';
import { TypeListProps } from '../ContentTypeManagement/components/TypeList';
import ItemDisplay from '../ItemDisplay';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useFetchAllowedTypesForPath from '../../hooks/useFetchAllowedTypesForPath';
import { ObjectTypeOption } from '../ContentTypeFilter';

export function ChangeContentTypeDialogContainer(props: ChangeContentTypeDialogContainerProps) {
	const { item, onContentTypeSelected, initialCompact = false } = props;

	const handleContentTypeSelected: TypeListProps['onCardClick'] = (_, contentType) => {
		onContentTypeSelected?.({
			path: item.path,
			contentType: contentType
		});
	};

	const { contentTypes, isFetching } = useFetchAllowedTypesForPath(
		getNormalizedFolderPathForApi1GetTypes(item),
		(types) => types.filter((type) => type.type === item.systemType)
	);

	return (
		<DialogBody sx={{ minHeight: 670 }}>
			<SelectTypeView
				initialCompact={initialCompact}
				initialObjectTypeFilter={item.systemType as ObjectTypeOption}
				contentTypesList={contentTypes}
				slotProps={{
					listing: {
						skeleton: isFetching,
						skeletonItemCount: 4,
						onCardClick: handleContentTypeSelected,
						selectedTypeId: item.contentTypeId
					},
					bar: {
						slotProps: {
							contentTypesFilter: { disabled: true }
						},
						leftChildren: (
							<Box sx={{ pl: 2, mr: 2, maxWidth: 300 }}>
								<Typography variant="body2" color="textSecondary">
									<FormattedMessage defaultMessage="Target Item" />
								</Typography>
								<ItemDisplay item={item} showNavigableAsLinks={false} />
							</Box>
						)
					}
				}}
			/>
		</DialogBody>
	);
}

export default ChangeContentTypeDialogContainer;
