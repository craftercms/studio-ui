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

import { CommonDashletProps } from '../SiteDashboard/utils';
import DashletCard from '../DashletCard/DashletCard';
import palette from '../../styles/palette';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useMemo } from 'react';
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
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';
import Link from '@mui/material/Link';
import { PackageDetailsDialog } from '../PackageDetailsDialog';
import { renderActivityTimestamp } from '../ActivityDashlet';

interface RecentlyPublishedDashletProps extends CommonDashletProps {}

interface RecentlyPublishedDashletState {
  items: DashboardPublishingPackage[];
  loading: boolean;
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
  const [{ items, total, loading, limit, offset, openPackageDetailsDialog, selectedPackageId }, setState] =
    useSpreadState<RecentlyPublishedDashletState>({
      items: null,
      total: null,
      loading: false,
      limit: 10,
      offset: 0,
      openPackageDetailsDialog: false,
      selectedPackageId: null
    });
  const currentPage = offset / limit;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const locale = useLocale();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const onRefresh = useMemo(
    () => () => {
      setState({ items: null, loading: true });
      fetchPublishingHistory(site, {
        limit,
        offset: 0,
        dateFrom: '2023-03-01T22:00:00.000Z',
        dateTo: '2023-04-28T22:00:00.000Z'
      }).subscribe((packages) => {
        setState({ items: packages, total: packages.total, offset: 0, loading: false });
      });
    },
    [setState, site, limit]
  );

  const loadPage = (pageNumber: number) => {
    const newOffset = pageNumber * limit;
    setState({ loading: true });
    // TODO: dateFrom/dateTo will be optional, need to update when API change is ready
    fetchPublishingHistory(site, {
      limit,
      offset: newOffset,
      dateFrom: '2023-03-01T22:00:00.000Z',
      dateTo: '2023-04-28T22:00:00.000Z'
    }).subscribe((packages) => {
      setState({ items: packages, total: packages.total, offset: newOffset, loading: false });
    });
  };

  const onPackageClick = (pkg) => {
    setState({ openPackageDetailsDialog: true, selectedPackageId: pkg.id });
  };

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);
  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="recentlyPublishedDashlet.widgetTitle" defaultMessage="Recently Published" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
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
      {loading && getItemSkeleton({ numOfItems: 3, showAvatar: true })}
      {items && (
        <List>
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
                      render_target(target: string[]) {
                        return (
                          <Typography component="span" color={target[0] === 'live' ? LIVE_COLOUR : STAGING_COLOUR}>
                            {messages[target[0]] ? formatMessage(messages[target[0]]).toLowerCase() : target[0]}
                          </Typography>
                        );
                      },
                      render_date(date: string[]) {
                        return renderActivityTimestamp(date[0], locale);
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
                    <FormattedMessage
                      id="recentlyPublishedDashlet.noSubmissionCommentAvailable"
                      defaultMessage="Submission comment not provided"
                    />
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
