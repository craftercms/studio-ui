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

import {
  CommonDashletProps,
  getItemViewOption,
  getValidatedSelectionState,
  isPage,
  previewPage,
  useSelectionOptions,
  useSpreadStateWithSelected,
  WithSelectedState
} from '../SiteDashboard/utils';
import DashletCard from '../DashletCard/DashletCard';
import palette from '../../styles/palette';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import React, { useCallback, useEffect } from 'react';
import { DashletEmptyMessage, getItemSkeleton, List, ListItemIcon, Pager } from '../DashletCard/dashletCommons';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchScheduled } from '../../services/dashboard';
import { DetailedItem, LookupTable } from '../../models';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
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
import { deleteContentEvent, publishEvent, workflowEvent } from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import useSpreadState from '../../hooks/useSpreadState';
import LoadingButton from '@mui/lab/LoadingButton';

export interface ScheduledDashletProps extends CommonDashletProps {}

interface ScheduledDashletState extends WithSelectedState<DetailedItem> {
  total: number;
  loading: boolean;
  loadingSkeleton: boolean;
  limit: number;
  offset: number;
}

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

export function ScheduledDashlet(props: ScheduledDashletProps) {
  const { borderLeftColor = palette.blue.tint, onMinimize } = props;
  const site = useActiveSiteId();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const [
    { loading, loadingSkeleton, total, items, isAllSelected, hasSelected, selected, selectedCount, limit, offset },
    setState,
    onSelectItem,
    onSelectAll,
    isSelected
  ] = useSpreadStateWithSelected<ScheduledDashletState>({
    loading: false,
    loadingSkeleton: true,
    items: null,
    total: null,
    selected: {},
    isAllSelected: false,
    hasSelected: false,
    limit: 50,
    offset: 0
  });
  const currentPage = offset / limit;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const [itemsById, setItemsById] = useSpreadState<LookupTable<DetailedItem>>({});
  const selectedItems = Object.values(itemsById)?.filter((item) => selected[item.id]) ?? [];
  const selectionOptions = useSelectionOptions(selectedItems, formatMessage, selectedCount);

  const loadPage = useCallback(
    (pageNumber: number, backgroundRefresh?: boolean) => {
      const newOffset = pageNumber * limit;
      setState({
        loading: true,
        loadingSkeleton: !backgroundRefresh
      });
      fetchScheduled(site, {
        limit,
        offset: newOffset
      }).subscribe((items) => {
        setState({ items, total: items.total, offset: newOffset, loading: false });
      });
    },
    [limit, setState, site]
  );

  const onOptionClicked = (option) => {
    // Clear selection
    setState({ selectedCount: 0, isAllSelected: false, selected: {}, hasSelected: false });
    if (option !== 'clear') {
      return itemActionDispatcher({
        site,
        authoringBase,
        dispatch,
        formatMessage,
        option,
        item: selectedItems.length > 1 ? selectedItems : selectedItems[0]
      });
    }
  };

  const onItemClick = (e, item) => {
    if (isPage(item.systemType)) {
      e.stopPropagation();
      previewPage(site, authoringBase, item, dispatch, onMinimize);
    } else if (item.availableActionsMap.view) {
      e.stopPropagation();

      itemActionDispatcher({
        site,
        authoringBase,
        dispatch,
        formatMessage,
        option: getItemViewOption(item),
        item
      });
    }
  };

  const loadPagesUntil = useCallback(
    (pageNumber: number, backgroundRefresh?: boolean) => {
      setState({
        loading: true,
        loadingSkeleton: !backgroundRefresh,
        ...(!loadingSkeleton && { items: null })
      });
      const totalLimit = pageNumber * limit;
      fetchScheduled(site, { limit: totalLimit + limit, offset: 0 }).subscribe((scheduledItems) => {
        const validatedState = getValidatedSelectionState(scheduledItems, selected, limit);
        setItemsById(validatedState.itemsById);
        setState(validatedState.state);
      });
    },
    [limit, selected, setState, site, setItemsById, loadingSkeleton]
  );

  const onRefresh = () => {
    loadPagesUntil(currentPage, true);
  };

  useEffect(() => {
    if (items) {
      const itemsObj = {};
      items.forEach((item) => {
        itemsObj[item.id] = item;
      });
      setItemsById(itemsObj);
    }
  }, [items, setItemsById]);

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [workflowEvent.type, publishEvent.type, deleteContentEvent.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      loadPagesUntil(currentPage, true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [currentPage, loadPagesUntil]);
  // endregion

  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="scheduledDashlet.widgetTitle" defaultMessage="Scheduled for Publish" />}
      headerAction={
        <LoadingButton onClick={onRefresh} loading={loading} sx={{ borderRadius: '50%', padding: '8px', minWidth: 0 }}>
          <RefreshRounded />
        </LoadingButton>
      }
      actionsBar={
        <ActionsBar
          disabled={loading}
          isChecked={isAllSelected}
          isIndeterminate={hasSelected && !isAllSelected}
          onCheckboxChange={onSelectAll}
          onOptionClicked={onOptionClicked}
          options={selectionOptions?.concat([
            ...(selectedCount > 0
              ? [
                  {
                    id: 'clear',
                    label: formatMessage(
                      {
                        defaultMessage: 'Clear {count} selected'
                      },
                      { count: selectedCount }
                    )
                  }
                ]
              : [])
          ])}
          buttonProps={{ size: 'small' }}
          sxs={{
            root: { flexGrow: 1 },
            container: { bgcolor: hasSelected ? 'action.selected' : UNDEFINED },
            checkbox: { padding: '5px', borderRadius: 0 },
            button: { minWidth: 50 }
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
        content: { padding: 0 },
        footer: {
          justifyContent: 'space-between'
        }
      }}
    >
      {loading && loadingSkeleton && getItemSkeleton({ numOfItems: 3, showAvatar: true, showCheckbox: true })}
      {items && (
        <List sx={{ pb: 0 }}>
          {items.map((item, index) => (
            <ListItemButton key={index} onClick={(e) => onSelectItem(e, item)} sx={{ pt: 0, pb: 0 }}>
              <ListItemIcon>
                <Checkbox edge="start" checked={isSelected(item)} onChange={(e) => onSelectItem(e, item)} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <ItemDisplay
                    item={item}
                    onClick={(e) =>
                      isPage(item.systemType) || item.availableActionsMap.view ? onItemClick(e, item) : null
                    }
                    showNavigableAsLinks={isPage(item.systemType) || item.availableActionsMap.view}
                  />
                }
                secondary={
                  <FormattedMessage
                    defaultMessage="Approved by {name} to <render_target>{publishingTarget}</render_target> on {date}"
                    values={{
                      name: item.sandbox?.modifier,
                      publishingTarget: item.stateMap.submittedToLive ? 'live' : 'staging',
                      render_target(target: string[]) {
                        return (
                          <Typography
                            component="span"
                            sx={{ fontSize: 'inherit', lineHeight: 'inherit' }}
                            color={target[0] === 'live' ? LIVE_COLOUR : STAGING_COLOUR}
                          >
                            {messages[target[0]] ? formatMessage(messages[target[0]]).toLowerCase() : target[0]}
                          </Typography>
                        );
                      },
                      date:
                        item.sandbox?.dateModified &&
                        asLocalizedDateTime(item.sandbox.dateModified, locale.localeCode, locale.dateTimeFormatOptions)
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
