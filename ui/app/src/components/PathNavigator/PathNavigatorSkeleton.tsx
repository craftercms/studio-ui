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
import { rand } from './utils';
import Box from '@mui/material/Box';
import NavLoader from './NavLoader';

// type PathNavigatorSkeletonClassKey = 'skeletonRoot' | 'skeletonHeader' | 'skeletonBody' | 'skeletonBodyItem' | 'childrenRail';

interface PathNavigatorSkeletonProps {
  numOfItems?: number;
  renderBody?: boolean;
}

const PathNavigatorSkeleton = React.memo(({ numOfItems = 5, renderBody = false }: PathNavigatorSkeletonProps) => (
  <div>
    <Box
      component="header"
      sx={{
        display: 'flex',
        padding: '12px 18px',
        alignItems: 'center'
      }}
    >
      <Skeleton variant="rectangular" width="20px" />
      <Skeleton variant="text" style={{ margin: '0 10px', width: `${rand(40, 70)}%` }} />
    </Box>
    {renderBody && <NavLoader numOfItems={numOfItems} />}
  </div>
));

export default PathNavigatorSkeleton;
