/*
 * Copyright (C) 2007-2026 Crafter Software Corporation. All Rights Reserved.
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

import { ControlProps } from '../types';
import { isFieldReadOnly } from '../lib/formUtils';
import FormsEngineField from '../components/FormsEngineField';
import React, { useId } from 'react';
import FieldBox from '../components/FieldBox';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IconButton from '@mui/material/IconButton';
import { useDispatch } from 'react-redux';
import { pushDialog } from '../../../state/actions/dialogStack';
import { createComponentId } from '../../../utils/system';
import Box from '@mui/material/Box';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { nnou } from '../../../utils/object';

export interface TranscodedVideoPickerProps extends ControlProps {
	value: { url: string }[];
}

export function TranscodedVideoPicker(props: TranscodedVideoPickerProps) {
	const { field, value, setValue, readonly: formReadOnly, autoFocus } = props;
	const htmlId = useId();
	const dispatch = useDispatch();
	const hasValue = Array.isArray(value) ? value.length > 0 : nnou(value);

	const readonly = isFieldReadOnly(field, formReadOnly);

	const handleViewVideo = (path: string) => {
		if (!path) return;
		dispatch(
			pushDialog({
				component: createComponentId('PreviewDialog'),
				allowMinimize: true,
				allowFullScreen: true,
				props: {
					type: 'video',
					title: path,
					url: path
				}
			})
		);
	};

	const handleRemoveVideos = () => {
		setValue(null);
	};

	return (
		<FormsEngineField htmlFor={htmlId} field={field}>
			{hasValue ? (
				<FieldBox dashed={true}>
					<List dense>
						{value?.map((item, index) => (
							<ListItem key={index}>
								<ListItemText>{item.url}</ListItemText>
								<Tooltip title={<FormattedMessage defaultMessage="View" />}>
									<IconButton size="small" onClick={() => handleViewVideo(item.url)}>
										<VisibilityOutlinedIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</ListItem>
						))}
					</List>
					<Box sx={{ width: '100%', display: 'flex', justifyContent: 'end', padding: '0 16px 10px 0' }}>
						<Tooltip title={<FormattedMessage defaultMessage="Replace" />}>
							<IconButton size="small" disabled={readonly} autoFocus={autoFocus}>
								<EditOutlined />
							</IconButton>
						</Tooltip>
						<Tooltip title={<FormattedMessage defaultMessage="Delete" />}>
							<IconButton size="small" disabled={readonly} autoFocus={autoFocus} onClick={handleRemoveVideos}>
								<DeleteOutlined />
							</IconButton>
						</Tooltip>
					</Box>
				</FieldBox>
			) : (
				<Box>
					{/* TODO: render menuOptions retrieved from datasources */}
					<FormattedMessage defaultMessage="No content set" />
				</Box>
			)}
		</FormsEngineField>
	);
}

export default TranscodedVideoPicker;
