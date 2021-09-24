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
import AddIcon from '@mui/icons-material/Add';
import { SkeletonSitesGrid } from '../SitesGrid';
import CreateSiteDialog from '../../modules/System/Sites/Create/CreateSiteDialog';
import ListViewIcon from '@mui/icons-material/ViewStreamRounded';
import GridViewIcon from '@mui/icons-material/GridOnRounded';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useDispatch } from 'react-redux';
import LookupTable from '../../models/LookupTable';
import { PublishingStatus } from '../../models/Publishing';
import { merge } from 'rxjs';
import { fetchStatus } from '../../services/publishing';
import { map } from 'rxjs/operators';
import { Site } from '../../models/Site';
import { setSiteCookie } from '../../utils/auth';
import { trash } from '../../services/sites';
import { batchActions } from '../../state/actions/misc';
import { showSystemNotification } from '../../state/actions/system';
import { fetchSites, popSite } from '../../state/reducers/sites';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showEditSiteDialog } from '../../state/actions/dialogs';
import { ErrorBoundary } from '../SystemStatus/ErrorBoundary';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import SitesGridUI from '../SitesGrid/SitesGridUI';
import PublishingStatusDialog from '../PublishingStatusDialog';
import GlobalAppToolbar from '../GlobalAppToolbar';
import Button from '@mui/material/Button';
import { getStoredGlobalMenuSiteViewPreference, setStoredGlobalMenuSiteViewPreference } from '../../utils/state';
import { hasGlobalPermissions } from '../../services/users';
import { foo } from '../../utils/object';
import { useEnv } from '../../utils/hooks/useEnv';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useMount } from '../../utils/hooks/useMount';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { useSitesBranch } from '../../utils/hooks/useSitesBranch';
import Paper from '@mui/material/Paper';
import { getSystemLink } from '../../utils/system';
import { fetchUseLegacyPreviewPreference } from '../../services/configuration';
import { useEnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';

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
  const [permissionsLookup, setPermissionsLookup] = useState<LookupTable<boolean>>(foo);

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

  useMount(() => {
    hasGlobalPermissions('create-site', 'edit_site', 'site_delete').subscribe(setPermissionsLookup);
  });

  const resource = useLogicResource<Site[], { sitesById: LookupTable<Site>; isFetching: boolean }>(
    useMemo(() => ({ sitesById, isFetching, permissionsLookup }), [sitesById, isFetching, permissionsLookup]),
    {
      shouldResolve: (source) => Boolean(source.sitesById) && permissionsLookup !== foo && !isFetching,
      shouldReject: () => false,
      shouldRenew: (source, resource) => isFetching && resource.complete,
      resultSelector: () => Object.values(sitesById),
      errorSelector: () => null
    }
  );

  const onSiteClick = (site: Site) => {
    setSiteCookie(site.id);
    fetchUseLegacyPreviewPreference(site.id).subscribe((useLegacy) => {
      window.location.href = getSystemLink({
        systemLinkId: 'preview',
        authoringBase,
        site: site.id,
        useLegacy
      });
    });
  };

  const onDeleteSiteClick = (site: Site) => {
    trash(site.id).subscribe(
      () => {
        dispatch(
          batchActions([
            popSite({ siteId: site.id }),
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

  const publishingStatusDialogState = useEnhancedDialogState();

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar
        title={<FormattedMessage id="GlobalMenu.Sites" defaultMessage="Sites" />}
        leftContent={
          permissionsLookup['create-site'] && (
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
            <IconButton onClick={handleChangeView} size="large">
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
            onDeleteSiteClick={permissionsLookup['site_delete'] && onDeleteSiteClick}
            onEditSiteClick={permissionsLookup['edit_site'] && onEditSiteClick}
            currentView={currentView}
            onPublishButtonClick={onPublishButtonClick}
          />
        </SuspenseWithEmptyState>
      </ErrorBoundary>
      <PublishingStatusDialog
        open={publishingStatusDialogState.open}
        onClose={publishingStatusDialogState.onClose}
        isMinimized={publishingStatusDialogState.isMinimized}
        hasPendingChanges={publishingStatusDialogState.isMinimized}
        isSubmitting={publishingStatusDialogState.isSubmitting}
        onClosed={() => {
          setSelectedSiteStatus(null);
        }}
        isFetching={false}
        {...selectedSiteStatus}
      />
      <CreateSiteDialog open={openCreateSiteDialog} onClose={() => setOpenCreateSiteDialog(false)} />
    </Paper>
  );
}
