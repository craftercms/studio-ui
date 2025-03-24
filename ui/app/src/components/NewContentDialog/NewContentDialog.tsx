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
import { NewContentDialogProps } from './utils';
import { NewContentDialogContainer } from './NewContentDialogContainer';
import EnhancedDialog from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';

export function NewContentDialog(props: NewContentDialogProps) {
	const { item, initialCompact, onContentTypeSelected, ...rest } = props;
	return (
		<EnhancedDialog
			maxWidth="lg"
			dialogHeaderProps={{
				title: <FormattedMessage id="newContentDialog.title" defaultMessage="Create Content" />,
				subtitle: (
					<FormattedMessage
						id="newContentDialog.subtitle"
						defaultMessage="Choose a content type template for your new content item."
					/>
				)
			}}
			{...rest}
		>
			<NewContentDialogContainer
				item={item}
				initialCompact={initialCompact}
				onContentTypeSelected={onContentTypeSelected}
			/>
		</EnhancedDialog>
	);
}

export default NewContentDialog;
