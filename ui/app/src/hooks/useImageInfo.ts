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

export function useImageInfo(url: string): {
	imageInfo: { width: number; height: number; contentType?: string; size?: number } | null;
	isFetchingDimensions: boolean;
	isFetchingMetadata: boolean;
	errorDimensions: Error | null;
	errorMetadata: Error | null;
} {
	const [imageInfo, setImageInfo] = useSpreadState<{
		width: number;
		height: number;
		contentType?: string;
		size?: number;
	} | null>(null);
	const [isFetchingDimensions, setIsFetchingDimensions] = useState<boolean>(false);
	const [isFetchingMetadata, setIsFetchingMetadata] = useState<boolean>(false);
	const [errorDimensions, setErrorDimensions] = useState<Error | null>(null);
	const [errorMetadata, setErrorMetadata] = useState<Error | null>(null);

	useEffect(() => {
		if (url) {
			setIsFetchingDimensions(true);
			setErrorDimensions(null);
			const img = new Image();
			img.onload = () => {
				setImageInfo({
					width: img.width,
					height: img.height
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
			setImageInfo(null);
		}
	}, [url, setImageInfo]);

	return { imageInfo, isFetchingDimensions, isFetchingMetadata, errorDimensions, errorMetadata };
}

export default useImageInfo;
