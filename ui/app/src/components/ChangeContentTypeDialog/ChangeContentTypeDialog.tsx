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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import EnhancedDialog from '../EnhancedDialog';
import { ChangeContentTypeDialogProps } from './utils';
import ChangeContentTypeDialogContainer from './ChangeContentTypeDialogContainer';
import useFetchAllowedTypesForPath from '../../hooks/useFetchAllowedTypesForPath';
import { getNormalizedFolderPathForApi1GetTypes } from '../../utils/contentType';

export function ChangeContentTypeDialog(props: ChangeContentTypeDialogProps) {
	const { item, onContentTypeSelected, initialCompact, ...rest } = props;
	const { contentTypes, isFetching } = useFetchAllowedTypesForPath(
		getNormalizedFolderPathForApi1GetTypes(item),
		// Filter only compatible types, and filter out current type.
		(types) => types.filter((type) => type.type === item.systemType && item.contentTypeId != type.id)
	);

	return (
		<EnhancedDialog
			maxWidth={isFetching || contentTypes?.length ? 'lg' : 'xs'}
			dialogHeaderProps={{
				title: <FormattedMessage defaultMessage="Change Content Type" />,
				subtitle:
					isFetching || contentTypes?.length ? (
						<FormattedMessage defaultMessage="The item can only be changed to the types below." />
					) : undefined
			}}
			{...rest}
		>
			<ChangeContentTypeDialogContainer
				item={item}
				initialCompact={initialCompact}
				contentTypes={contentTypes}
				isFetching={isFetching}
				onContentTypeSelected={onContentTypeSelected}
				onClose={props.onClose}
			/>
		</EnhancedDialog>
	);
}

export default ChangeContentTypeDialog;
