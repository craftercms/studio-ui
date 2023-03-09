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
import { DashletEmptyMessage, getItemSkeleton, List, ListItem, ListItemIcon } from '../DashletCard/dashletCommons';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import palette from '../../styles/palette';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { fetchPendingApproval } from '../../services/dashboard';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { DetailedItem } from '../../models';
import { LIVE_COLOUR, STAGING_COLOUR } from '../ItemPublishingTargetIcon/styles';
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';
import ItemDisplay from '../ItemDisplay';
import { ActionsBar } from '../ActionsBar';
import { UNDEFINED } from '../../utils/constants';
import { itemActionDispatcher } from '../../utils/itemActions';
import useEnv from '../../hooks/useEnv';
import { useDispatch } from 'react-redux';

interface PendingApprovalDashletProps extends CommonDashletProps {}

interface PendingApprovalDashletState extends WithSelectedState<DetailedItem> {
  loading: boolean;
  total: number;
}

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

export function PendingApprovalDashlet(props: PendingApprovalDashletProps) {
  const { borderLeftColor = palette.purple.tint } = props;
  const [
    { items, total, loading, isAllSelected, hasSelected, selected },
    setState,
    onSelectItem,
    onSelectAll,
    isSelected
  ] = useSpreadStateWithSelected<PendingApprovalDashletState>({
    items: null,
    total: null,
    loading: false,
    selected: {},
    isAllSelected: false,
    hasSelected: false
  });
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const onRefresh = useMemo(
    () => () => {
      setState({ items: null, loading: true });
      fetchPendingApproval(site, { limit: 10, offset: 0 }).subscribe((items) => {
        setState({ items: items, total: items.total, loading: false });
      });
    },
    [setState, site]
  );
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const onOptionClicked = (option) => {
    const clickedItems = items.filter((item) => selected[item.id]);
    return itemActionDispatcher({
      site,
      authoringBase,
      dispatch,
      formatMessage,
      option,
      item: clickedItems.length > 1 ? clickedItems : clickedItems[0]
    });
  };

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
      sxs={{ actionsBar: { padding: 0 } }}
      actionsBar={
        <ActionsBar
          disabled={loading}
          isChecked={isAllSelected}
          isIndeterminate={hasSelected && !isAllSelected}
          onCheckboxChange={onSelectAll}
          onOptionClicked={onOptionClicked}
          options={
            hasSelected
              ? [
                  { id: 'approvePublish', label: 'Publish' },
                  { id: 'rejectPublish', label: 'Reject' }
                ]
              : []
          }
          buttonProps={{ size: 'small' }}
          sxs={{
            root: { flexGrow: 1 },
            container: { bgcolor: hasSelected ? 'action.selected' : UNDEFINED },
            checkbox: { padding: '5px', borderRadius: 0 }
          }}
        />
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
              <ListItemText
                primary={<ItemDisplay item={item} showNavigableAsLinks />}
                secondary={
                  <FormattedMessage
                    defaultMessage="submitted to <render_target>{publishingTarget}</render_target> by {name}"
                    values={{
                      name: item.sandbox.modifier,
                      publishingTarget: item.stateMap.submittedToLive ? 'live' : 'staging',
                      render_target(target: string[]) {
                        return (
                          <Typography
                            component="span"
                            fontWeight="bold"
                            color={target[0] === 'live' ? LIVE_COLOUR : STAGING_COLOUR}
                          >
                            {messages[target[0]] ? formatMessage(messages[target[0]]).toLowerCase() : target[0]}
                          </Typography>
                        );
                      }
                    }}
                  />
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
