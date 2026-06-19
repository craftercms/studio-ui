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

import React, { useEffect, useRef } from 'react';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { useTheme } from '@mui/material/styles';
import { fetchPreviewImage } from '../../../services/contentTypes';
import CardMedia, { CardMediaProps } from '@mui/material/CardMedia';
import { consolidateSx } from '../../../utils/system';
import Skeleton from '@mui/material/Skeleton';

export interface ContentTypeCardMediaProps extends CardMediaProps {
	typeId: string;
	skeleton?: boolean;
}

export function TypeCardMedia(props: ContentTypeCardMediaProps) {
	const { typeId, sx, skeleton, ...cardMediaProps } = props;
	const elementRef = useRef<HTMLImageElement>(undefined);
	const siteId = useActiveSiteId();
	const theme = useTheme();
	useEffect(() => {
		if (!typeId) return;
		const sub = fetchPreviewImage(siteId, typeId).subscribe((response) => {
			const img = elementRef.current;
			const imgUrl = URL.createObjectURL(new Blob([response.response]));
			img.src = imgUrl;
			img.onload = () => {
				// Image has loaded, revoke the object URL to free memory.
				URL.revokeObjectURL(imgUrl);
			};
		});
		return () => {
			sub.unsubscribe();
		};
	}, [siteId, typeId]);
	return (
		<CardMedia
			sx={consolidateSx(
				{
					height: '200px',
					display: 'block',
					bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
					objectFit: 'cover'
				},
				skeleton ? { transform: 'none' } : { '&:not([src])': { opacity: 0 } },
				sx
			)}
			{...cardMediaProps}
			ref={elementRef}
			component={skeleton ? Skeleton : 'img'}
		/>
	);
}

export default TypeCardMedia;
