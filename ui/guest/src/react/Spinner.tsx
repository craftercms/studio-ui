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

import React from 'react';

export interface SpinnerProps {
	width: number;
	height: number;
	strokeWidth: number;
	className: string;
	strokeLineCap: 'round' | 'butt' | 'square' | 'inherit';
	circleClassName: string;
}

export function Spinner(props: SpinnerProps) {
	const {
		width = 50,
		height = 50,
		strokeWidth = 6,
		className = 'spinner',
		strokeLineCap = 'round',
		circleClassName = 'path'
	} = props;
	return (
		<svg className={className} width={width} height={height} viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
			<circle
				className={circleClassName}
				fill="none"
				strokeWidth={strokeWidth}
				strokeLinecap={strokeLineCap}
				cx="33"
				cy="33"
				r="30"
			/>
		</svg>
	);
}

export default Spinner;
