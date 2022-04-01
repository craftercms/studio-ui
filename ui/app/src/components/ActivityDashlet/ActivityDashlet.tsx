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

import { Activity } from '../../models/Activity';
import React, { useEffect, useMemo } from 'react';
import { InfoRounded, MoreVertRounded, RefreshRounded } from '@mui/icons-material';
import { UNDEFINED } from '../../utils/constants';
import { useLocale, useSpreadState } from '../../hooks';
import { fetchActivity } from '../../services/dashboard';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';
import Avatar from '@mui/material/Avatar';
import { getInitials } from '../../utils/string';
import Typography from '@mui/material/Typography';
import { CommonDashletProps, DashletTemplate, parseDashletContentHeight } from '../SiteDashboard';
import DropDownMenu from '../DropDownMenuButton/DropDownMenuButton';
import {
  ActivitiesAndAll,
  activityNameLookup,
  renderActivity,
  renderActivityTimestamp,
  useSelectionLookupState
} from './utils';
import { AuthorFilter } from './AuthorFilter';
import Skeleton from '@mui/material/Skeleton';
import { styled, useTheme } from '@mui/material/styles';
import { RangePickerModal } from './RangePickerModal';
import Tooltip from '@mui/material/Tooltip';

export interface ActivityDashletProps extends CommonDashletProps {}

interface ActivityDashletState {
  openRangePicker: boolean;
  feed: Activity[];
  usernames: string[];
  feedType: FeedTypes;
  dateFrom: string;
  dateTo: string;
  limit: number;
  offset: number;
  total: number;
  loadingFeed: boolean;
  loadingChunk: boolean;
}

type FeedTypes = 'timeline' | 'range';

const CustomTimelineItem = styled(TimelineItem)({
  minHeight: 0,
  ['&.MuiTimelineItem-missingOppositeContent::before']: {
    display: 'none',
    content: 'none'
  }
});

const TimelineDotWithAvatar = styled(TimelineDot)({ padding: 0, border: 'none', alignSelf: 'auto' });

const TimelineDotWithoutAvatar = styled(TimelineDot)({ alignSelf: 'auto' });

const SizedAvatar = styled(Avatar)({ width: 40, height: 40 });

const SizedTimelineSeparator = styled(TimelineSeparator)({
  width: 40,
  minWidth: 40,
  textAlign: 'center',
  alignItems: 'center',
  alignContent: 'center',
  justifyContent: 'center'
});

const getSkeletonTimelineItems = ({ items = 1 }: { items?: number }) =>
  new Array(items).fill(null).map((nothing, index) => (
    <CustomTimelineItem key={index}>
      <SizedTimelineSeparator>
        <TimelineConnector />
        <TimelineDotWithAvatar>
          <SizedAvatar />
        </TimelineDotWithAvatar>
        <TimelineConnector />
      </SizedTimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Typography variant="h6">
          <Skeleton variant="text" />
        </Typography>
        <Typography variant="body1">
          <Skeleton variant="text" />
        </Typography>
        <Typography variant="body1">
          <Skeleton variant="text" />
        </Typography>
      </TimelineContent>
    </CustomTimelineItem>
  ));

export function ActivityDashlet(props: ActivityDashletProps) {
  const { contentHeight: contentHeightProp, borderLeftColor = 'success.main' } = props;
  const locale = useLocale();
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const contentHeight = contentHeightProp
    ? // Subtract toolbar height to avoid misalignment with other widgets
      parseDashletContentHeight(contentHeightProp) - 50
    : UNDEFINED;
  const [
    { feed, feedType, usernames, dateFrom, dateTo, limit, offset, total, openRangePicker, loadingChunk, loadingFeed },
    setState
  ] = useSpreadState<ActivityDashletState>({
    loadingChunk: false,
    loadingFeed: false,
    openRangePicker: false,
    feed: null,
    usernames: null,
    feedType: 'timeline',
    dateFrom: null,
    dateTo: null,
    limit: 10,
    offset: 0,
    total: null
  });
  const [selectedActivities, setSelectedActivities, activities] = useSelectionLookupState<ActivitiesAndAll>({
    ALL: true
  });
  // region activityFilterOptions = ...
  const activityFilterOptions = useMemo(
    () =>
      Object.keys(activityNameLookup).map((key) => ({
        id: key,
        primaryText: activityNameLookup[key],
        selected: selectedActivities[key]
      })),
    [selectedActivities]
  );
  // endregion
  // region feedTypeOptions
  const feedTypeOptions = useMemo(
    () => [
      {
        id: 'timeline',
        primaryText: <FormattedMessage id="words.timeline" defaultMessage="Timeline" />,
        selected: feedType === 'timeline',
        secondaryText: (
          <FormattedMessage id="activityDashlet.timelineOptionTip" defaultMessage="All activity, most recent first" />
        )
      },
      {
        id: 'range',
        primaryText: <FormattedMessage id="words.range" defaultMessage="Range" />,
        selected: feedType === 'range',
        secondaryText: (
          <FormattedMessage id="activityDashlet.rangeOptionTip" defaultMessage="Specify a range of dates" />
        )
      }
    ],
    [feedType]
  );
  // endregion
  // region fetchFeed
  const fetchFeed = useMemo(
    () => () => {
      fetchActivity('editorial-neue', {
        actions: activities.filter((key) => key !== 'ALL'),
        usernames,
        dateTo,
        dateFrom,
        limit
      }).subscribe((feed) => {
        setState({ feed, total: feed.total, offset: 0, loadingFeed: false });
      });
    },
    [activities, dateFrom, dateTo, limit, setState, usernames]
  );
  // endregion
  const loadNextPage = () => {
    let newOffset = offset + limit;
    setState({ loadingChunk: true });
    fetchActivity('editorial-neue', {
      actions: activities.filter((key) => key !== 'ALL'),
      usernames,
      dateTo,
      dateFrom,
      limit,
      offset: newOffset
    }).subscribe((nextFeedChunk) => {
      setState({
        feed: feed.concat(nextFeedChunk),
        total: nextFeedChunk.total,
        offset: newOffset,
        loadingChunk: false
      });
    });
  };
  useEffect(() => {
    setState({ feed: null, loadingFeed: true });
    fetchFeed();
  }, [fetchFeed, setState]);
  return (
    <DashletTemplate
      {...props}
      contentHeight={contentHeight}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="words.activity" defaultMessage="Activity" />}
      actionsBar={
        <Box
          sx={{ bgcolor: `grey.${theme.palette.mode === 'light' ? 100 : 900}`, p: 1 }}
          display="flex"
          justifyContent="space-between"
        >
          <Box display="flex">
            <DropDownMenu
              size="small"
              variant="text"
              onMenuItemClick={(e, id: ActivitiesAndAll) => setSelectedActivities(id)}
              options={activityFilterOptions}
              closeOnSelection={false}
              menuProps={{ sx: { minWidth: 180 } }}
              listItemProps={{ dense: true }}
            >
              {selectedActivities.ALL ? (
                <FormattedMessage id="activityDashlet.showActivityByEveryone" defaultMessage="All activities" />
              ) : (
                <FormattedMessage
                  id="activityDashlet.showActivityByEveryone"
                  defaultMessage="Selected activities ({count})"
                  values={{ count: activities.length }}
                />
              )}
            </DropDownMenu>
            <AuthorFilter onChange={(users) => setState({ usernames: users.map(({ username }) => username) })} />
            <DropDownMenu
              size="small"
              variant="text"
              onMenuItemClick={(e, feedType: FeedTypes) => {
                const state = { feedType, dateTo, dateFrom, openRangePicker: feedType === 'range' };
                if (feedType === 'timeline') {
                  state.dateTo = null;
                  state.dateFrom = null;
                }
                setState(state);
              }}
              options={feedTypeOptions}
              menuProps={{ sx: { minWidth: 200 } }}
              listItemProps={{ dense: true }}
              onClick={() => {
                if (feedType === 'range') {
                  setState({ openRangePicker: true });
                  return false;
                }
              }}
            >
              <FormattedMessage id="words.Timeline" defaultMessage="Timeline" />
            </DropDownMenu>
          </Box>
          <IconButton size="small" onClick={() => fetchFeed()}>
            <RefreshRounded />
          </IconButton>
        </Box>
      }
    >
      <Timeline position="right" sx={{ m: 0, p: 0 }}>
        <CustomTimelineItem>
          <SizedTimelineSeparator>
            <TimelineDotWithoutAvatar />
          </SizedTimelineSeparator>
          <TimelineContent sx={{ pt: 0, pb: 0 }} />
        </CustomTimelineItem>
        {feed &&
          (feed.length ? (
            feed.map((activity) => (
              <CustomTimelineItem key={activity.id}>
                <SizedTimelineSeparator>
                  <TimelineConnector />
                  <TimelineDotWithAvatar>
                    <SizedAvatar
                      src={activity.person.avatar ?? UNDEFINED}
                      children={activity.person.avatar ? UNDEFINED : getInitials(activity.person)}
                    />
                  </TimelineDotWithAvatar>
                  <TimelineConnector />
                </SizedTimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Typography variant="h6">
                    [{activity.id}] {activity.person.firstName} {activity.person.lastName}
                  </Typography>
                  <Typography>{renderActivity(activity, { formatMessage })}</Typography>
                  {renderActivityTimestamp(activity.actionTimestamp, locale)}
                </TimelineContent>
              </CustomTimelineItem>
            ))
          ) : (
            <CustomTimelineItem>
              <SizedTimelineSeparator>
                <TimelineConnector />
                <TimelineDotWithoutAvatar />
                <TimelineConnector />
              </SizedTimelineSeparator>
              <TimelineContent display="flex" alignItems="center">
                <Typography display="flex">
                  <InfoRounded sx={{ mr: 1 }} />
                  <FormattedMessage id="activityDashlet.noEntriesFound" defaultMessage="No activity was found." />
                </Typography>
              </TimelineContent>
            </CustomTimelineItem>
          ))}
        {(loadingChunk || loadingFeed) && getSkeletonTimelineItems({ items: 3 })}
        <CustomTimelineItem>
          <SizedTimelineSeparator>
            {total > 0 && limit + offset < total ? (
              <TimelineDotWithAvatar>
                <Tooltip title={<FormattedMessage id="activityDashlet.loadMore" defaultMessage="Load more" />}>
                  <IconButton size="small" onClick={loadNextPage}>
                    <MoreVertRounded />
                  </IconButton>
                </Tooltip>
              </TimelineDotWithAvatar>
            ) : (
              <TimelineDotWithoutAvatar />
            )}
          </SizedTimelineSeparator>
          <TimelineContent sx={{ pt: 0, pb: 0 }} />
        </CustomTimelineItem>
      </Timeline>
      <RangePickerModal
        open={openRangePicker}
        onClose={() => setState({ openRangePicker: false })}
        onAccept={(dateFrom, dateTo) =>
          setState({ dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString(), openRangePicker: false })
        }
        onSwitchToTimelineClick={
          feedType === 'range'
            ? () => {
                setState({ feedType: 'timeline', dateTo: null, dateFrom: null, openRangePicker: false });
              }
            : UNDEFINED
        }
      />
    </DashletTemplate>
  );
}

export default ActivityDashlet;
