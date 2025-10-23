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

import { forwardRef } from 'react';
import { CropperRef } from 'react-advanced-cropper';
import { getBackgroundStyle } from 'advanced-cropper';
import { AdjustableImage } from './AdjustableImage';

interface AdjustableBackgroundProps {
	className?: string;
	cropper: CropperRef;
	brightness?: number;
	saturation?: number;
	contrast?: number;
}

/** Util component that helps with the rendering of the background image with adjustments like brightness, saturation and contrast. */
// https://advanced-cropper.github.io/react-advanced-cropper/docs/tutorials/image-editor/
export const AdjustableBackground = forwardRef<HTMLCanvasElement, AdjustableBackgroundProps>((props, ref) => {
	const { className, cropper, brightness = 0, saturation = 0, contrast = 0 } = props;
	const state = cropper.getState();
	const transitions = cropper.getTransitions();
	const image = cropper.getImage();

	const style = image && state ? getBackgroundStyle(image, state, transitions) : {};

	return (
		<AdjustableImage
			src={image?.src}
			brightness={brightness}
			saturation={saturation}
			contrast={contrast}
			ref={ref}
			className={className}
			style={style}
		/>
	);
});

export default AdjustableBackground;
