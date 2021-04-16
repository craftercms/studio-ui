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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiResponse } from '../../models/ApiResponse';
import { PagedArray } from '../../models/PagedArray';
import { Site } from '../../models/Site';
import { fetchAll, trash } from '../../services/sites';
import { useLogicResource } from '../../utils/hooks';
import { ErrorBoundary } from '../SystemStatus/ErrorBoundary';
import SitesGridUI, { SkeletonSitesGrid } from './SitesGridUI';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';

interface SitesGridProps {
  limit?: number;
}

const translations = defineMessages({
  siteDeleted: {
    id: 'sitesGrid.siteDeleted',
    defaultMessage: 'Site deleted successfully'
  }
});

export default function SitesGrid(props: SitesGridProps) {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(props.limit ?? 10);
  const [error, setError] = useState<ApiResponse>();
  const [fetching, setFetching] = useState(false);

  const [sites, setSites] = useState<PagedArray<Site>>();

  const fetchSites = useCallback(() => {
    setFetching(true);
    fetchAll({ limit, offset }).subscribe(
      (sites) => {
        setSites(sites);
        setFetching(false);
      },
      ({ response }) => {
        setFetching(false);
        setError(response);
      }
    );
  }, [limit, offset]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const resource = useLogicResource<
    PagedArray<Site>,
    { sites: PagedArray<Site>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ sites, error, fetching }), [sites, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.sites) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.sites,
      errorSelector: () => error
    }
  );

  const onSiteClick = (site: Site) => {
    console.log(site);
  };

  const onDeleteSiteClick = (site: Site) => {
    trash(site.id).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.siteDeleted)
          })
        );
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onEditSiteClick = (site: Site) => {
    console.log(site);
  };

  const onChangePage = (page: number) => {
    setOffset(page * limit);
  };

  const onChangeRowsPerPage = (e) => {
    setLimit(e.target.value);
  };

  return (
    <ErrorBoundary>
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <SkeletonSitesGrid numOfItems={limit} />
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: <FormattedMessage id="sitesGrid.emptyStateMessage" defaultMessage="No Sites Found" />
          }
        }}
      >
        <SitesGridUI
          resource={resource}
          onSiteClick={onSiteClick}
          onDeleteSiteClick={onDeleteSiteClick}
          onEditSiteClick={onEditSiteClick}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      </SuspenseWithEmptyState>
    </ErrorBoundary>
  );
}
