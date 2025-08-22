/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import React, { MouseEvent as ReactMouseEvent, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@mui/icons-material';
import { FormsEngineField } from '../components/FormsEngineField';
import useEnv from '../../../hooks/useEnv';
import { ControlProps } from '../types';
import { FormattedMessage } from 'react-intl';
import { useConsolidatedImagePickerData } from '../dataSourceHooks/useConsolidatedImagePickerData';
import useUpdateRefs from '../../../hooks/useUpdateRefs';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import TravelExploreOutlined from '@mui/icons-material/TravelExploreOutlined';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import useImageInfo from '../../../hooks/useImageInfo';
import { svgIconClasses } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { DialogHeader } from '../../DialogHeader';
import { DialogBody } from '../../DialogBody';
import type { AllowedPathsData } from './NodeSelector';
import { getFileNameFromPath, processPathMacros } from '../../../utils/path';
import { popDialog, pushDialog, pushNonDialog } from '../../../state/actions/dialogStack';
import { nanoid } from 'nanoid';
import type { BrowseFilesDialogProps } from '../../BrowseFilesDialog';
import type { MediaItem } from '../../../models';
import { ensureSingleSlash } from '../../../utils/string';
import type { SearchProps } from '../../Search';
import { useDispatch } from 'react-redux';
import { useItemContext, useItemMetaContext } from '../lib/formsEngineContext';
import type { FileUploadResult } from '../../SingleFileUpload';
import type { SingleFileUploadDialogProps } from '../../SingleFileUploadDialog';
import { ContentPicker } from '../components/ContentPicker';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import SearchRounded from '@mui/icons-material/SearchRounded';
import Tooltip from '@mui/material/Tooltip';
import { useExtractDataSources } from '../dataSourceHooks/useExtractDataSources';
import { createMediaMenuOptions } from '../lib/controlHelpers';

export interface ImagePickerProps extends ControlProps {
	value: string;
}

type PickerType = 'browse' | 'upload' | 'search';

export function ImagePicker(props: ImagePickerProps) {
	const { field, value, setValue, contentType, autoFocus, readonly } = props;
	const siteId = useActiveSiteId();
	const { guestBase } = useEnv();
	const contextItem = useItemContext();
	const { id, pathInSite } = useItemMetaContext();
	const imageInfo = useImageInfo(value ? `${guestBase}${value}` : null);
	const hasValue = Boolean(value);
	const dataSourceSummary = useConsolidatedImagePickerData(useExtractDataSources(contentType, field, 'imageManager'));
	const { allowedBrowsePaths, allowedUploadPaths, allowedSearchPaths } = dataSourceSummary;
	const addMenuButtonRef = useRef<HTMLButtonElement>(undefined);
	const [addMenuOpen, setAddMenuOpen] = useState(false);
	const dispatch = useDispatch();
	const [openPickerDialog, setOpenPickerDialog] = useState(false);
	const [pickerType, setPickerType] = useState<PickerType>(null);

	const handleDataSourceOptionClick = (event: ReactMouseEvent<HTMLLIElement, MouseEvent>, option: PickerType) => {
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
					executeDataSourceOption('upload', allowedSearchPaths[0]);
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
	const executeDataSourceOption = (optionType: PickerType, choice: AllowedPathsData) => {
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
							fileTypes: ['image/*'],
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

	const memoRefs = useUpdateRefs({ handleDataSourceOptionClick });

	const menuOptions = useMemo(() => {
		const { allowedBrowsePaths, allowedUploadPaths, allowedSearchPaths } = dataSourceSummary;
		const menuOptions = [];

		if (allowedBrowsePaths.length > 0) {
			menuOptions.push(
				<MenuItem
					key="browse"
					onClick={(event) => memoRefs.current.handleDataSourceOptionClick(event, 'browse')}
					disabled={readonly}
				>
					<ListItemIcon sx={{ mr: 0 }}>
						<TravelExploreOutlined fontSize="small" />
					</ListItemIcon>
					<ListItemText children={<FormattedMessage defaultMessage="Browse" />} />
				</MenuItem>
			);
		}
		if (allowedSearchPaths.length > 0) {
			menuOptions.push(
				<MenuItem
					key="search"
					onClick={(event) => memoRefs.current.handleDataSourceOptionClick(event, 'search')}
					disabled={readonly}
				>
					<ListItemIcon sx={{ mr: 0 }}>
						<SearchRounded fontSize="small" />
					</ListItemIcon>
					<ListItemText children={<FormattedMessage defaultMessage="Search" />} />
				</MenuItem>
			);
		}
		if (allowedUploadPaths.length > 0) {
			menuOptions.push(
				<MenuItem
					key="upload"
					onClick={(event) => memoRefs.current.handleDataSourceOptionClick(event, 'upload')}
					disabled={readonly}
				>
					<ListItemIcon sx={{ mr: 0 }}>
						<UploadFileOutlinedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText children={<FormattedMessage defaultMessage="Upload" />} />
				</MenuItem>
			);
		}
		return menuOptions;
	}, [memoRefs, dataSourceSummary, readonly]);

	const handleRemoveImage = () => {
		setValue(null);
	};

	// TODO: create util
	const onDownload = () => {
		const link = document.createElement('a');
		link.href = `${guestBase}${value}`;
		link.download = getFileNameFromPath(value); // Extracts the file name from the URL
		link.click();
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
						<CardMedia
							component="img"
							sx={{ width: '40%' }}
							image={`${guestBase}${value}`}
							alt="Live from space album cover"
						/>
						<Box sx={{ display: 'flex', flexDirection: 'column' }}>
							<CardContent sx={{ flex: '1 0 auto' }}>
								<Typography component="div" variant="body1" marginBottom={1}>
									{value}
								</Typography>
								<Typography variant="body2" component="div" color="textSecondary" marginBottom={1}>
									{imageInfo?.contentType}
									<br />
									{imageInfo?.width} x {imageInfo?.height}
									<br />
									{imageInfo?.size ? 'Kb' : ''}
								</Typography>
								<Box>
									<Tooltip title={<FormattedMessage defaultMessage="Replace" />}>
										<IconButton
											size="small"
											ref={addMenuButtonRef}
											disabled={readonly}
											onClick={() => {
												setAddMenuOpen(true);
											}}
										>
											<EditOutlined />
										</IconButton>
									</Tooltip>
									<Tooltip title={<FormattedMessage defaultMessage="Download" />}>
										<IconButton size="small" onClick={() => onDownload()}>
											<DownloadOutlined />
										</IconButton>
									</Tooltip>
									<Tooltip title={<FormattedMessage defaultMessage="Delete" />}>
										<IconButton size="small" onClick={handleRemoveImage} disabled={readonly}>
											<DeleteOutlined />
										</IconButton>
									</Tooltip>
								</Box>
							</CardContent>
						</Box>
					</Card>
				) : (
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
					// <FieldBox
					// 	dashed
					// 	sx={{
					// 		p: 1,
					// 		gap: 1,
					// 		flexDirection: 'row',
					// 		justifyContent: 'center'
					// 	}}
					// >
					// 	<StackedButton>
					// 		<Avatar variant="circular">
					// 			<UploadFileOutlinedIcon />
					// 		</Avatar>
					// 		<FormattedMessage defaultMessage="Upload" />
					// 	</StackedButton>
					// 	<StackedButton>
					// 		<Avatar variant="circular">
					// 			<UploadFileOutlinedIcon />
					// 		</Avatar>
					// 		<FormattedMessage defaultMessage="Browse" />
					// 	</StackedButton>
					// 	<StackedButton>
					// 		<Avatar variant="circular">
					// 			<UploadFileOutlinedIcon />
					// 		</Avatar>
					// 		<FormattedMessage defaultMessage="Search" />
					// 	</StackedButton>
					// </FieldBox>
				)}
			</FormsEngineField>
		</>
	);
}

export default ImagePicker;
