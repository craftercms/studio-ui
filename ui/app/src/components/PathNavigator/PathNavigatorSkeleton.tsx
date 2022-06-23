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
import { makeStyles } from 'tss-react/mui';

// type PathNavigatorSkeletonClassKey = 'skeletonRoot' | 'skeletonHeader' | 'skeletonBody' | 'skeletonBodyItem' | 'childrenRail';

interface PathNavigatorSkeletonProps {
  numOfItems?: number;
}

const useStyles = makeStyles()((theme) => ({
  skeletonRoot: {
    margin: '10px 0'
  },
  skeletonHeader: {
    display: 'flex',
    marginBottom: '5px',
    padding: '0 10px'
  },
  skeletonBody: {
    paddingLeft: '5px'
  },
  skeletonBodyItem: { display: 'flex', padding: '5px 5px' },
  childrenRail: {
    marginLeft: 10,
    borderLeft: `3px solid ${theme.palette.divider}`
  }
}));

function PathNavigatorSkeleton({ numOfItems = 5 }: PathNavigatorSkeletonProps) {
  const { classes, cx } = useStyles();
  return (
    <section className={classes.skeletonRoot}>
      <header className={classes.skeletonHeader}>
        <Skeleton variant="rectangular" width="20px" />
        <Skeleton variant="text" style={{ margin: '0 10px', width: `${rand(40, 70)}%` }} />
      </header>
      <section className={cx(classes.skeletonBody)}>
        <div className={classes.skeletonBodyItem}>
          <Skeleton variant="text" style={{ width: `${rand(80, 150)}px` }} />
        </div>
        {new Array(numOfItems).fill(null).map((_, index) => (
          <div className={classes.skeletonBodyItem} key={index}>
            <Skeleton variant="circular" width="20px" />
            <Skeleton variant="text" style={{ margin: '0 10px', width: `${rand(60, 95)}%` }} />
          </div>
        ))}
        <div className={classes.skeletonBodyItem}>
          <Skeleton variant="text" style={{ width: `120px` }} />
        </div>
      </section>
    </section>
  );
}

export default PathNavigatorSkeleton;
