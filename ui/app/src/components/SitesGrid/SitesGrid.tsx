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

import React, { useMemo } from 'react';
import { Site } from '../../models/Site';
import { trash } from '../../services/sites';
import { useEnv, useLogicResource, usePreviewState, useSitesBranch } from '../../utils/hooks';
import { ErrorBoundary } from '../SystemStatus/ErrorBoundary';
import SitesGridUI from './SitesGridUI';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { showEditSiteDialog } from '../../state/actions/dialogs';
import LookupTable from '../../models/LookupTable';
import { batchActions } from '../../state/actions/misc';
import { fetchSites } from '../../state/reducers/sites';
import { setSiteCookie } from '../../utils/auth';
import { getSystemLink } from '../LauncherSection';
import { SkeletonSitesGrid } from './SkeletonSitesGrid';

interface SitesGridProps {
  currentView: 'grid' | 'list';
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
  const sitesBranch = useSitesBranch();
  const { authoringBase } = useEnv();
  const { previewChoice } = usePreviewState();
  const sitesById = sitesBranch.byId;
  const isFetching = sitesBranch.isFetching;

  const resource = useLogicResource<Site[], { sitesById: LookupTable<Site>; isFetching: boolean }>(
    useMemo(() => ({ sitesById, isFetching }), [sitesById, isFetching]),
    {
      shouldResolve: (source) => Boolean(source.sitesById) && !isFetching,
      shouldReject: () => false,
      shouldRenew: (source, resource) => isFetching && resource.complete,
      resultSelector: (source) => Object.values(sitesById),
      errorSelector: () => null
    }
  );

  const onSiteClick = (site: Site) => {
    setSiteCookie(site.id);
    setTimeout(() => {
      window.location.href = getSystemLink({
        systemLinkId: 'preview',
        previewChoice,
        authoringBase,
        site: site.id
      });
    });
  };

  const onDeleteSiteClick = (site: Site) => {
    trash(site.id).subscribe(
      () => {
        dispatch(
          batchActions([
            showSystemNotification({
              message: formatMessage(translations.siteDeleted)
            }),
            fetchSites()
          ])
        );
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onEditSiteClick = (site: Site) => {
    dispatch(
      showEditSiteDialog({
        site
      })
    );
  };

  return (
    <ErrorBoundary>
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <SkeletonSitesGrid numOfItems={3} currentView={props.currentView} />
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
          currentView={props.currentView}
        />
      </SuspenseWithEmptyState>
    </ErrorBoundary>
  );
}
