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

import Grid from '@material-ui/core/Grid';
import React from 'react';
import { Resource } from '../../models/Resource';
import { Site } from '../../models/Site';
import SiteCard, { SiteCardSkeleton } from './SiteCard';
import { createStyles, makeStyles } from '@material-ui/core/styles';

interface SitesGridUIProps {
  resource: Resource<Site[]>;
  onSiteClick(site: Site): void;
  onDeleteSiteClick(site: Site): void;
  onEditSiteClick(site: Site): void;
}

const styles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column'
    },
    paginationRoot: {
      '&:last-child': {
        alignSelf: 'flex-end',
        marginTop: '20px'
      }
    }
  })
);

export default function SitesGridUI(props: SitesGridUIProps) {
  const { resource, onSiteClick, onDeleteSiteClick, onEditSiteClick } = props;
  const sites = resource.read();
  const classes = styles();

  return (
    <section className={classes.root}>
      <Grid container spacing={3}>
        {sites.map((site) => (
          <Grid item key={site.id}>
            <SiteCard
              site={site}
              onSiteClick={onSiteClick}
              onDeleteSiteClick={onDeleteSiteClick}
              onEditSiteClick={onEditSiteClick}
            />
          </Grid>
        ))}
      </Grid>
    </section>
  );
}

interface SkeletonSitesGridProps {
  numOfItems?: number;
}

export function SkeletonSitesGrid(props: SkeletonSitesGridProps) {
  const classes = styles();
  const { numOfItems = 5 } = props;
  const items = new Array(numOfItems).fill(null);
  return (
    <section className={classes.root}>
      <Grid container spacing={3}>
        {items.map((num, i) => (
          <Grid item key={i}>
            <SiteCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </section>
  );
}
