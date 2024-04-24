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
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import { PREVIEW_URL_PATH, UNDEFINED } from '../../utils/constants';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useEnv from '../../hooks/useEnv';
import useLocale from '../../hooks/useLocale';
import useSpreadState from '../../hooks/useSpreadState';
import { fetchActivity } from '../../services/dashboard';
import IconButton from '@mui/material/IconButton';
import { FormattedMessage, useIntl } from 'react-intl';
import MuiTimeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';
import Typography from '@mui/material/Typography';
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
import { styled } from '@mui/material/styles';
import { RangePickerModal } from './RangePickerModal';
import Tooltip from '@mui/material/Tooltip';
import DashletCard, { DashletCardProps } from '../DashletCard/DashletCard';
import { asLocalizedDateTime } from '../../utils/datetime';
import { DashletAvatar, DashletEmptyMessage, PersonAvatar, PersonFullName } from '../DashletCard/dashletCommons';
import { getSystemLink } from '../../utils/system';
import { useDispatch } from 'react-redux';
import { changeCurrentUrl } from '../../state/actions/preview';
import { useWidgetDialogContext } from '../WidgetDialog';
import PackageDetailsDialog from '../PackageDetailsDialog/PackageDetailsDialog';
import InfiniteScroll from 'react-infinite-scroller';
import Box from '@mui/material/Box';
import { contentEvent, deleteContentEvent, publishEvent, workflowEvent } from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import LoadingIconButton from '../LoadingIconButton';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { AjaxError } from 'rxjs/ajax';

export interface ActivityDashletProps extends Partial<DashletCardProps> {}

interface ActivityDashletState {
  openRangePicker: boolean;
  openPackageDetailsDialog: boolean;
  selectedPackageId: string;
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
  error: AjaxError;
}

type FeedTypes = 'timeline' | 'range';

const Timeline = styled(MuiTimeline)({ margin: 0, padding: 0 });

const CustomTimelineItem = styled(TimelineItem)({
  minHeight: 0,
  '&.MuiTimelineItem-missingOppositeContent::before': {
    display: 'none',
    content: 'none'
  }
});

const TimelineDotWithAvatar = styled(TimelineDot)({ padding: 0, border: 'none', alignSelf: 'auto' });

const TimelineDotWithoutAvatar = styled(TimelineDot)({ alignSelf: 'auto' });

const SizedTimelineSeparator = styled(TimelineSeparator)({
  width: 40,
  minWidth: 40,
  textAlign: 'center',
  alignItems: 'center',
  alignContent: 'center',
  justifyContent: 'center'
});

const emptyTimelineContentSx = { pt: 0, pb: 0 };

const getSkeletonTimelineItems = ({ items = 1 }: { items?: number }) =>
  new Array(items).fill(null).map((nothing, index) => (
    <CustomTimelineItem key={index}>
      <SizedTimelineSeparator>
        <TimelineConnector />
        <TimelineDotWithAvatar>
          <DashletAvatar />
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
  const { borderLeftColor = 'success.main' } = props;
  const locale = useLocale();
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const widgetDialogContext = useWidgetDialogContext();
  // region const { ... } = state
  const [
    {
      feed,
      feedType,
      usernames,
      dateFrom,
      dateTo,
      limit,
      offset,
      total,
      openRangePicker,
      loadingFeed,
      loadingChunk,
      selectedPackageId,
      openPackageDetailsDialog,
      error
    },
    // endregion
    setState
  ] = useSpreadState<ActivityDashletState>({
    loadingChunk: false,
    loadingFeed: false,
    openRangePicker: false,
    openPackageDetailsDialog: false,
    selectedPackageId: null,
    feed: null,
    usernames: null,
    feedType: 'timeline',
    dateFrom: null,
    dateTo: null,
    limit: 50,
    offset: 0,
    total: null,
    error: null
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
  // region onRefresh
  const fetchFeed = useCallback(() => {
    setState({ feed: null, total: null, offset: 0, loadingFeed: true, error: null });
    return fetchActivity(site, {
      actions: activities.filter((key) => key !== 'ALL'),
      usernames,
      dateTo,
      dateFrom,
      limit
    }).subscribe({
      next: (feed) => {
        setState({
          feed,
          total: feed.total,
          loadingFeed: false,
          loadingChunk: false,
          error: null
        });
      },
      error(error) {
        setState({ loadingFeed: false, loadingChunk: false, error: error });
      }
    });
  }, [activities, dateFrom, dateTo, limit, setState, site, usernames]);
  // endregion
  const listRef = useRef();
  const loadNextPage = () => {
    let newOffset = offset + limit;
    setState({ loadingChunk: true });
    fetchActivity(site, {
      actions: activities.filter((key) => key !== 'ALL'),
      usernames,
      dateTo,
      dateFrom,
      limit,
      offset: newOffset
    }).subscribe({
      next: (nextFeedChunk) => {
        setState({
          feed: feed.concat(nextFeedChunk),
          total: nextFeedChunk.total,
          offset: newOffset,
          loadingChunk: false
        });
      },
      error(error) {
        setState({ loadingFeed: false, loadingChunk: false, error: error });
      }
    });
  };
  const onRefresh = useCallback(() => {
    setState({
      loadingChunk: true
    });
    fetchActivity(site, {
      actions: activities.filter((key) => key !== 'ALL'),
      usernames,
      dateTo,
      dateFrom,
      offset: 0,
      limit: offset + limit
    }).subscribe({
      next: (feed) => {
        setState({ feed, total: feed.total, loadingChunk: false });
      },
      error(error) {
        setState({ loadingFeed: false, loadingChunk: false, error: error });
      }
    });
  }, [activities, dateFrom, dateTo, limit, offset, setState, site, usernames]);
  const onItemClick = (previewUrl, e) => {
    const pathname = window.location.pathname;
    if (pathname.includes(PREVIEW_URL_PATH)) {
      dispatch(changeCurrentUrl(previewUrl));
      widgetDialogContext?.onClose(e, null);
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
  const hasMoreItemsToLoad = total > 0 && limit + offset < total;
  const isFetching = loadingChunk || loadingFeed;
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, setState]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [deleteContentEvent.type, workflowEvent.type, publishEvent.type, contentEvent.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      onRefresh();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [onRefresh]);
  // endregion
  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="words.activity" defaultMessage="Activity" />}
      headerAction={
        <LoadingIconButton onClick={() => onRefresh()} loading={isFetching}>
          <RefreshRounded />
        </LoadingIconButton>
      }
      actionsBar={
        <>
          <DropDownMenu
            size="small"
            variant="text"
            onMenuItemClick={(e, id: ActivitiesAndAll) => setSelectedActivities(id)}
            options={activityFilterOptions}
            closeOnSelection={false}
            menuProps={{ sx: { minWidth: 180 } }}
          >
            {selectedActivities.ALL ? (
              <FormattedMessage id="activityDashlet.showActivityByEveryone" defaultMessage="All activities" />
            ) : (
              <FormattedMessage
                id="activityDashlet.showSelectedActivities"
                defaultMessage="Selected activities ({count})"
                values={{ count: activities.length }}
              />
            )}
          </DropDownMenu>
          <AuthorFilter
            loading={isFetching}
            onChange={(users) => {
              if (users.length === 0 && (usernames === null || usernames.length === 0)) return;
              setState({ usernames: users.map(({ username }) => username) });
            }}
          />
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
            onClick={() => {
              if (feedType === 'range') {
                setState({ openRangePicker: true });
              }
            }}
          >
            <FormattedMessage id="words.timeline" defaultMessage="Timeline" />
          </DropDownMenu>
        </>
      }
      cardContentProps={{ ref: listRef }}
    >
      {error && (
        <ApiResponseErrorState
          error={error.response?.response}
          validationErrors={error.response?.validationErrors?.map((error) => {
            // `error.field` looks like getActivitiesForUsers.usernames[1].<list element>
            const match = error.field.match(/usernames\[(\d)]/);
            if (match) {
              error.message = formatMessage(
                { defaultMessage: '"{value}" is not a valid username.' },
                { value: usernames[match[1]] }
              );
            }
            return error;
          })}
        />
      )}
      {loadingFeed && (
        <Timeline position="right">
          <CustomTimelineItem>
            <SizedTimelineSeparator>
              <TimelineDotWithoutAvatar />
            </SizedTimelineSeparator>
            <TimelineContent sx={emptyTimelineContentSx} />
          </CustomTimelineItem>
          {getSkeletonTimelineItems({ items: 3 })}
          <CustomTimelineItem>
            <SizedTimelineSeparator>
              {hasMoreItemsToLoad ? (
                <TimelineDotWithAvatar sx={{ bgcolor: 'unset' }}>
                  <Tooltip
                    title={
                      <FormattedMessage
                        id="activityDashlet.loadMore"
                        defaultMessage="Load {limit} more"
                        values={{ limit }}
                      />
                    }
                  >
                    <IconButton color="primary" size="small" onClick={loadNextPage}>
                      <MoreVertRounded />
                    </IconButton>
                  </Tooltip>
                </TimelineDotWithAvatar>
              ) : (
                <TimelineDotWithoutAvatar />
              )}
            </SizedTimelineSeparator>
            <TimelineContent sx={emptyTimelineContentSx} />
          </CustomTimelineItem>
        </Timeline>
      )}
      {Boolean(feed?.length) && (
        <Timeline position="right">
          <CustomTimelineItem>
            <SizedTimelineSeparator>
              <TimelineDotWithoutAvatar />
            </SizedTimelineSeparator>
            <TimelineContent sx={emptyTimelineContentSx} />
          </CustomTimelineItem>
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => {
              loadNextPage();
            }}
            hasMore={hasMoreItemsToLoad}
            loader={<Box key="infiniteScrollLoaderSkeleton">{getSkeletonTimelineItems({ items: 3 })}</Box>}
            useWindow={false}
            getScrollParent={() => listRef.current}
          >
            {feed.map((activity) => (
              <CustomTimelineItem key={activity.id}>
                <SizedTimelineSeparator>
                  <TimelineConnector />
                  <TimelineDotWithAvatar>
                    <PersonAvatar person={activity.person} />
                  </TimelineDotWithAvatar>
                  <TimelineConnector />
                </SizedTimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <PersonFullName person={activity.person} />
                  <Typography>{renderActivity(activity, { formatMessage, onPackageClick, onItemClick })}</Typography>
                  <Typography
                    variant="caption"
                    title={asLocalizedDateTime(
                      activity.actionTimestamp,
                      locale.localeCode,
                      locale.dateTimeFormatOptions
                    )}
                  >
                    {renderActivityTimestamp(activity.actionTimestamp, locale)}
                  </Typography>
                </TimelineContent>
              </CustomTimelineItem>
            ))}
          </InfiniteScroll>
          {!hasMoreItemsToLoad && (
            <CustomTimelineItem>
              <SizedTimelineSeparator>
                <TimelineDotWithoutAvatar />
              </SizedTimelineSeparator>
            </CustomTimelineItem>
          )}
        </Timeline>
      )}
      {total === 0 && (
        <DashletEmptyMessage>
          <FormattedMessage id="activityDashlet.noEntriesFound" defaultMessage="No activity was found." />
        </DashletEmptyMessage>
      )}
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
      <PackageDetailsDialog
        open={openPackageDetailsDialog}
        onClose={() => setState({ openPackageDetailsDialog: false })}
        onClosed={() => setState({ selectedPackageId: null })}
        packageId={selectedPackageId}
      />
    </DashletCard>
  );
}

export default ActivityDashlet;
