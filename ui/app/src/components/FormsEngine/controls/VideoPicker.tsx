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

import React, { type MouseEvent as ReactMouseEvent, useMemo, useRef, useState } from 'react';
import { ControlProps } from '../types';
import useEnv from '../../../hooks/useEnv';
import useContentTypes from '../../../hooks/useContentTypes';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import TravelExploreOutlined from '@mui/icons-material/TravelExploreOutlined';
import { FormattedMessage, useIntl } from 'react-intl';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import FormsEngineField from '../components/FormsEngineField';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@mui/icons-material';
import { svgIconClasses } from '@mui/material';
import { ensureSingleSlash } from '../../../utils/string';
import useVideoInfo from '../../../hooks/useVideoInfo';
import Skeleton from '@mui/material/Skeleton';
import { downloadMedia } from '../lib/controlHelpers';
import Tooltip from '@mui/material/Tooltip';
import { getPropertyValue, isFieldReadOnly } from '../lib/formUtils';
import Menu from '@mui/material/Menu';

export interface VideoPickerProps extends ControlProps {
	value: string;
}

const videoDataSourcesTypesMap = {
	'video-browse-repo': 'browse',
	'video-desktop-upload': 'upload'
};

type PickerType = 'browse' | 'upload';

export function VideoPicker(props: VideoPickerProps) {
	const { field, value, setValue, contentType, readonly: formReadonly } = props;
	const { guestBase } = useEnv();
	// TODO: For testing, by using 3000 as the guestBase both the fetch in `useImageInfo` and the download functionality will work
	// const guestBase = 'http://localhost:3000';
	const hasValue = Boolean(value);
	const { formatMessage } = useIntl();
	const { videoInfo, isFetchingMetadata, isFetchingDimensions, errorDimensions, errorMetadata } = useVideoInfo(
		value ? ensureSingleSlash(`${guestBase}${value}`) : ''
	);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const addMenuButtonRef = useRef<HTMLButtonElement>(undefined);
	const [addMenuOpen, setAddMenuOpen] = useState(false);

	const readonly: boolean = isFieldReadOnly(field, formReadonly);

	const contentTypes = useContentTypes();

	const { menuOptions, allowedBrowsePaths, allowedUploadPaths } = useMemo(() => {
		const dataSourceIds = (getPropertyValue(field.properties, 'videoManager', '') as string).split(',') || [];
		// TODO: video datasource supports 'search' too
		const allowedBrowsePaths: Array<{ title: string; path: string }> = [];
		const allowedUploadPaths: Array<{ title: string; path: string }> = [];

		contentTypes[contentType.id].dataSources.forEach((ds) => {
			if (dataSourceIds.includes(ds.id)) {
				// TODO: when adding other DS (like s3 and webdav), check if property is 'repoPath' too
				if (videoDataSourcesTypesMap[ds.type] === 'browse') {
					allowedBrowsePaths.push({
						title: ds.title,
						path: ds.properties.repoPath
					});
				} else if (videoDataSourcesTypesMap[ds.type] === 'upload') {
					allowedUploadPaths.push({
						title: ds.title,
						path: ds.properties.repoPath
					});
				} else {
					console.warn(`Unknown data source type "${ds.type}" for Video Picker control`, ds);
				}
			}
		});

		const menuOptions = [];
		// TODO: pending when datasources implementation is ready.
		const handleDataSourceOptionClick = (event: ReactMouseEvent<HTMLLIElement, MouseEvent>, option: PickerType) => {};
		if (allowedBrowsePaths.length > 0) {
			menuOptions.push(
				<MenuItem key="search" onClick={(event) => handleDataSourceOptionClick(event, 'browse')}>
					<ListItemIcon sx={{ mr: 0 }}>
						<TravelExploreOutlined fontSize="small" />
					</ListItemIcon>
					<ListItemText children={<FormattedMessage defaultMessage="Browse" />} />
				</MenuItem>
			);
		}
		if (allowedUploadPaths.length > 0) {
			menuOptions.push(
				<MenuItem key="upload" onClick={(event) => handleDataSourceOptionClick(event, 'upload')}>
					<ListItemIcon sx={{ mr: 0 }}>
						<UploadFileOutlinedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText children={<FormattedMessage defaultMessage="Upload" />} />
				</MenuItem>
			);
		}

		return {
			menuOptions,
			allowedBrowsePaths,
			allowedUploadPaths
		};
	}, [contentType.id, contentTypes, field]);

	const handleRemove = () => {
		setValue(null);
	};

	return (
		<>
			<Menu
				anchorEl={anchorEl}
				open={addMenuOpen}
				onClose={() => setAddMenuOpen(false)}
				sx={{
					[`.${menuItemClasses.root}`]: { pl: 3 }
				}}
			>
				{menuOptions}
			</Menu>
			<FormsEngineField field={field}>
				{hasValue ? (
					<Card sx={{ display: 'flex' }}>
						<CardMedia component="video" sx={{ width: '40%' }} image={`${guestBase}${value}`} />
						<Box sx={{ display: 'flex', flexDirection: 'column' }}>
							<CardContent sx={{ flex: '1 0 auto' }}>
								<Typography component="div" variant="body1" marginBottom={1}>
									{value}
								</Typography>
								<Typography variant="body2" component="div" color="textSecondary" marginBottom={1}>
									{isFetchingMetadata ? (
										<>
											<Skeleton variant="text" />
											<Skeleton variant="text" />
										</>
									) : errorMetadata ? (
										<Typography color="error" variant="body2">
											<FormattedMessage defaultMessage="Error loading image metadata" />
										</Typography>
									) : (
										<>
											{videoInfo?.contentType}
											<br />
											{videoInfo?.size ? `${videoInfo.size} Kb` : ''}
											<br />
										</>
									)}
									<br />
									{isFetchingDimensions ? (
										<Skeleton variant="text" />
									) : errorDimensions ? (
										<Typography color="error" variant="body2">
											<FormattedMessage defaultMessage="Error loading video dimensions" />
										</Typography>
									) : (
										`${videoInfo.width}x${videoInfo.height}`
									)}
									<br />
								</Typography>
								<Box>
									<Tooltip title={<FormattedMessage defaultMessage="Replace" />}>
										<IconButton
											disabled={readonly}
											aria-label={formatMessage({ defaultMessage: 'Replace' })}
											size="small"
											ref={addMenuButtonRef}
											onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
												setAnchorEl(event.currentTarget);
												setAddMenuOpen(true);
											}}
										>
											<EditOutlined />
										</IconButton>
									</Tooltip>
									<Tooltip title={<FormattedMessage defaultMessage="Download" />}>
										<IconButton
											aria-label={formatMessage({ defaultMessage: 'Download' })}
											size="small"
											onClick={() => {
												if (value) downloadMedia(guestBase, value);
											}}
										>
											<DownloadOutlined />
										</IconButton>
									</Tooltip>
									<Tooltip title={<FormattedMessage defaultMessage="Delete" />}>
										<IconButton
											disabled={readonly}
											size="small"
											onClick={handleRemove}
											aria-label={formatMessage({ defaultMessage: 'Delete' })}
										>
											<DeleteOutlined />
										</IconButton>
									</Tooltip>
								</Box>
							</CardContent>
						</Box>
					</Card>
				) : (
					// TODO: same as in NodeSelector and ImagePicker - Refactor this when datasources implementation is ready.
					<Box
						children={menuOptions}
						sx={{
							p: 1,
							gap: 1,
							py: 0.5,
							display: 'flex',
							flexDirection: 'row',
							flexWrap: 'wrap',
							color: 'primary.main',
							justifyContent: 'center',
							[`.${svgIconClasses.root}`]: {
								color: 'primary.main'
							},
							[`.${menuItemClasses.root}`]: {
								flexDirection: 'column',
								justifyContent: 'center',
								borderRadius: 1
							},
							[`.${listItemIconClasses.root}`]: {
								justifyContent: 'center'
							}
						}}
					/>
				)}
			</FormsEngineField>
		</>
	);
}

export default VideoPicker;
