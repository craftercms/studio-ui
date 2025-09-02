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

import React, { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';
import type { ControlProps } from '../types';
import useEnv from '../../../hooks/useEnv';
import FormsEngineField from '../components/FormsEngineField';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@mui/icons-material';
import { useExtractDataSources } from '../dataSourceHooks/useExtractDataSources';
import { useConsolidatedVideoPickerData } from '../dataSourceHooks/useConsolidatedVideoPickerData';
import { createMediaMenuOptions, downloadMedia } from '../lib/controlHelpers';
import { svgIconClasses } from '@mui/material';
import { menuItemClasses } from '@mui/material/MenuItem';
import { listItemIconClasses } from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import useVideoInfo from '../../../hooks/useVideoInfo';
import type { AllowedPathsData } from './NodeSelector';
import { processPathMacros } from '../../../utils/path';
import { useItemContext, useItemMetaContext } from '../lib/formsEngineContext';
import { nanoid } from 'nanoid';
import { popDialog, pushDialog, pushNonDialog } from '../../../state/actions/dialogStack';
import type { MediaItem } from '../../../models';
import type { BrowseFilesDialogProps } from '../../BrowseFilesDialog';
import { ensureSingleSlash } from '../../../utils/string';
import type { SearchProps } from '../../Search';
import type { FileUploadResult } from '../../SingleFileUpload';
import type { SingleFileUploadDialogProps } from '../../SingleFileUploadDialog';
import { useDispatch } from 'react-redux';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { DialogHeader } from '../../DialogHeader';
import { FormattedMessage } from 'react-intl';
import { DialogBody } from '../../DialogBody';
import { ContentPicker } from '../components/ContentPicker';
import Dialog from '@mui/material/Dialog';

export interface VideoPickerProps extends ControlProps {
	value: string;
}

export function VideoPicker(props: VideoPickerProps) {
	const { field, value, setValue, contentType, readonly } = props;
	const siteId = useActiveSiteId();
	const { guestBase } = useEnv();
	// For testing, by using 3000 as the guestBase both the fetch in `useVideoInfo` and the download functionality will work
	// const guestBase = 'http://localhost:3000';
	const contextItem = useItemContext();
	const { id, pathInSite } = useItemMetaContext();
	const videoInfo = useVideoInfo(value ? `${guestBase}${value}` : null);
	const hasValue = Boolean(value);
	const dataSourceSummary = useConsolidatedVideoPickerData(useExtractDataSources(contentType, field, 'videoManager'));
	const { allowedBrowsePaths, allowedUploadPaths, allowedSearchPaths } = dataSourceSummary;
	const addMenuButtonRef = useRef<HTMLButtonElement>(undefined);
	const [addMenuOpen, setAddMenuOpen] = useState(false);
	const [openPickerDialog, setOpenPickerDialog] = useState(false);
	const [pickerType, setPickerType] = useState<'browse' | 'upload' | 'search'>(null);
	const dispatch = useDispatch();

	const handleDataSourceOptionClick = (
		event: ReactMouseEvent<HTMLLIElement, MouseEvent>,
		option: 'upload' | 'browse' | 'search'
	) => {
		setAddMenuOpen(false);
		switch (option) {
			case 'browse': {
				if (allowedBrowsePaths.length === 1) {
					executeDataSourceOption('browse', allowedBrowsePaths[0]);
				} else {
					// Open browse picker
					setPickerType('browse');
					setOpenPickerDialog(true);
				}
				break;
			}
			case 'upload': {
				if (allowedUploadPaths.length === 1) {
					executeDataSourceOption('upload', allowedUploadPaths[0]);
				} else {
					// Open upload picker
					setPickerType('upload');
					setOpenPickerDialog(true);
				}
				break;
			}
			case 'search': {
				if (allowedSearchPaths.length === 1) {
					executeDataSourceOption('search', allowedSearchPaths[0]);
				} else {
					// Open search picker
					setPickerType('search');
					setOpenPickerDialog(true);
				}
			}
		}
	};
	const executeDataSourceOption = (optionType: 'browse' | 'upload' | 'search', choice: AllowedPathsData) => {
		const processPath = (path: string) =>
			processPathMacros({ path, objectId: id, fullParentPath: contextItem?.path ?? pathInSite });

		switch (optionType) {
			case 'browse': {
				const id = nanoid();
				dispatch(
					pushDialog({
						id,
						component: 'craftercms.components.BrowseFilesDialog',
						props: {
							path: processPath(choice.path),
							allowUpload: false,
							onSuccess(imageData: MediaItem) {
								setValue(imageData.path);
								dispatch(popDialog({ id }));
							}
						} as BrowseFilesDialogProps
					})
				);
				break;
			}
			case 'search': {
				const id = nanoid();
				dispatch(
					pushNonDialog({
						id,
						component: 'craftercms.components.Search',
						props: {
							mode: 'select',
							embedded: true,
							initialParameters: {
								path: ensureSingleSlash(`${processPath(choice.path)}/.+`),
								sortBy: 'internalName'
							},
							onAcceptSelection(images) {
								// TODO: how do I set Search to single selection?
								setValue(images[0]);
								dispatch(popDialog({ id }));
							}
						} as SearchProps
					})
				);
				break;
			}
			case 'upload': {
				const id = nanoid();
				dispatch(
					pushDialog({
						id,
						component: 'craftercms.components.SingleFileUploadDialog',
						props: {
							site: siteId,
							path: processPath(choice.path),
							fileTypes: ['video/*'],
							onUploadComplete(result: FileUploadResult) {
								if (result.successful.length) {
									const newValue = ensureSingleSlash(
										`${result.successful[0].meta.path}/${result.successful[0].meta.name}`
									);
									setValue(newValue);
									dispatch(popDialog({ id }));
								}
							}
						} as SingleFileUploadDialogProps
					})
				);
				break;
			}
		}
	};

	const handleDataSourcePickerDialogChange = (event, choice: AllowedPathsData) => {
		executeDataSourceOption(pickerType, choice);
		setOpenPickerDialog(false);
	};

	const menuOptions = createMediaMenuOptions(dataSourceSummary, handleDataSourceOptionClick, readonly);

	const handleRemoveVideo = () => {
		setValue(null);
	};

	return (
		<>
			<Menu
				anchorEl={addMenuButtonRef.current}
				open={addMenuOpen}
				onClose={() => setAddMenuOpen(false)}
				sx={{
					[`.${menuItemClasses.root}`]: { pl: 3 }
				}}
				children={menuOptions}
			/>
			<Dialog open={openPickerDialog} onClose={() => setOpenPickerDialog(false)} fullWidth maxWidth="sm">
				<DialogHeader
					title={<FormattedMessage defaultMessage="Choose how to proceed" />}
					onCloseButtonClick={() => setOpenPickerDialog(false)}
				/>
				<DialogBody>
					{(() => {
						switch (pickerType) {
							case 'browse':
								return (
									<ContentPicker
										label={<FormattedMessage defaultMessage="Browse Settings" />}
										allowedPaths={allowedBrowsePaths}
										onChange={handleDataSourcePickerDialogChange}
									/>
								);
							case 'upload':
								return (
									<ContentPicker
										label={<FormattedMessage defaultMessage="Upload Settings" />}
										allowedPaths={allowedUploadPaths}
										onChange={handleDataSourcePickerDialogChange}
									/>
								);
							case 'search':
								return (
									<ContentPicker
										label={<FormattedMessage defaultMessage="Search Settings" />}
										allowedPaths={allowedSearchPaths}
										onChange={handleDataSourcePickerDialogChange}
									/>
								);
						}
					})()}
				</DialogBody>
			</Dialog>
			<FormsEngineField field={field}>
				{hasValue ? (
					<Card sx={{ display: 'flex' }}>
						{/* TODO: show media controls? */}
						<CardMedia component="video" sx={{ width: '40%' }} image={`${guestBase}${value}`} />
						<Box sx={{ display: 'flex', flexDirection: 'column' }}>
							<CardContent sx={{ flex: '1 0 auto' }}>
								<Typography component="div" variant="body1" marginBottom={1}>
									{value}
								</Typography>
								<Typography variant="body2" component="div" color="textSecondary" marginBottom={1}>
									{videoInfo?.contentType}
									<br />
									{videoInfo?.width} x {videoInfo?.height}
									<br />
									{videoInfo?.size ? `${videoInfo.size} Kb` : ''}
								</Typography>

								<Box>
									<IconButton
										size="small"
										ref={addMenuButtonRef}
										onClick={() => {
											setAddMenuOpen(true);
										}}
									>
										<EditOutlined />
									</IconButton>
									<IconButton component="a" size="small" onClick={() => downloadMedia(guestBase, value)}>
										<DownloadOutlined />
									</IconButton>
									<IconButton size="small" onClick={handleRemoveVideo}>
										<DeleteOutlined />
									</IconButton>
								</Box>
							</CardContent>
						</Box>
					</Card>
				) : (
					// TODO: same as in NodeSelector and ImagePicker
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
