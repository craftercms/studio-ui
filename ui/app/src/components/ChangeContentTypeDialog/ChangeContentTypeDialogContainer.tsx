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
import { FormattedMessage, useIntl } from 'react-intl';
import SelectTypeView from '../ContentTypeManagement/components/SelectTypeView';
import { getNormalizedFolderPathForApi1GetTypes } from '../../utils/contentType';
import { TypeListProps } from '../ContentTypeManagement/components/TypeList';
import ItemDisplay from '../ItemDisplay';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useFetchAllowedTypesForPath from '../../hooks/useFetchAllowedTypesForPath';
import { ObjectTypeOption } from '../ContentTypeFilter';
import { DialogFooter } from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { EmptyState } from '../EmptyState';
import { useDispatch } from 'react-redux';
import { nanoid } from 'nanoid';
import { pushConfirmDialog } from '../../utils/system';
import { popDialog } from '../../state/actions/dialogStack';

export function ChangeContentTypeDialogContainer(props: ChangeContentTypeDialogContainerProps) {
	const { item, onContentTypeSelected, initialCompact = false, onClose } = props;
	const dispatch = useDispatch();
	const { formatMessage } = useIntl();

	const handleContentTypeSelected: TypeListProps['onCardClick'] = (_, contentType) => {
		const dialogId = nanoid();
		dispatch(
			pushConfirmDialog({
				id: dialogId,
				props: {
					title: formatMessage({ defaultMessage: 'Change Type' }),
					body: formatMessage({
						defaultMessage: 'The following operation may result in data loss. Would you like to proceed?'
					}),
					onCancel: () => dispatch(popDialog({ id: dialogId })),
					onOk: () => {
						dispatch(popDialog({ id: dialogId }));
						onContentTypeSelected?.({
							path: item.path,
							contentType: contentType
						});
					}
				}
			})
		);
	};

	const { contentTypes, isFetching } = useFetchAllowedTypesForPath(
		getNormalizedFolderPathForApi1GetTypes(item),
		// Filter only compatible types, and filter out current type.
		(types) => types.filter((type) => type.type === item.systemType && item.contentTypeId != type.id)
	);
	// Show the select type view if there are content types to show, or if it's still loading (to show the skeleton). Otherwise, show the empty state.
	const showSelectTpeView = contentTypes?.length || isFetching;

	return (
		<>
			<DialogBody sx={{ minHeight: 670, justifyContent: showSelectTpeView ? 'start' : 'center' }}>
				{showSelectTpeView ? (
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
				) : (
					<EmptyState
						title={<FormattedMessage defaultMessage="No types available for the item." />}
						sxs={{ root: { height: '100%' } }}
					/>
				)}
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={(e) => onClose(e, null)}>
					<FormattedMessage defaultMessage="Cancel" />
				</SecondaryButton>
			</DialogFooter>
		</>
	);
}

export default ChangeContentTypeDialogContainer;
