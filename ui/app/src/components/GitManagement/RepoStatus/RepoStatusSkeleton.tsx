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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { rand } from '../../PathNavigator/utils';

export function RepoStatusSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <section style={{ width: '100%' }}>
        <Typography variant="h5">
          <Skeleton variant="text" width="30%" />
        </Typography>
        {new Array(rand(5, 15)).fill(null).map((_, index) => (
          <Skeleton key={index} variant="text" width={`${rand(20, 90)}%`} style={{ margin: '10px 0' }} />
        ))}
      </section>
    </Box>
  );
}

export default RepoStatusSkeleton;
