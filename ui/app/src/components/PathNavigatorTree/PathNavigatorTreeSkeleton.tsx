/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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
import Skeleton from '@material-ui/lab/Skeleton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import PathNavigatorTreeSkeletonItem from './PathNavigatorTreeSkeletonItem';

// type PathNavigatorSkeletonClassKey = 'skeletonRoot' | 'skeletonHeader' | 'skeletonBody' | 'skeletonBodyItem' | 'childrenRail';

interface PathNavigatorSkeletonProps {
  numOfItems?: number;
  showChildrenRail?: boolean;
}

const useStyles = makeStyles((theme) =>
  createStyles({
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
    skeletonBodyItem: { display: 'flex', padding: '5px 5px' }
  })
);

function PathNavigatorSkeletonTree({ numOfItems = 5 }: PathNavigatorSkeletonProps) {
  const classes = useStyles();
  return (
    <section className={classes.skeletonRoot}>
      <header className={classes.skeletonHeader}>
        <Skeleton variant="rect" width="20px" />
        <Skeleton variant="text" style={{ margin: '0 10px', width: '100%' }} />
        <Skeleton variant="circle" width="20px" />
      </header>
      <section className={classes.skeletonBody}>
        {new Array(numOfItems).fill(null).map((_, index) => (
          <PathNavigatorTreeSkeletonItem classes={{ root: classes.skeletonBodyItem }} key={index} />
        ))}
      </section>
    </section>
  );
}

export default PathNavigatorSkeletonTree;
