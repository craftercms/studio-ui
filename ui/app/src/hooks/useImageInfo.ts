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

import { useEffect } from 'react';
import useSpreadState from './useSpreadState';

export function useImageInfo(url: string) {
	const [imageInfo, setImageInfo] = useSpreadState<{
		width: number;
		height: number;
		contentType?: string;
		size?: number;
	}>(null);
	useEffect(() => {
		if (url) {
			const img = new Image();
			img.onload = () => {
				setImageInfo({
					width: img.width,
					height: img.height
				});
			};
			img.src = url;

			fetch(url).then((response) => {
				const contentType = response.headers.get('Content-Type');
				setImageInfo({ contentType });
				response.blob().then((blob) => {
					const sizeKb = Math.round(blob.size / 1024);
					setImageInfo({ size: sizeKb });
				});
			});
		} else {
			setImageInfo(null);
		}
	}, [url, setImageInfo]);

	return imageInfo;
}

export default useImageInfo;
