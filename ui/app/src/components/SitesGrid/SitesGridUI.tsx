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

import Grid from '@mui/material/Grid';
import React from 'react';
import { Resource } from '../../models/Resource';
import { Site } from '../../models/Site';
import SiteCard from './SiteCard';
import { useSitesGridStyles } from './styles';
import LookupTable from '../../models/LookupTable';
import { PublishingStatus } from '../../models/Publishing';

interface SitesGridUIProps {
  resource: Resource<Site[]>;
  onSiteClick(site: Site): void;
  onDeleteSiteClick(site: Site): void;
  onEditSiteClick(site: Site): void;
  onPublishButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, site: Site): void;
  currentView: 'grid' | 'list';
  publishingStatusLookup: LookupTable<PublishingStatus>;
}

export default function SitesGridUI(props: SitesGridUIProps) {
  const {
    resource,
    onSiteClick,
    onDeleteSiteClick,
    onEditSiteClick,
    currentView,
    publishingStatusLookup,
    onPublishButtonClick
  } = props;
  const sites = resource.read();
  const classes = useSitesGridStyles();
  return (
    <section className={classes.root}>
      <Grid container spacing={3}>
        {sites.map((site) => (
          <Grid item key={site.id}>
            <SiteCard
              site={site}
              publishingStatus={publishingStatusLookup[site.id]}
              onSiteClick={onSiteClick}
              onDeleteSiteClick={onDeleteSiteClick}
              onEditSiteClick={onEditSiteClick}
              onPublishButtonClick={onPublishButtonClick}
              compact={currentView === 'list'}
            />
          </Grid>
        ))}
      </Grid>
    </section>
  );
}
