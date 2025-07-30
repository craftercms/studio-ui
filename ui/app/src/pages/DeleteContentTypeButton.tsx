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

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import ContentType from '../models/ContentType';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { popDialog, pushDialog } from '../state/actions/dialogStack';
import { nanoid } from 'nanoid';

export interface DeleteContentTypeButtonProps {
	contentType: ContentType;
	onComplete?(): void;
}

function DeleteContentTypeButton({ contentType, onComplete }: DeleteContentTypeButtonProps) {
	const { formatMessage } = useIntl();
	const dispatch = useDispatch();

	const onOpenDeleteContentTypeDialog = () => {
		const dialogId = nanoid();
		dispatch(
			pushDialog({
				id: dialogId,
				// TODO: update to use 'createComponentId' when 'dialogs-system' PR is merged.
				component: 'craftercms.components.DeleteContentTypeDialog',
				props: {
					contentType,
					onComplete: () => {
						dispatch(popDialog({ id: dialogId }));
						onComplete?.();
					},
					onClose: () => dispatch(popDialog({ id: dialogId }))
				}
			})
		);
	};

	return (
		<>
			<IconButton
				onClick={() => onOpenDeleteContentTypeDialog()}
				size="large"
				aria-label={formatMessage({ defaultMessage: 'Delete' })}
			>
				<DeleteRounded />
			</IconButton>
		</>
	);
}

export default DeleteContentTypeButton;
