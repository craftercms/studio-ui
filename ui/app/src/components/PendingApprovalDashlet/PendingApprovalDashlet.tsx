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

import React, { ReactNode, useCallback, useEffect } from 'react';
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
import {
  DashletEmptyMessage,
  DashletItemOptions,
  getItemSkeleton,
  List,
  ListItemIcon,
  Pager
} from '../DashletCard/dashletCommons';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import palette from '../../styles/palette';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { fetchPendingApproval } from '../../services/dashboard';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { DetailedItem, LookupTable } from '../../models';
import { LIVE_COLOUR, STAGING_COLOUR } from '../ItemPublishingTargetIcon/styles';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ItemDisplay from '../ItemDisplay';
import { ActionsBar } from '../ActionsBar';
import { UNDEFINED } from '../../utils/constants';
import { itemActionDispatcher } from '../../utils/itemActions';
import useEnv from '../../hooks/useEnv';
import { useDispatch } from 'react-redux';
import ListItemButton from '@mui/material/ListItemButton';
import { deleteContentEvent, publishEvent, workflowEvent } from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import useSpreadState from '../../hooks/useSpreadState';
import { LoadingIconButton } from '../LoadingIconButton';
import Box from '@mui/material/Box';
import { asLocalizedDateTime } from '../../utils/datetime';
import useLocale from '../../hooks/useLocale';
import SystemType from '../../models/SystemType';
import DashletFilter from '../ActivityDashlet/DashletFilter';
import useDashletFilterState from '../../hooks/useDashletFilterState';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { reversePluckProps } from '../../utils/object';

interface PendingApprovalDashletProps extends CommonDashletProps {}

interface PendingApprovalDashletState extends WithSelectedState<DetailedItem> {
  loading: boolean;
  loadingSkeleton: boolean;
  total: number;
  limit: number;
  offset: number;
}

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

export function PendingApprovalDashlet(props: PendingApprovalDashletProps) {
  const { borderLeftColor = palette.purple.tint, onMinimize } = props;
  const [
    { items, total, loading, loadingSkeleton, isAllSelected, hasSelected, selected, selectedCount, limit, offset },
    setState,
    onSelectItem,
    onSelectAll,
    isSelected
  ] = useSpreadStateWithSelected<PendingApprovalDashletState>({
    items: null,
    total: null,
    loading: false,
    loadingSkeleton: true,
    selected: {},
    isAllSelected: false,
    hasSelected: false,
    limit: 50,
    offset: 0
  });
  const { formatMessage } = useIntl();
  const currentPage = offset / limit;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const [itemsById, setItemsById] = useSpreadState<LookupTable<DetailedItem>>({});
  const selectedItems = Object.values(itemsById)?.filter((item) => selected[item.id]) ?? [];
  const selectionOptions = useSelectionOptions(Object.values(selectedItems), formatMessage, selectedCount);
  const site = useActiveSiteId();
  const locale = useLocale();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const filterState = useDashletFilterState('pendingApprovalDashlet');
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
      fetchPendingApproval(site, {
        limit,
        offset: newOffset,
        itemType: refs.current.filterState.selectedTypes
      }).subscribe((items) => {
        setState({ items, total: items.total, offset: newOffset, loading: false });
      });
    },
    [limit, setState, site, refs]
  );

  const loadPagesUntil = useCallback(
    (pageNumber: number, itemTypes?: Array<SystemType>, backgroundRefresh?: boolean) => {
      setState({
        loading: true,
        loadingSkeleton: !backgroundRefresh,
        ...(!backgroundRefresh && { items: null })
      });
      const totalLimit = pageNumber * limit;
      fetchPendingApproval(site, {
        limit: totalLimit + limit,
        offset: 0,
        itemType: refs.current.filterState.selectedTypes
      }).subscribe((pendingApprovalItems) => {
        const validatedState = getValidatedSelectionState(pendingApprovalItems, selected, limit);
        setItemsById(validatedState.itemsById);
        setState(validatedState.state);
      });
    },
    [limit, selected, setState, site, setItemsById, refs]
  );
  refs.current.loadPagesUntil = loadPagesUntil;

  const onRefresh = () => {
    loadPagesUntil(currentPage, filterState.selectedTypes, true);
  };

  useEffect(() => {
    loadPage(0, refs.current.filterState.selectedTypes);
  }, [loadPage, refs]);

  useEffect(() => {
    refs.current.loadPagesUntil(refs.current.currentPage, filterState.selectedTypes);
  }, [filterState?.selectedTypes, refs]);

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

  useEffect(() => {
    if (items) {
      const itemsObj = {};
      items.forEach((item) => {
        itemsObj[item.id] = item;
      });
      setItemsById(itemsObj);
    }
  }, [items, setItemsById]);

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
      sxs={{
        actionsBar: { padding: 0 },
        content: { padding: 0 },
        footer: {
          justifyContent: 'space-between'
        }
      }}
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
      headerAction={
        <LoadingIconButton onClick={onRefresh} loading={loading}>
          <RefreshRounded />
        </LoadingIconButton>
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
    >
      {loading && loadingSkeleton && getItemSkeleton({ numOfItems: 3, showAvatar: false, showCheckbox: true })}
      {Boolean(items?.length) && (
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
                    defaultMessage="Submitted {submittedDate} by {name} to {publishingTarget, select, live {go <render_target>live</render_target>} other {be <render_target>staged</render_target>}} {requestType, select, scheduled {on} other {}} {date}"
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
                      requestType: item.live.dateScheduled || item.staging.dateScheduled ? 'scheduled' : 'asap',
                      date:
                        item.live.dateScheduled || item.staging.dateScheduled ? (
                          asLocalizedDateTime(
                            item.stateMap.submittedToLive ? item.live.dateScheduled : item.staging.dateScheduled,
                            locale.localeCode,
                            locale.dateTimeFormatOptions
                          )
                        ) : (
                          <FormattedMessage defaultMessage="ASAP" />
                        ),
                      submittedDate: asLocalizedDateTime(
                        item.sandbox?.dateSubmitted,
                        locale.localeCode,
                        reversePluckProps(locale.dateTimeFormatOptions, 'hour', 'minute', 'second')
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

export default PendingApprovalDashlet;
