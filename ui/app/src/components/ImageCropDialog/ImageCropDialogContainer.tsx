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

import { DialogBody } from '../DialogBody';
import { DialogFooter } from '../DialogFooter';
import { useRef, useState } from 'react';
import type { ImageCropDialogProps } from './types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import useSpreadState from '../../hooks/useSpreadState';
import Typography from '@mui/material/Typography';
import { Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { uploadFile } from '../../services/content';

import TextField from '@mui/material/TextField';
import CachedIcon from '@mui/icons-material/Cached';
import { getFileNameFromPath } from '../../utils/path';
import { pushDialog } from '../../state/actions/dialogStack';
import { useDispatch } from 'react-redux';
import { createComponentId } from '../../utils/system';

export function ImageCropDialogContainer(props: ImageCropDialogProps) {
	// TODO: writeContent rename prop
	const { path, onCrop, restrictions, writeContent, onClose } = props;
	const cropperRef = useRef<CropperRef>(null);
	const siteId = useActiveSiteId();
	const [overwriteState, setOverwriteState] = useSpreadState<{
		validate: boolean;
		rename: boolean;
		overwrite: boolean;
		blobToWrite: Blob | null;
		fileName: string;
	}>({
		validate: false,
		rename: false,
		overwrite: false,
		blobToWrite: null,
		fileName: getFileNameFromPath(path)
	});
	const [coordinates, setCoordinates] = useState(null);
	const dispatch = useDispatch();

	const onSubmit = (newPath?: string) => {
		const cropper = cropperRef.current;
		if (!cropper) return;

		const croppedCanvas = cropper.getCanvas();
		croppedCanvas.toBlob(
			(blob) => {
				if (!blob) return;
				if (writeContent && !overwriteState?.validate) {
					setOverwriteState({
						validate: true,
						blobToWrite: blob
					});
				} else {
					onCrop?.(blob, newPath);
				}
			},
			'image/jpeg',
			1
		);
	};

	const onChange = (cropper: CropperRef) => {
		setCoordinates(cropper.getCoordinates());
	};

	const onWriteContent = (writePath: string) => {
		const fileName = getFileNameFromPath(writePath);
		const formData = new FormData();
		formData.append('file', overwriteState.blobToWrite, fileName);
		formData.append('path', writePath);
		uploadFile(siteId, formData).subscribe({
			next: () => {
				onSubmit(writePath !== path ? writePath : null);
			},
			error: ({ response }) => {
				dispatch(
					pushDialog({
						component: createComponentId('ErrorDialog'),
						props: { error: response?.response }
					})
				);
			}
		});
	};

	const onRename = () => {
		if (!overwriteState.rename) {
			setOverwriteState({ rename: true });
		} else {
			const newFileName = overwriteState.fileName;
			const newPath = path.replace(getFileNameFromPath(path), newFileName);
			onWriteContent(newPath);
		}
	};

	return (
		<>
			<DialogBody>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 8 }}>
						<Box maxHeight={600}>
							<Cropper
								ref={cropperRef}
								className="example__cropper"
								backgroundClassName="example__cropper-background"
								src={path}
								minHeight={restrictions?.height ?? restrictions?.minHeight}
								minWidth={restrictions?.width ?? restrictions?.minWidth}
								maxHeight={restrictions?.height ?? restrictions?.maxHeight}
								maxWidth={restrictions?.width ?? restrictions?.maxWidth}
								stencilProps={{
									handlers: !(restrictions?.height && restrictions?.width)
								}}
								onChange={onChange}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, sm: 4 }} rowSpacing={2} container direction="column">
						<FormControl>
							<TextField
								label={<FormattedMessage defaultMessage="Width" />}
								slotProps={{ inputLabel: { shrink: true } }}
								variant="outlined"
								disabled
								value={coordinates?.width ?? ''}
							/>
						</FormControl>
						<FormControl>
							<TextField
								label={<FormattedMessage defaultMessage="Height" />}
								slotProps={{ inputLabel: { shrink: true } }}
								variant="outlined"
								disabled
								value={coordinates?.height ?? ''}
							/>
						</FormControl>
						<FormControl>
							<Button
								onClick={() => {
									setCoordinates(null);
								}}
								startIcon={<CachedIcon />}
							>
								<FormattedMessage defaultMessage="Reset" />
							</Button>
						</FormControl>
					</Grid>
				</Grid>
			</DialogBody>
			<DialogFooter>
				{!overwriteState.validate && (
					<SecondaryButton onClick={(e) => onClose?.(e, null)}>
						<FormattedMessage defaultMessage="Cancel" />
					</SecondaryButton>
				)}
				{overwriteState.validate ? (
					<>
						{overwriteState?.rename ? (
							<FormControl>
								<TextField
									size="small"
									label={<FormattedMessage defaultMessage="Width" />}
									slotProps={{ inputLabel: { shrink: true } }}
									variant="outlined"
									value={overwriteState.fileName}
									onChange={(e) => setOverwriteState({ fileName: e.target.value })}
								/>
							</FormControl>
						) : (
							<>
								<Typography>
									<FormattedMessage defaultMessage="File already exists. Do you want to overwrite it?" />
								</Typography>
								<PrimaryButton onClick={() => onWriteContent(path)}>
									<FormattedMessage defaultMessage="Overwrite" />
								</PrimaryButton>
							</>
						)}

						<PrimaryButton
							onClick={onRename}
							disabled={overwriteState.rename && overwriteState.fileName === getFileNameFromPath(path)}
						>
							<FormattedMessage defaultMessage="Rename" />
						</PrimaryButton>
						<SecondaryButton onClick={(e) => onClose?.(e, null)}>
							<FormattedMessage defaultMessage="Cancel" />
						</SecondaryButton>
					</>
				) : (
					<PrimaryButton disabled={!coordinates?.width || !coordinates?.height} onClick={() => onSubmit()}>
						<FormattedMessage defaultMessage="Crop" />
					</PrimaryButton>
				)}
			</DialogFooter>
		</>
	);
}

export default ImageCropDialogContainer;

// TODO:
// 	- validate crop state, if no selection, disable crop submit button.
//  - preview cropped image (?)
