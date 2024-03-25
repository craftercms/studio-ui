/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { CommonDashletProps, getCurrentPage } from '../SiteDashboard/utils';
import DashletCard from '../DashletCard/DashletCard';
import palette from '../../styles/palette';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import React, { ReactNode, useCallback, useEffect } from 'react';
import {
  DashletEmptyMessage,
  getItemSkeleton,
  List,
  ListItem,
  ListItemAvatar,
  Pager,
  PersonAvatar
} from '../DashletCard/dashletCommons';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { LIVE_COLOUR, STAGING_COLOUR } from '../ItemPublishingTargetIcon/styles';
import useSpreadState from '../../hooks/useSpreadState';
import useLocale from '../../hooks/useLocale';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchPublishingHistory } from '../../services/dashboard';
import { DashboardPublishingPackage } from '../../models';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import Link from '@mui/material/Link';
import { PackageDetailsDialog } from '../PackageDetailsDialog';
import { renderActivityTimestamp } from '../ActivityDashlet';
import { publishEvent } from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import LoadingIconButton from '../LoadingIconButton';

interface RecentlyPublishedDashletProps extends CommonDashletProps {}

interface RecentlyPublishedDashletState {
  items: DashboardPublishingPackage[];
  loading: boolean;
  loadingSkeleton: boolean;
  total: number;
  limit: number;
  offset: number;
  openPackageDetailsDialog: boolean;
  selectedPackageId: string;
}

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

export function RecentlyPublishedDashlet(props: RecentlyPublishedDashletProps) {
  const { borderLeftColor = palette.blue.tint } = props;
  const [
    { items, total, loading, loadingSkeleton, limit, offset, openPackageDetailsDialog, selectedPackageId },
    setState
  ] = useSpreadState<RecentlyPublishedDashletState>({
    items: null,
    total: null,
    loading: false,
    loadingSkeleton: true,
    limit: 50,
    offset: 0,
    openPackageDetailsDialog: false,
    selectedPackageId: null
  });
  const currentPage = offset / limit;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const locale = useLocale();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();

  const loadPage = useCallback(
    (pageNumber: number, backgroundRefresh?: boolean) => {
      const newOffset = pageNumber * limit;
      setState({
        loading: true,
        loadingSkeleton: !backgroundRefresh
      });
      fetchPublishingHistory(site, {
        limit,
        offset: newOffset
      }).subscribe((packages) => {
        setState({
          items: packages,
          total: packages.total,
          offset: newOffset,
          loading: false
        });
      });
    },
    [limit, setState, site]
  );

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
    const events: string[] = [publishEvent.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      loadPage(getCurrentPage(offset, limit), true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [limit, offset, loadPage]);
  // endregion

  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="recentlyPublishedDashlet.widgetTitle" defaultMessage="Recently Published" />}
      headerAction={
        <LoadingIconButton onClick={onRefresh} loading={loading}>
          <RefreshRounded />
        </LoadingIconButton>
      }
      footer={
        Boolean(items?.length) && (
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
      sxs={{
        content: { pb: 0 },
        footer: {
          justifyContent: 'space-between'
        }
      }}
    >
      {/*
      TODO: Stats bar not possible to implement under current API
      <Stack direction="row" spacing={2}>
        <Box>
          <Typography variant="h2" component="p" children="2" lineHeight={1} />
          <Typography component="span" children="Pending" />
        </Box>
        <Box>
          <div>
            <Typography variant="h2" component="span" children="14" lineHeight={1} />
            <Typography component="span" children="days" />
          </div>
          <Typography component="span" children="Oldest request" />
        </Box>
      </Stack>
      */}
      {loading && loadingSkeleton && getItemSkeleton({ numOfItems: 3, showAvatar: true })}
      {items && (
        <List sx={{ pb: 0 }}>
          {items.map((item) => (
            <ListItem key={item.id}>
              <ListItemAvatar>
                <PersonAvatar person={item.submitter} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <FormattedMessage
                    id="recentlyPublishedDashlet.entryPrimaryText"
                    defaultMessage="{name} published <render_package_link>{count} {count, plural, one {item} other {items}}</render_package_link> to <render_target>{publishingTarget}</render_target> <render_date>{date}</render_date>"
                    values={{
                      count: item.size,
                      name: item.submitter.firstName,
                      publishingTarget: item.publishingTarget,
                      date: item.schedule,
                      render_target(target: ReactNode[]) {
                        return (
                          <Typography component="span" color={target[0] === 'live' ? LIVE_COLOUR : STAGING_COLOUR}>
                            {messages[target[0] as string]
                              ? formatMessage(messages[target[0] as string]).toLowerCase()
                              : target[0]}
                          </Typography>
                        );
                      },
                      render_date(date: ReactNode[]) {
                        return renderActivityTimestamp(date[0] as string, locale);
                      },
                      render_package_link(message) {
                        return (
                          <Link sx={{ cursor: 'pointer' }} onClick={() => onPackageClick(item)}>
                            {message}
                          </Link>
                        );
                      }
                    }}
                  />
                }
                secondary={
                  <Typography color="text.secondary" variant="body2">
                    {item.comment ?? (
                      <FormattedMessage
                        id="recentlyPublishedDashlet.noSubmissionCommentAvailable"
                        defaultMessage="Submission comment not provided"
                      />
                    )}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      {total === 0 && (
        <DashletEmptyMessage>
          <FormattedMessage
            id="recentlyPublishedDashlet.noRecentlyPublishedItems"
            defaultMessage="There are no items have been published recently"
          />
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

export default RecentlyPublishedDashlet;
