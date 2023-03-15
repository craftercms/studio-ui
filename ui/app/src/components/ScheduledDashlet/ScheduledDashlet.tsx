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
import DashletCard from '../DashletCard/DashletCard';
import palette from '../../styles/palette';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useMemo } from 'react';
import { DashletEmptyMessage, getItemSkeleton, List, ListItemIcon, Pager } from '../DashletCard/dashletCommons';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchScheduled } from '../../services/dashboard';
import { DetailedItem } from '../../models';
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { LIVE_COLOUR, STAGING_COLOUR } from '../ItemPublishingTargetIcon/styles';
import ItemDisplay from '../ItemDisplay';
import ListItemButton from '@mui/material/ListItemButton';
import { asLocalizedDateTime } from '../../utils/datetime';
import useLocale from '../../hooks/useLocale';
import { ActionsBar } from '../ActionsBar';
import { UNDEFINED } from '../../utils/constants';
import { itemActionDispatcher } from '../../utils/itemActions';
import { useDispatch } from 'react-redux';
import useEnv from '../../hooks/useEnv';

export interface ScheduledDashletProps extends CommonDashletProps {}

interface ScheduledDashletState extends WithSelectedState<DetailedItem> {
  total: number;
  loading: boolean;
  limit: number;
  offset: number;
}

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

export function ScheduledDashlet(props: ScheduledDashletProps) {
  const { borderLeftColor = palette.blue.tint } = props;
  const site = useActiveSiteId();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const [
    { loading, total, items, isAllSelected, hasSelected, selected, limit, offset },
    setState,
    onSelectItem,
    onSelectAll,
    isSelected
  ] = useSpreadStateWithSelected<ScheduledDashletState>({
    loading: false,
    items: null,
    total: null,
    selected: {},
    isAllSelected: false,
    hasSelected: false,
    limit: 10,
    offset: 0
  });
  const currentPage = offset / limit;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const onRefresh = useMemo(
    () => () => {
      setState({ loading: true, items: null, selected: {}, isAllSelected: false });
      fetchScheduled(site, {
        limit,
        offset: 0
      }).subscribe((items) => {
        setState({ loading: false, items, total: items.total, offset: 0 });
      });
    },
    [setState, site, limit]
  );

  const loadPage = (pageNumber: number) => {
    const newOffset = pageNumber * limit;
    setState({ loading: true });
    fetchScheduled(site, {
      limit,
      offset: newOffset,
      dateFrom: '2023-03-01T22:00:00.000Z',
      dateTo: '2023-04-28T22:00:00.000Z'
    }).subscribe((items) => {
      setState({ loading: false, items, total: items.total, offset: newOffset });
    });
  };

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

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);
  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="scheduledDashlet.widgetTitle" defaultMessage="Scheduled for Publish" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      }
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
        actionsBar: { padding: 0 },
        content: { pl: 0, pr: 0 },
        footer: {
          justifyContent: 'space-between'
        }
      }}
    >
      {loading && getItemSkeleton({ numOfItems: 3, showAvatar: true, showCheckbox: true })}
      {items && (
        <List>
          {items.map((item, index) => (
            <ListItemButton key={index} onClick={(e) => onSelectItem(e, item)} sx={{ pt: 0, pb: 0 }}>
              <ListItemIcon>
                <Checkbox edge="start" checked={isSelected(item)} onChange={(e) => onSelectItem(e, item)} />
              </ListItemIcon>
              <ListItemText
                primary={<ItemDisplay item={item} showNavigableAsLinks={false} />}
                secondary={
                  <FormattedMessage
                    id="scheduledDashlet.entrySecondaryText"
                    defaultMessage="Approved by {name} to <render_target>{publishingTarget}</render_target> on {date}"
                    values={{
                      name: item.sandbox.modifier,
                      publishingTarget: item.stateMap.submittedToLive ? 'live' : 'staging',
                      render_target(target: string[]) {
                        return (
                          <Typography component="span" color={target[0] === 'live' ? LIVE_COLOUR : STAGING_COLOUR}>
                            {messages[target[0]] ? formatMessage(messages[target[0]]).toLowerCase() : target[0]}
                          </Typography>
                        );
                      },
                      date: asLocalizedDateTime(
                        item.sandbox.dateModified,
                        locale.localeCode,
                        locale.dateTimeFormatOptions
                      )
                    }}
                  />
                }
              />
            </ListItemButton>
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

export default ScheduledDashlet;
