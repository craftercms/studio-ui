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
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import CachedIcon from '@mui/icons-material/Cached';

export function ImageCropDialogContainer(props: ImageCropDialogProps) {
	const { path, onCrop, restrictions } = props;
	const [crop, setCrop] = useState<Crop>();
	const imageRef = useRef<HTMLImageElement>(null);

	const getCroppedCanvas = (image, crop) => {
		const canvas = document.createElement('canvas');
		const pixelRatio = window.devicePixelRatio;
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;
		const ctx = canvas.getContext('2d');

		canvas.width = crop.width * pixelRatio * scaleX;
		canvas.height = crop.height * pixelRatio * scaleY;

		ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		ctx.imageSmoothingQuality = 'high';

		ctx.drawImage(
			image,
			crop.x * scaleX,
			crop.y * scaleY,
			crop.width * scaleX,
			crop.height * scaleY,
			0,
			0,
			crop.width * scaleX,
			crop.height * scaleY
		);
		return canvas;
	};

	const onSubmit = () => {
		const croppedCanvas = getCroppedCanvas(imageRef.current, crop);
		croppedCanvas.toBlob(
			(blob) => {
				onCrop?.(blob);
			},
			'image/jpeg',
			1
		);
	};

	return (
		<>
			<DialogBody>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 8 }}>
						<Box maxHeight={600}>
							<ReactCrop
								crop={crop}
								onChange={(c) => setCrop(c)}
								minHeight={restrictions?.height ?? restrictions?.minHeight}
								minWidth={restrictions?.width ?? restrictions?.minWidth}
								maxHeight={restrictions?.height ?? restrictions?.maxHeight}
								maxWidth={restrictions?.width ?? restrictions?.maxWidth}
							>
								<img src={path} ref={imageRef} />
							</ReactCrop>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, sm: 4 }} rowSpacing={2} container direction="column">
						<FormControl>
							<TextField
								label={<FormattedMessage defaultMessage="Width" />}
								slotProps={{ inputLabel: { shrink: true } }}
								variant="outlined"
								disabled
								value={crop?.width ?? ''}
							/>
						</FormControl>
						<FormControl>
							<TextField
								label={<FormattedMessage defaultMessage="Height" />}
								slotProps={{ inputLabel: { shrink: true } }}
								variant="outlined"
								disabled
								value={crop?.height ?? ''}
							/>
						</FormControl>
						<FormControl>
							<Button
								onClick={() => {
									setCrop(null);
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
				<SecondaryButton>
					<FormattedMessage defaultMessage="Cancel" />
				</SecondaryButton>
				<PrimaryButton onClick={() => onSubmit()}>
					<FormattedMessage defaultMessage="Crop" />
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

export default ImageCropDialogContainer;
