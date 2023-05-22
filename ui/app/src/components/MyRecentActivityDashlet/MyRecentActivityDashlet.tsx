/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { CommonDashletProps, getCurrentPage } from '../SiteDashboard';
import { Activity, Person } from '../../models';
import palette from '../../styles/palette';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { FormattedMessage, useIntl } from 'react-intl';
import useEnv from '../../hooks/useEnv';
import { useDispatch } from 'react-redux';
import React, { useCallback, useEffect } from 'react';
import { fetchActivity } from '../../services/dashboard';
import useActiveUser from '../../hooks/useActiveUser';
import { DashletCard } from '../DashletCard';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import { DashletEmptyMessage, getItemSkeleton, Pager, PersonAvatar } from '../DashletCard/dashletCommons';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import { renderActivity, renderActivityTimestamp } from '../ActivityDashlet';
import useLocale from '../../hooks/useLocale';
import { PREVIEW_URL_PATH } from '../../utils/constants';
import { changeCurrentUrl } from '../../state/actions/preview';
import { getSystemLink } from '../../utils/system';
import useSpreadState from '../../hooks/useSpreadState';
import ListItem from '@mui/material/ListItem';
import PackageDetailsDialog from '../PackageDetailsDialog';
import { contentEvent, deleteContentEvent, publishEvent, workflowEvent } from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import LoadingButton from '@mui/lab/LoadingButton';

interface MyRecentActivityDashletProps extends CommonDashletProps {}

interface MyRecentActivityDashletState {
  feed: Activity[];
  total: number;
  loading: boolean;
  loadingSkeleton: boolean;
  limit: number;
  offset: number;
  openPackageDetailsDialog: boolean;
  selectedPackageId: string;
}

export function MyRecentActivityDashlet(props: MyRecentActivityDashletProps) {
  const { borderLeftColor = palette.blue.tint, onMinimize } = props;
  const locale = useLocale();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const { username, firstName, lastName } = useActiveUser();
  const person: Person = { username, firstName, lastName, avatar: null };
  const dispatch = useDispatch();
  const [
    { loading, loadingSkeleton, total, feed, limit, offset, selectedPackageId, openPackageDetailsDialog },
    setState
  ] = useSpreadState<MyRecentActivityDashletState>({
    feed: null,
    loading: false,
    loadingSkeleton: true,
    total: null,
    limit: 50,
    offset: 0,
    openPackageDetailsDialog: false,
    selectedPackageId: null
  });
  const currentPage = offset / limit;
  const totalPages = total ? Math.ceil(total / limit) : 0;

  const loadPage = useCallback(
    (pageNumber: number, backgroundRefresh?: boolean) => {
      const newOffset = pageNumber * limit;
      setState({
        loading: true,
        loadingSkeleton: !backgroundRefresh
      });
      fetchActivity(site, {
        usernames: [username],
        offset: newOffset,
        limit
      }).subscribe((feed) => {
        setState({ feed, total: feed.total, offset: newOffset, loading: false });
      });
    },
    [limit, setState, site, username]
  );

  const onItemClick = (previewUrl, e) => {
    const pathname = window.location.pathname;
    if (pathname.includes(PREVIEW_URL_PATH)) {
      dispatch(changeCurrentUrl(previewUrl));
      onMinimize?.();
    } else {
      window.location.href = getSystemLink({
        page: previewUrl,
        systemLinkId: 'preview',
        site,
        authoringBase
      });
    }
  };

  const onPackageClick = (pkg) => {
    setState({ openPackageDetailsDialog: true, selectedPackageId: pkg.id });
  };

  const onRefresh = () => {
    loadPage(getCurrentPage(offset, limit), true);
  };

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [deleteContentEvent.type, workflowEvent.type, publishEvent.type, contentEvent.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      loadPage(getCurrentPage(offset, limit), true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [limit, offset, loadPage, username]);
  // endregion

  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={
        <>
          {person && (
            <PersonAvatar
              person={person}
              sx={{
                display: 'inline-flex',
                mr: 1,
                width: 30,
                height: 30,
                fontSize: '1.1rem'
              }}
            />
          )}
          <FormattedMessage defaultMessage="My Recent Activity" />
        </>
      }
      sxs={{
        content: { padding: 0 },
        footer: { justifyContent: 'space-between' }
      }}
      headerAction={
        <LoadingButton onClick={onRefresh} loading={loading} sx={{ borderRadius: '50%', padding: '8px', minWidth: 0 }}>
          <RefreshRounded />
        </LoadingButton>
      }
      footer={
        Boolean(feed?.length) && (
          <Pager
            totalPages={totalPages}
            totalItems={total}
            currentPage={currentPage}
            rowsPerPage={limit}
            onPagePickerChange={(page) => loadPage(page)}
            onPageChange={(page) => loadPage(page)}
            onRowsPerPageChange={(rowsPerPage) => setState({ limit: rowsPerPage })}
          />
        )
      }
    >
      {loading && loadingSkeleton && getItemSkeleton({ numOfItems: 3, showAvatar: false, showCheckbox: true })}
      {feed && (
        <List sx={{ pb: 0 }}>
          {feed.map((activity) => (
            <ListItem key={activity.id} sx={{ pt: 0, pb: 0 }}>
              <ListItemText
                primary={renderActivity(activity, {
                  formatMessage,
                  onPackageClick,
                  onItemClick
                })}
                secondary={renderActivityTimestamp(activity.actionTimestamp, locale)}
              />
            </ListItem>
          ))}
        </List>
      )}
      {total === 0 && (
        <DashletEmptyMessage>
          <FormattedMessage id="activityDashlet.noEntriesFound" defaultMessage="No activity was found." />
        </DashletEmptyMessage>
      )}
      <PackageDetailsDialog
        open={openPackageDetailsDialog}
        onClose={() => setState({ openPackageDetailsDialog: false })}
        onClosed={() => setState({ selectedPackageId: null })}
        packageId={selectedPackageId}
      />
    </DashletCard>
  );
}

export default MyRecentActivityDashlet;
