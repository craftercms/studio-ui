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
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import { useCardStyles } from './styles';
import Skeleton from '@material-ui/lab/Skeleton';

export default function MediaSkeletonCard() {
  const classes = useCardStyles();
  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.cardHeader}
        avatar={<Skeleton variant="circle" width={24} height={24} />}
        title={<Skeleton animation="wave" height={20} width="100%" />}
      />
      <Skeleton animation="wave" variant="rect" className={classes.media} />
    </Card>
  );
}
