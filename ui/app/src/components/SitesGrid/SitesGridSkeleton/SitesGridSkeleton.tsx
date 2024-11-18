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

import { useSitesGridStyles } from '../styles';
import Grid from '@mui/material/Grid2';
import { SiteCardSkeleton } from '../../SiteCard/SiteCardSkeleton/SiteCardSkeleton';
import React from 'react';

interface SitesGridSkeletonProps {
  numOfItems?: number;
  currentView: 'grid' | 'list';
}

export function SitesGridSkeleton(props: SitesGridSkeletonProps) {
  const { classes } = useSitesGridStyles();
  const { numOfItems = 5, currentView } = props;
  const items = new Array(numOfItems).fill(null);
  return (
    <section className={classes.root}>
      <Grid container spacing={3}>
        {items.map((num, i) => (
          <Grid key={i}>
            <SiteCardSkeleton compact={currentView === 'list'} />
          </Grid>
        ))}
      </Grid>
    </section>
  );
}

export default SitesGridSkeleton;
