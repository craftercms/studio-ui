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

interface SitesGridUIProps {
  resource: Resource<PagedArray<Site>>;
  onSiteClick(site: Site): void;
}

export default function SitesGridUI(props: SitesGridUIProps) {
  const sites = props.resource.read();

  return (
    <Grid container spacing={3}>
      {sites.map((site) => (
        <Grid item key={site.id}>
          <SiteCard site={site} onSiteClick={props.onSiteClick} />
        </Grid>
      ))}
    </Grid>
  );
}
