/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { useStyles } from './styles';
import ListItem from '@material-ui/core/ListItem';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';
import { rand } from './utils';
import React from 'react';

function PathNavigatorSkeletonItem() {
  const classes = useStyles();
  return (
    <ListItem className={classes.navItem} style={{ height: '25px' }}>
      <Skeleton animation="wave" variant="circle" className={classes.typeIcon} height={15} width={15} />
      <Typography variant="body2" style={{ width: `${rand(70, 80)}%` }}>
        <Skeleton animation="wave" width="100%" />
      </Typography>
    </ListItem>
  );
}

export default PathNavigatorSkeletonItem;
