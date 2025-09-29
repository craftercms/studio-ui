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

import { useEffect, useState } from 'react';
import useSpreadState from './useSpreadState';

interface ImageInfo {
	width: number | null;
	height: number | null;
	contentType?: string | null;
	size?: number | null; // size in KB
}
const imageInfoInitialState: ImageInfo = {
	width: null,
	height: null,
	contentType: null,
	size: null
};

/** Retrieves image dimensions and metadata (content type and size in KB) from a given URL
 *
 * @param url Image URL
 * @returns Object containing image info, loading states, and error states
 */
export function useImageInfo(url: string): {
	imageInfo: ImageInfo;
	isFetchingDimensions: boolean;
	isFetchingMetadata: boolean;
	errorDimensions: Error | null;
	errorMetadata: Error | null;
} {
	const [imageInfo, setImageInfo] = useSpreadState<ImageInfo>(imageInfoInitialState);
	const [isFetchingDimensions, setIsFetchingDimensions] = useState<boolean>(false);
	const [isFetchingMetadata, setIsFetchingMetadata] = useState<boolean>(false);
	const [errorDimensions, setErrorDimensions] = useState<Error | null>(null);
	const [errorMetadata, setErrorMetadata] = useState<Error | null>(null);

	useEffect(() => {
		if (url) {
			// We need to fetch dimensions and metadata separately
			// because the Image object doesn't provide metadata like content type and size,
			// and the fetch API doesn't provide dimensions
			setIsFetchingDimensions(true);
			setErrorDimensions(null);
			const img = new Image();
			img.onload = () => {
				setImageInfo({
					width: img.naturalWidth,
					height: img.naturalHeight
				});
				setIsFetchingDimensions(false);
			};
			img.onerror = () => {
				setErrorDimensions(new Error('Image failed to load'));
				setIsFetchingDimensions(false);
			};
			img.src = url;

			setIsFetchingMetadata(true);
			setErrorMetadata(null);
			fetch(url)
				.then((response) => {
					const contentType = response.headers.get('Content-Type');
					setImageInfo({ contentType });
					response.blob().then((blob) => {
						setIsFetchingMetadata(false);
						const sizeKb = Math.round(blob.size / 1024);
						setImageInfo({ size: sizeKb });
					});
				})
				.catch((error) => {
					setErrorMetadata(error);
					setIsFetchingMetadata(false);
				});
		} else {
			setImageInfo(imageInfoInitialState);
			setIsFetchingDimensions(false);
			setIsFetchingMetadata(false);
			setErrorDimensions(null);
			setErrorMetadata(null);
		}
	}, [url, setImageInfo]);

	return { imageInfo, isFetchingDimensions, isFetchingMetadata, errorDimensions, errorMetadata };
}

export default useImageInfo;
