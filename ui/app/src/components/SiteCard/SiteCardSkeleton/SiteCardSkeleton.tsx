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

import { useSiteCardStyles } from '../../SitesGrid/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import CardActions from '@mui/material/CardActions';
import React from 'react';
import clsx from 'clsx';

export interface SiteCardSkeletonProps {
  compact?: boolean;
}

export function SiteCardSkeleton(props: SiteCardSkeletonProps) {
  const classes = useSiteCardStyles();
  return (
    <Card className={clsx(classes.card, props.compact && 'compact')}>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton animation="wave" height={20} width="40%" />}
        className={classes.cardHeader}
        subheader={<Skeleton animation="wave" height={20} width="80%" />}
      />
      {!props.compact && <Skeleton animation="wave" variant="rectangular" className={classes.media} />}
      <CardActions disableSpacing>
        <Skeleton variant="circular" width={40} height={40} style={{ marginRight: '10px' }} />
        <Skeleton variant="circular" width={40} height={40} />
      </CardActions>
    </Card>
  );
}

export default SiteCardSkeleton;
