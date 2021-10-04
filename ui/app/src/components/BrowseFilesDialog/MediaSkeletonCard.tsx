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

import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useCardStyles } from './styles';
import Skeleton from '@mui/material/Skeleton';

export function MediaSkeletonCard() {
  const classes = useCardStyles();
  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.cardHeader}
        avatar={<Skeleton variant="circular" width={24} height={24} />}
        title={<Skeleton animation="wave" height={20} width="100%" />}
      />
      <Skeleton animation="wave" variant="rectangular" className={classes.media} />
    </Card>
  );
}

export default MediaSkeletonCard;
