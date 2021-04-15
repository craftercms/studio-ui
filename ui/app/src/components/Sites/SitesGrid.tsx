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

import React, { Suspense, useMemo, useState } from 'react';
import { ApiResponse } from '../../models/ApiResponse';
import { PagedArray } from '../../models/PagedArray';
import { Site } from '../../models/Site';
import { fetchAll } from '../../services/sites';
import { useLogicResource, useMount } from '../../utils/hooks';
import { ErrorBoundary } from '../SystemStatus/ErrorBoundary';
import SitesGridUI from './SitesGridUI';

interface SitesGridProps {
  limit?: number;
}

export default function SitesGrid(props: SitesGridProps) {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(props.limit ?? 10);
  const [error, setError] = useState<ApiResponse>();
  const [fetching, setFetching] = useState(false);

  const [sites, setSites] = useState<PagedArray<Site>>();

  const fetchSites = () => {
    fetchAll({ limit, offset }).subscribe((sites) => {
      setSites(sites);
    });
  };

  useMount(() => {
    fetchSites();
  });

  const resource = useLogicResource<
    PagedArray<Site>,
    { sites: PagedArray<Site>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ sites, error, fetching }), [sites, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.sites) && Boolean(source.sites.length) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => resource.complete && !fetching,
      resultSelector: (source) => source.sites,
      errorSelector: () => error
    }
  );

  const onSiteClick = (site: Site) => {
    console.log(site);
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<></>}>
        <SitesGridUI resource={resource} onSiteClick={onSiteClick} />
      </Suspense>
    </ErrorBoundary>
  );
}
