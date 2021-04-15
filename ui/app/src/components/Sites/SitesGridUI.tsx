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
import { PagedArray } from '../../models/PagedArray';
import { Site } from '../../models/Site';
import SiteCard from './SiteCard';
import { createStyles, makeStyles } from '@material-ui/core/styles';

interface SitesGridUIProps {
  resource: Resource<PagedArray<Site>>;
  onSiteClick(site: Site): void;
}

const styles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(402px, max-content))',
      gridGap: '20px',
      padding: 'initial',
      justifyContent: 'center'
    }
  })
);

export default function SitesGridUI(props: SitesGridUIProps) {
  const sites = props.resource.read();
  const classes = styles();

  return (
    <Grid container spacing={3}>
      {sites.map((site) => (
        <Grid item>
          <SiteCard site={site} onSiteClick={props.onSiteClick} key={site.id} />
        </Grid>
      ))}
    </Grid>
  );

  // return (
  //   <section className={classes.container}>
  //     {sites.map((site) => (
  //       <SiteCard site={site} onSiteClick={props.onSiteClick} key={site.id} />
  //     ))}
  //   </section>
  // );
}
