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
import type { ImageEditorDialogProps } from './types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import { useSpreadState } from '../../hooks/useSpreadState';
import Typography from '@mui/material/Typography';
import { Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { uploadFile } from '../../services/content';
import TextField from '@mui/material/TextField';
import CachedIcon from '@mui/icons-material/Cached';
import { getFileExtension, getFileNameFromPath, removeExtension } from '../../utils/path';
import { pushDialog } from '../../state/actions/dialogStack';
import { useDispatch } from 'react-redux';
import { createComponentId } from '../../utils/system';
import { applyAssetNameRules } from '../../utils/content';
import { isEmpty } from '../../utils/string';
import { Slider } from '@mui/material';
import AdjustableBackground from './AdjustableBackground';
import ActionsBar from './ActionsBar';

export type EditorMode = 'crop' | 'saturation' | 'brightness' | 'contrast' | null;
const sliderModes = ['saturation', 'brightness', 'contrast'];
type SliderMode = (typeof sliderModes)[number];
type Adjustments = Record<SliderMode, number>;
const initialAdjustments: Adjustments = { brightness: 0, saturation: 0, contrast: 0 };

export function ImageEditorDialogContainer(props: ImageEditorDialogProps) {
	const {
		path,
		mimeType,
		onCrop,
		restrictions,
		writeContent,
		tools = ['crop', 'rotate', 'flip', 'adjustments'],
		onClose
	} = props;
	const cropperRef = useRef<CropperRef | null>(null);
	const siteId = useActiveSiteId();
	const fileExtension = getFileExtension(path);
	const fileNameWithoutExtension = removeExtension(getFileNameFromPath(path));
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
		fileName: fileNameWithoutExtension
	});
	const [coordinates, setCoordinates] = useState(null);
	const dispatch = useDispatch();
	const [editorMode, setEditorMode] = useState<EditorMode>(tools.includes('crop') ? 'crop' : null);
	const [adjustments, setAdjustments] = useState<Adjustments>(initialAdjustments);
	const cropperEnabled = editorMode && editorMode === 'crop';
	const isSliderMode = editorMode && sliderModes.includes(editorMode);

	const onSubmit = (newPath?: string) => {
		const cropper = cropperRef.current;
		if (!cropper) return;

		const croppedCanvas = cropper.getCanvas();
		const ext = (fileExtension || '').toLowerCase();
		const mime =
			mimeType ??
			(ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg');
		const quality = mime === 'image/jpeg' ? 0.92 : undefined;
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
			mime,
			quality
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
			const newFileName = `${overwriteState.fileName}.${fileExtension}`;
			const newPath = path.replace(getFileNameFromPath(path), newFileName);
			onWriteContent(newPath);
		}
	};

	const onReset = () => {
		setCoordinates({
			height: restrictions?.height ?? restrictions?.maxHeight,
			width: restrictions?.width ?? restrictions?.maxWidth
		});
		setAdjustments(initialAdjustments);
		cropperRef.current?.reset();
	};

	const rotate = (angle: number) => {
		if (cropperRef.current) {
			cropperRef.current.rotateImage(angle);
		}
	};

	const flip = (horizontal: boolean, vertical: boolean) => {
		if (cropperRef.current) {
			cropperRef.current.flipImage(horizontal, vertical);
		}
	};

	const onChangeAdjustment = (value: number) => {
		if (isSliderMode) {
			setAdjustments((previousValue) => ({
				...previousValue,
				[editorMode]: value / 100
			}));
		}
	};

	return (
		<>
			<DialogBody>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 9 }}>
						<Box maxHeight={600}>
							<Cropper
								ref={cropperRef}
								src={path}
								minHeight={restrictions?.height ?? restrictions?.minHeight}
								minWidth={restrictions?.width ?? restrictions?.minWidth}
								maxHeight={restrictions?.height ?? restrictions?.maxHeight}
								maxWidth={restrictions?.width ?? restrictions?.maxWidth}
								stencilProps={{
									handlers: cropperEnabled && !(restrictions?.height && restrictions?.width),
									movable: cropperEnabled,
									resizable: cropperEnabled,
									lines: cropperEnabled
								}}
								onUpdate={onChange}
								backgroundComponent={AdjustableBackground}
								backgroundProps={adjustments}
								backgroundWrapperProps={{
									scaleImage: cropperEnabled,
									moveImage: cropperEnabled
								}}
							/>
						</Box>
						{isSliderMode && (
							<Box sx={{ px: 1, mt: 1 }}>
								<Slider
									size="small"
									min={-100}
									max={100}
									marks={[{ value: 0 }]}
									value={isSliderMode ? Math.trunc(adjustments[editorMode] * 100) : 0}
									aria-label="Slider"
									valueLabelDisplay="auto"
									onChange={(_, value) => onChangeAdjustment(value as number)}
								/>
							</Box>
						)}
						{!tools.every((tool) => tool === 'crop') && (
							<ActionsBar
								tools={tools}
								currentMode={editorMode}
								setMode={setEditorMode}
								onRotate={rotate}
								onFlip={flip}
							/>
						)}
					</Grid>
					<Grid size={{ xs: 12, sm: 3 }} rowSpacing={2} container direction="column">
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
							<Button onClick={onReset} startIcon={<CachedIcon />}>
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
									slotProps={{ inputLabel: { shrink: true } }}
									variant="outlined"
									value={overwriteState.fileName}
									onChange={(e) => setOverwriteState({ fileName: applyAssetNameRules(e.target.value) })}
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
							disabled={
								overwriteState.rename &&
								(isEmpty(overwriteState.fileName) || overwriteState.fileName === fileNameWithoutExtension)
							}
						>
							<FormattedMessage defaultMessage="Rename" />
						</PrimaryButton>
						<SecondaryButton onClick={(e) => onClose?.(e, null)}>
							<FormattedMessage defaultMessage="Cancel" />
						</SecondaryButton>
					</>
				) : (
					<PrimaryButton disabled={!coordinates?.width || !coordinates?.height} onClick={() => onSubmit()}>
						<FormattedMessage defaultMessage="Accept" />
					</PrimaryButton>
				)}
			</DialogFooter>
		</>
	);
}

export default ImageEditorDialogContainer;
