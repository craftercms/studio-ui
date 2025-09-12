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

import React, { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';
import Box from '@mui/material/Box';
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
import { menuItemClasses } from '@mui/material/MenuItem';
import { listItemIconClasses } from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import useImageInfo from '../../../hooks/useImageInfo';
import { svgIconClasses } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { DialogHeader } from '../../DialogHeader';
import { DialogBody } from '../../DialogBody';
import type { AllowedPathsData } from './NodeSelector';
import { processPathMacros } from '../../../utils/path';
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
import Tooltip from '@mui/material/Tooltip';
import { useExtractDataSources } from '../dataSourceHooks/useExtractDataSources';
import { createMediaMenuOptions, downloadMedia } from '../lib/controlHelpers';
import { createComponentId } from '../../../utils/system';
import type { ImageRestrictions } from '../../ImageCropDialog/types';
import { batchActions } from '../../../state/actions/misc';

export interface ImagePickerProps extends ControlProps {
	value: string;
}

type PickerType = 'browse' | 'upload' | 'search';

function doesImageMeetSizeRestrictions(file: HTMLImageElement, restrictions?: ImageRestrictions): boolean {
	let meetRestrictions = true;
	if (restrictions) {
		const { width, height, minWidth, minHeight, maxWidth, maxHeight } = restrictions;
		if (
			(width && file.width !== width) ||
			(height && file.height !== height) ||
			(minWidth && file.width < minWidth) ||
			(minHeight && file.height < minHeight) ||
			(maxWidth && file.width > maxWidth) ||
			(maxHeight && file.height > maxHeight)
		) {
			meetRestrictions = false;
		}
	}
	return meetRestrictions;
}

export function ImagePicker(props: ImagePickerProps) {
	const { field, value, setValue, contentType, autoFocus, readonly: formReadonly } = props;
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

	// region field properties/validations
	const readonly = formReadonly || (field.properties?.readonly?.value as boolean);
	const restrictions: ImageRestrictions = {
		height: field.validations.height?.value ?? null,
		width: field.validations.width?.value ?? null,
		maxHeight: field.validations.maxHeight?.value ?? null,
		maxWidth: field.validations.maxWidth?.value ?? null,
		minHeight: field.validations.minHeight?.value ?? null,
		minWidth: field.validations.minWidth?.value ?? null
	};
	// endregion

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
								// Check if the image meets restrictions
								if (restrictions) {
									const img = new window.Image();
									img.onload = () => {
										if (!doesImageMeetSizeRestrictions(img, restrictions)) {
											const dialogId = nanoid();
											dispatch(
												pushDialog({
													id: dialogId,
													component: createComponentId('ImageCropDialog'),
													props: {
														path: imageData.path,
														restrictions,
														writeContent: true,
														onCrop: (blob: Blob, newPath) => {
															setValue(newPath ?? imageData.path);
															dispatch(batchActions([popDialog({ id: dialogId }), popDialog({ id })]));
														}
													}
												})
											);
										} else {
											setValue(imageData.path);
											dispatch(popDialog({ id }));
										}
									};
									img.src = imageData.path;
								} else {
									setValue(imageData.path);
									dispatch(popDialog({ id }));
								}
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
							onFileAdded: (file, uppy, callback) => {
								// TODO: util to show cropDialog
								const data = file.data;
								const url = URL.createObjectURL(data);
								const image = new Image();
								image.src = url;
								image.onload = () => {
									if (!doesImageMeetSizeRestrictions(image, restrictions)) {
										const dialogId = nanoid();
										dispatch(
											pushDialog({
												id: dialogId,
												component: createComponentId('ImageCropDialog'),
												props: {
													path: url,
													restrictions,
													onCrop: (blob: Blob) => {
														dispatch(popDialog({ id: dialogId }));
														uppy.setFileState(file.id, {
															...file.meta,
															source: 'crop',
															name: file.name,
															type: blob.type,
															data: blob
														});
														callback?.();
													}
												}
											})
										);
									} else {
										callback?.();
									}
								};
							},
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

	const handleRemoveImage = () => {
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
			>
				{menuOptions}
			</Menu>
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
									{imageInfo?.size ? `${imageInfo.size} Kb` : ''}
								</Typography>
								<Box>
									<Tooltip title={<FormattedMessage defaultMessage="Replace" />}>
										<IconButton
											size="small"
											ref={addMenuButtonRef}
											disabled={readonly}
											autoFocus={autoFocus}
											onClick={() => {
												setAddMenuOpen(true);
											}}
										>
											<EditOutlined />
										</IconButton>
									</Tooltip>
									<Tooltip title={<FormattedMessage defaultMessage="Download" />}>
										<IconButton size="small" onClick={() => downloadMedia(guestBase, value)}>
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
					>
						{menuOptions}
					</Box>
				)}
			</FormsEngineField>
		</>
	);
}

export default ImagePicker;
