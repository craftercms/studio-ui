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
import TextField from '@mui/material/TextField';
import CachedIcon from '@mui/icons-material/Cached';
import useSpreadState from '../../hooks/useSpreadState';
import Typography from '@mui/material/Typography';
import { Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import useActiveSiteId from '../../hooks/useActiveSiteId';

export function ImageCropDialogContainer(props: ImageCropDialogProps) {
	// TODO: writeContent rename prop
	const { path, onCrop, restrictions, writeContent, onClose } = props;
	const cropperRef = useRef<CropperRef>(null);
	const [overwriteState, setOverwriteState] = useSpreadState<{
		validate: boolean;
		rename: boolean;
		overwrite: boolean;
		blobToWrite: Blob | null;
	}>({
		validate: false,
		rename: false,
		overwrite: false,
		blobToWrite: null
	});
	const [coordinates, setCoordinates] = useState(null);

	const onSubmit = () => {
		const cropper = cropperRef.current;
		if (cropper) {
			const croppedCanvas = cropper.getCanvas();
			console.log('base64', croppedCanvas?.toDataURL());
			croppedCanvas.toBlob(
				(blob) => {
					if (writeContent) {
						setOverwriteState({
							validate: true,
							blobToWrite: blob
						});
					} else {
						onCrop?.(blob);
					}
				},
				'image/jpeg',
				1
			);
		}
	};

	const onChange = (cropper: CropperRef) => {
		setCoordinates(cropper.getCoordinates());
	};

	const onWriteContent = () => {};

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
									// TODO: this should be the initial state
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
						<Typography>
							<FormattedMessage defaultMessage="File already exists. Do you want to overwrite it?" />
						</Typography>
						<PrimaryButton onClick={() => onWriteContent()}>
							<FormattedMessage defaultMessage="Overwrite" />
						</PrimaryButton>
						<PrimaryButton onClick={() => setOverwriteState({ rename: true })}>
							<FormattedMessage defaultMessage="Rename" />
						</PrimaryButton>
						<SecondaryButton onClick={(e) => onClose?.(e, null)}>
							<FormattedMessage defaultMessage="Cancel" />
						</SecondaryButton>
					</>
				) : (
					<PrimaryButton onClick={() => onSubmit()}>
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
