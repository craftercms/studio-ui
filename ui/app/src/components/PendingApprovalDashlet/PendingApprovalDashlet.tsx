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

import React, { useEffect, useMemo } from 'react';
import { CommonDashletProps, useSpreadStateWithSelected, WithSelectedState } from '../SiteDashboard/utils';
import DashletCard from '../DashletCard/DashletCard';
import {
  DashletEmptyMessage,
  DenseCheckbox,
  getItemSkeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  PersonAvatar
} from '../DashletCard/dashletCommons';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import palette from '../../styles/palette';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { fetchPendingApproval } from '../../services/dashboard';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { DashboardPublishingPackage } from '../../models';
import { LIVE_COLOUR, STAGING_COLOUR } from '../ItemPublishingTargetIcon/styles';
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';

interface PendingApprovalDashletProps extends CommonDashletProps {}

interface PendingApprovalDashletState extends WithSelectedState<DashboardPublishingPackage> {
  loading: boolean;
  total: number;
}

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

export function PendingApprovalDashlet(props: PendingApprovalDashletProps) {
  const { borderLeftColor = palette.purple.tint } = props;
  const [{ items, total, loading, isAllSelected }, setState, onSelectItem, onSelectAll, isSelected] =
    useSpreadStateWithSelected<PendingApprovalDashletState>({
      items: null,
      total: null,
      loading: false,
      selected: {},
      isAllSelected: false,
      hasSelected: false
    });
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const onRefresh = useMemo(
    () => () => {
      setState({ items: null, loading: true });
      fetchPendingApproval(site, { limit: 10, offset: 0 }).subscribe((packages) => {
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
      title={
        <FormattedMessage
          id="pendingApprovalDashlet.widgetTitle"
          defaultMessage="Pending Approval <render_total>{total}</render_total>"
          values={{
            total,
            render_total(total) {
              return total ? `(${total})` : '';
            }
          }}
        />
      }
      actionsBar={
        <>
          <DenseCheckbox checked={isAllSelected} onChange={onSelectAll} />
        </>
      }
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      }
    >
      {/* TODO: Stats bar not possible to implement under current API */}
      {loading && getItemSkeleton({ numOfItems: 3, showAvatar: true, showCheckbox: true })}
      {Boolean(items?.length) && (
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
    </DashletCard>
  );
}

export default PendingApprovalDashlet;
