/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { CSSProperties } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { nnou } from '../../utils/object';

export type IFrameClassKey = 'iframe' | 'iframeWithBorder' | 'iframeWithBorderLandscape' | 'iframeWithBorderPortrait';

interface IFrameProps {
	sx?: BoxProps['sx'];
	styles?: Partial<Record<IFrameClassKey, CSSProperties>>;
	url: string;
	title: string;
	width?: string | number;
	height?: string | number;
	className?: string;
	border?: 'portrait' | 'landscape';
	onLoadComplete?(): void;
}

export function IFrame(props: IFrameProps) {
	const { url, title, width, height, border, className, onLoadComplete, sx: sxProp } = props;
	let sx: BoxProps['sx'] = [
		{
			width: '100%',
			maxWidth: '100%',
			border: 'none',
			height: '100%',
			transition: 'width .25s ease, height .25s ease'
		},
		nnou(border) && {
			borderRadius: '20px',
			borderColor: '#000',
			borderStyle: 'solid',
			borderWidth: border === 'landscape' ? '50px 10px' : '10px 50px'
		}
	];
	if (sxProp) {
		sx = sx.concat(sxProp);
	}
	return (
		<Box
			component="iframe"
			style={{ width, height }}
			className={className}
			sx={sx}
			title={title}
			onLoad={onLoadComplete}
			src={url || 'about:blank'}
		/>
	);
}

export default IFrame;
