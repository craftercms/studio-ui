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

import { CommonDashletProps, useSpreadStateWithSelected, WithSelectedState } from '../SiteDashboard/utils';
import DashletTemplate from '../SiteDashboard/DashletTemplate';
import palette from '../../styles/palette';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useMemo } from 'react';
import {
  DashletEmptyMessage,
  DenseCheckbox,
  getItemSkeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  PersonAvatar
} from '../SiteDashboard/dashletCommons';
import { useActiveSiteId } from '../../hooks';
import { fetchScheduled } from '../../services/dashboard';
import { DashboardPublishingPackage } from '../../models';
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { LIVE_COLOUR, STAGING_COLOUR } from '../ItemPublishingTargetIcon/styles';

export interface ScheduledDashletProps extends CommonDashletProps {}

interface ScheduledDashletState extends WithSelectedState<DashboardPublishingPackage> {
  total: number;
  loading: boolean;
}

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

export function ScheduledDashlet(props: ScheduledDashletProps) {
  const { borderLeftColor = palette.blue.tint } = props;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const [{ loading, total, items, isAllSelected }, setState, onSelectItem, onSelectAll, isSelected] =
    useSpreadStateWithSelected<ScheduledDashletState>({
      loading: false,
      items: null,
      total: null,
      selected: {},
      isAllSelected: false,
      hasSelected: false
    });
  const onRefresh = useMemo(
    () => () => {
      setState({ loading: true, items: null, selected: {}, isAllSelected: false });
      fetchScheduled(site, {
        limit: 10,
        offset: 0,
        dateFrom: '2022-03-28T22:00:00.000Z',
        dateTo: '2022-04-28T22:00:00.000Z'
      }).subscribe((items) => {
        setState({ loading: false, items, total: items.total });
      });
    },
    [setState, site]
  );
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);
  return (
    <DashletTemplate
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="scheduledDashlet.widgetTitle" defaultMessage="Scheduled for Publish" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      }
      actionsBar={
        <>
          <DenseCheckbox disabled={loading} checked={isAllSelected} onChange={onSelectAll} />
        </>
      }
    >
      {loading && getItemSkeleton({ numOfItems: 3, showAvatar: true, showCheckbox: true })}
      {items && (
        <List>
          {items.map((item, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Checkbox edge="start" checked={isSelected(item)} onChange={(e) => onSelectItem(e, item)} />
              </ListItemIcon>
              <ListItemAvatar>
                <PersonAvatar person={item.submitter} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <FormattedMessage
                    id="pendingApprovalDashlet.entryPrimaryText"
                    defaultMessage="{name} submitted to <render_target>{publishingTarget}</render_target>"
                    values={{
                      name: item.submitter.firstName,
                      publishingTarget: item.publishingTarget,
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
                      }
                    }}
                  />
                }
                secondary={
                  <Typography color="text.secondary" variant="body2">
                    <FormattedMessage
                      id="pendingApprovalDashlet.noSubmissionCommentAvailable"
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
            id="pendingApprovalDashlet.noPendingItems"
            defaultMessage="There are no items pending approval"
          />
        </DashletEmptyMessage>
      )}
    </DashletTemplate>
  );
}

export default ScheduledDashlet;
