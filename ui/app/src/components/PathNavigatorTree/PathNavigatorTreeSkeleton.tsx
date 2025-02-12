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

import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import PathNavigatorTreeSkeletonItem from './PathNavigatorTreeSkeletonItem';
import Box from '@mui/material/Box';

// type PathNavigatorSkeletonClassKey = 'skeletonRoot' | 'skeletonHeader' | 'skeletonBody' | 'skeletonBodyItem' | 'childrenRail';

interface PathNavigatorSkeletonProps {
	numOfItems?: number;
}

function PathNavigatorSkeletonTree({ numOfItems = 5 }: PathNavigatorSkeletonProps) {
	return (
		<Box component="section" sx={{ margin: '10px 0' }}>
			<Box component="header" sx={{ display: 'flex', marginBottom: '5px', padding: '0 10px' }}>
				<Skeleton variant="rectangular" width="20px" />
				<Skeleton variant="text" style={{ margin: '0 10px', width: '100%' }} />
				<Skeleton variant="circular" width="20px" />
			</Box>
			<Box component="section" sx={{ paddingLeft: '5px' }}>
				{new Array(numOfItems).fill(null).map((_, index) => (
					<PathNavigatorTreeSkeletonItem key={index} />
				))}
			</Box>
		</Box>
	);
}

export default PathNavigatorSkeletonTree;
