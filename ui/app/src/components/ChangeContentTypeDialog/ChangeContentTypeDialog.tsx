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

export function ChangeContentTypeDialog(props: ChangeContentTypeDialogProps) {
	const { item, onContentTypeSelected, initialCompact, ...rest } = props;
	return (
		<EnhancedDialog
			maxWidth="lg"
			dialogHeaderProps={{
				title: <FormattedMessage defaultMessage="Change Content Type" />,
				subtitle: <FormattedMessage defaultMessage="The item can only be changed to the types below." />
			}}
			{...rest}
		>
			<ChangeContentTypeDialogContainer
				item={item}
				initialCompact={initialCompact}
				onContentTypeSelected={onContentTypeSelected}
				onClose={props.onClose}
			/>
		</EnhancedDialog>
	);
}

export default ChangeContentTypeDialog;
