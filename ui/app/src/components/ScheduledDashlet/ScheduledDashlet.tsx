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
import React, { ReactNode, useCallback, useEffect } from 'react';
import {
  DashletEmptyMessage,
  DashletItemOptions,
  getItemSkeleton,
  List,
  ListItemIcon,
  Pager
} from '../DashletCard/dashletCommons';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchScheduled } from '../../services/dashboard';
import { DetailedItem, LookupTable } from '../../models';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
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
import { LoadingIconButton } from '../LoadingIconButton';
import Box from '@mui/material/Box';
import SystemType from '../../models/SystemType';
import DashletFilter from '../ActivityDashlet/DashletFilter';
import useDashletFilterState from '../../hooks/useDashletFilterState';
import useUpdateRefs from '../../hooks/useUpdateRefs';

export interface ScheduledDashletProps extends CommonDashletProps {}

interface ScheduledDashletState extends WithSelectedState<DetailedItem> {
  total: number;
  loading: boolean;
  loadingSkeleton: boolean;
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
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
    {
      loading,
      loadingSkeleton,
      total,
      items,
      isAllSelected,
      hasSelected,
      selected,
      selectedCount,
      limit,
      offset,
      sortOrder,
      sortBy
    },
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
    offset: 0,
    sortBy: 'dateScheduled',
    sortOrder: 'asc'
  });
  const currentPage = offset / limit;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const [itemsById, setItemsById] = useSpreadState<LookupTable<DetailedItem>>({});
  const selectedItems = Object.values(itemsById)?.filter((item) => selected[item.id]) ?? [];
  const selectionOptions = useSelectionOptions(selectedItems, formatMessage, selectedCount);
  const filterState = useDashletFilterState('scheduledDashlet');
  const refs = useUpdateRefs({
    currentPage,
    filterState,
    loadPagesUntil: null as (pageNumber: number, itemTypes?: Array<SystemType>, backgroundRefresh?: boolean) => void
  });

  const loadPage = useCallback(
    (pageNumber: number, itemTypes?: Array<SystemType>, backgroundRefresh?: boolean) => {
      const newOffset = pageNumber * limit;
      setState({
        loading: true,
        loadingSkeleton: !backgroundRefresh
      });
      fetchScheduled(site, {
        limit,
        offset: newOffset,
        itemType: refs.current.filterState.selectedTypes,
        sortBy,
        sortOrder
      }).subscribe((items) => {
        setState({ items, total: items.total, offset: newOffset, loading: false });
      });
    },
    [limit, setState, site, sortBy, sortOrder, refs]
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
    (pageNumber: number, itemTypes?: Array<SystemType>, backgroundRefresh?: boolean) => {
      setState({
        loading: true,
        loadingSkeleton: !backgroundRefresh,
        ...(!loadingSkeleton && { items: null })
      });
      const totalLimit = pageNumber * limit;
      fetchScheduled(site, {
        limit: totalLimit + limit,
        offset: 0,
        itemType: refs.current.filterState.selectedTypes,
        sortBy,
        sortOrder
      }).subscribe((scheduledItems) => {
        const validatedState = getValidatedSelectionState(scheduledItems, selected, limit);
        setItemsById(validatedState.itemsById);
        setState(validatedState.state);
      });
    },
    [limit, selected, setState, site, setItemsById, loadingSkeleton, sortBy, sortOrder, refs]
  );
  refs.current.loadPagesUntil = loadPagesUntil;

  const onRefresh = () => {
    loadPagesUntil(currentPage, filterState.selectedTypes, true);
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

  useEffect(() => {
    refs.current.loadPagesUntil(refs.current.currentPage, filterState.selectedTypes);
  }, [filterState?.selectedTypes, refs]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [workflowEvent.type, publishEvent.type, deleteContentEvent.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      loadPagesUntil(currentPage, filterState.selectedTypes, true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [currentPage, loadPagesUntil, filterState?.selectedTypes]);
  // endregion

  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="scheduledDashlet.widgetTitle" defaultMessage="Scheduled for Publish" />}
      headerAction={
        <LoadingIconButton onClick={onRefresh} loading={loading}>
          <RefreshRounded />
        </LoadingIconButton>
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
          noSelectionContent={<DashletFilter selectedKeys={filterState.selectedKeys} onChange={filterState.onChange} />}
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
            onPagePickerChange={(page) => loadPage(page, filterState.selectedTypes)}
            onPageChange={(page) => loadPage(page, filterState.selectedTypes)}
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
      {loading && loadingSkeleton && getItemSkeleton({ numOfItems: 3, showAvatar: false, showCheckbox: true })}
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
                    titleDisplayProp="path"
                    onClick={(e) =>
                      isPage(item.systemType) || item.availableActionsMap.view ? onItemClick(e, item) : null
                    }
                    showNavigableAsLinks={isPage(item.systemType) || item.availableActionsMap.view}
                  />
                }
                secondary={
                  <FormattedMessage
                    defaultMessage="Approved by {name} for <render_target>{publishingTarget}</render_target> at {date}"
                    values={{
                      name: item.sandbox?.submitter?.username ?? item.sandbox?.modifier?.username,
                      publishingTarget: item.stateMap.submittedToLive ? 'live' : 'staging',
                      render_target(target: ReactNode[]) {
                        return (
                          <Box component="span" color={target[0] === 'live' ? LIVE_COLOUR : STAGING_COLOUR}>
                            {messages[target[0] as string]
                              ? formatMessage(messages[target[0] as string]).toLowerCase()
                              : target[0]}
                          </Box>
                        );
                      },
                      date: asLocalizedDateTime(
                        item.stateMap.submittedToLive ? item.live.dateScheduled : item.staging.dateScheduled,
                        locale.localeCode,
                        locale.dateTimeFormatOptions
                      )
                    }}
                  />
                }
              />
              <DashletItemOptions path={item.path} />
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
