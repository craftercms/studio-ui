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
import { asLocalizedDateTime } from '../../utils/datetime';
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';

interface RecentlyPublishedDashletProps extends CommonDashletProps {}

interface RecentlyPublishedDashletState {
  items: DashboardPublishingPackage[];
  loading: boolean;
  total: number;
}

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

export function RecentlyPublishedDashlet(props: RecentlyPublishedDashletProps) {
  const { borderLeftColor = palette.blue.tint } = props;
  const [{ items, total, loading }, setState] = useSpreadState<RecentlyPublishedDashletState>({
    items: null,
    total: null,
    loading: false
  });
  const locale = useLocale();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const onRefresh = useMemo(
    () => () => {
      setState({ items: null, loading: true });
      fetchPublishingHistory(site, {
        limit: 10,
        offset: 0,
        dateFrom: '2022-03-28T22:00:00.000Z',
        dateTo: '2022-04-28T22:00:00.000Z'
      }).subscribe((packages) => {
        setState({ items: packages, total: packages.total, loading: false });
      });
    },
    [setState, site]
  );
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
                    defaultMessage="{name} published {count} {count, plural, one {package} other {packages}} to <render_target>{publishingTarget}</render_target> <render_date>{date}</render_date>"
                    values={{
                      count: item.size,
                      name: item.submitter.firstName,
                      publishingTarget: item.publishingTarget,
                      date: item.schedule,
                      render_target(target) {
                        return (
                          <Typography
                            component="span"
                            fontWeight="bold"
                            color={target === 'live' ? LIVE_COLOUR : STAGING_COLOUR}
                          >
                            {messages[target] ? formatMessage(messages[target]).toLowerCase() : target}
                          </Typography>
                        );
                      },
                      render_date(date) {
                        return asLocalizedDateTime(date, locale.localeCode, locale.dateTimeFormatOptions);
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
    </DashletCard>
  );
}

export default RecentlyPublishedDashlet;
