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

import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import AddIcon from '@material-ui/icons/Add';
import { SkeletonSitesGrid } from '../SitesGrid';
import CreateSiteDialog from '../../modules/System/Sites/Create/CreateSiteDialog';
import ListViewIcon from '@material-ui/icons/ViewStreamRounded';
import GridViewIcon from '@material-ui/icons/GridOnRounded';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { useDispatch } from 'react-redux';
import {
  useActiveUser,
  useEnv,
  useLogicResource,
  usePreviewState,
  useSitesBranch,
  useSpreadState
} from '../../utils/hooks';
import LookupTable from '../../models/LookupTable';
import { PublishingStatus } from '../../models/Publishing';
import { merge } from 'rxjs';
import { fetchStatus } from '../../services/publishing';
import { map } from 'rxjs/operators';
import { Site } from '../../models/Site';
import { setSiteCookie } from '../../utils/auth';
import { getSystemLink } from '../LauncherSection';
import { trash } from '../../services/sites';
import { batchActions } from '../../state/actions/misc';
import { showSystemNotification } from '../../state/actions/system';
import { fetchSites } from '../../state/reducers/sites';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showEditSiteDialog } from '../../state/actions/dialogs';
import { ErrorBoundary } from '../SystemStatus/ErrorBoundary';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import SitesGridUI from '../SitesGrid/SitesGridUI';
import PublishingStatusDialog from '../PublishingStatusDialog';
import GlobalAppToolbar from '../GlobalAppToolbar';
import Button from '@material-ui/core/Button';
import { getStoredGlobalMenuSiteViewPreference, setStoredGlobalMenuSiteViewPreference } from '../../utils/state';
import { hasGlobalPermissions } from '../../services/users';
import { foo } from '../../utils/object';

const translations = defineMessages({
  siteDeleted: {
    id: 'sitesGrid.siteDeleted',
    defaultMessage: 'Site deleted successfully'
  }
});

export default function SitesManagement() {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const { previewChoice } = usePreviewState();
  const [openCreateSiteDialog, setOpenCreateSiteDialog] = useState(false);
  const user = useActiveUser();
  const [currentView, setCurrentView] = useState<'grid' | 'list'>(
    getStoredGlobalMenuSiteViewPreference(user.username) ?? 'grid'
  );
  const sitesBranch = useSitesBranch();
  const sitesById = sitesBranch.byId;
  const isFetching = sitesBranch.isFetching;
  const [publishingStatusLookup, setPublishingStatusLookup] = useSpreadState<LookupTable<PublishingStatus>>({});
  const [selectedSiteStatus, setSelectedSiteStatus] = useState<PublishingStatus>(null);
  const [permissionsLookup, setPermissionsLookup] = useState({});

  useEffect(() => {
    merge(
      ...Object.keys(sitesById).map((siteId) =>
        fetchStatus(siteId).pipe(
          map((status) => ({
            status,
            siteId
          }))
        )
      )
    ).subscribe(({ siteId, status }) => {
      setPublishingStatusLookup({ [siteId]: status });
    });
  }, [setPublishingStatusLookup, sitesById]);

  useEffect(() => {
    hasGlobalPermissions('create-site', 'edit_site', 'site_delete').subscribe((permissions) => {
      setPermissionsLookup(permissions);
    });
  });

  const resource = useLogicResource<Site[], { sitesById: LookupTable<Site>; isFetching: boolean }>(
    useMemo(() => ({ sitesById, isFetching, permissionsLookup }), [sitesById, isFetching, permissionsLookup]),
    {
      shouldResolve: (source) => Boolean(source.sitesById) && permissionsLookup !== foo && !isFetching,
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

  const onPublishButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, site: Site) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedSiteStatus(publishingStatusLookup[site.id]);
  };

  const handleChangeView = () => {
    if (currentView === 'grid') {
      setCurrentView('list');
      setStoredGlobalMenuSiteViewPreference('list', user.username);
    } else {
      setCurrentView('grid');
      setStoredGlobalMenuSiteViewPreference('grid', user.username);
    }
  };

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="GlobalMenu.Sites" defaultMessage="Sites" />}
        leftContent={
          permissionsLookup?.['create-site'] && (
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              color="primary"
              onClick={() => setOpenCreateSiteDialog(true)}
            >
              <FormattedMessage id="sites.createSite" defaultMessage="Create Site" />
            </Button>
          )
        }
        rightContent={
          <Tooltip title={<FormattedMessage id="sites.ChangeView" defaultMessage="Change view" />}>
            <IconButton onClick={handleChangeView}>
              {currentView === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>
        }
      />
      <ErrorBoundary>
        <SuspenseWithEmptyState
          resource={resource}
          suspenseProps={{
            fallback: <SkeletonSitesGrid numOfItems={3} currentView={currentView} />
          }}
          withEmptyStateProps={{
            emptyStateProps: {
              title: <FormattedMessage id="sitesGrid.emptyStateMessage" defaultMessage="No Sites Found" />
            }
          }}
        >
          <SitesGridUI
            resource={resource}
            publishingStatusLookup={publishingStatusLookup}
            onSiteClick={onSiteClick}
            onDeleteSiteClick={permissionsLookup?.['site_delete'] && onDeleteSiteClick}
            onEditSiteClick={permissionsLookup?.['edit_site'] && onEditSiteClick}
            currentView={currentView}
            onPublishButtonClick={onPublishButtonClick}
          />
        </SuspenseWithEmptyState>
      </ErrorBoundary>
      <PublishingStatusDialog
        open={Boolean(selectedSiteStatus)}
        onClose={() => {
          setSelectedSiteStatus(null);
        }}
        isFetching={false}
        {...selectedSiteStatus}
      />
      <CreateSiteDialog open={openCreateSiteDialog} onClose={() => setOpenCreateSiteDialog(false)} />
    </section>
  );
}
