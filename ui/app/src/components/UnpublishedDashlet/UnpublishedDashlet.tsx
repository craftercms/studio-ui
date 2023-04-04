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
  isPage,
  previewPage,
  useSelectionOptions,
  useSpreadStateWithSelected,
  WithSelectedState
} from '../SiteDashboard/utils';
import DashletCard from '../DashletCard/DashletCard';
import palette from '../../styles/palette';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useCallback, useEffect, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import useLocale from '../../hooks/useLocale';
import useEnv from '../../hooks/useEnv';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchUnpublished } from '../../services/dashboard';
import { DashletEmptyMessage, getItemSkeleton, List, ListItemIcon, Pager } from '../DashletCard/dashletCommons';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { asLocalizedDateTime } from '../../utils/datetime';
import ItemDisplay from '../ItemDisplay';
import { DetailedItem, LookupTable, SandboxItem } from '../../models';
import ActionsBar from '../ActionsBar';
import { UNDEFINED } from '../../utils/constants';
import { itemActionDispatcher } from '../../utils/itemActions';
import { useDispatch } from 'react-redux';
import { parseSandBoxItemToDetailedItem } from '../../utils/content';
import ListItemButton from '@mui/material/ListItemButton';
import { contentEvent, deleteContentEvent, publishEvent, workflowEvent } from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import translations from '../SiteDashboard/translations';
import useSpreadState from '../../hooks/useSpreadState';

interface UnpublishedDashletProps extends CommonDashletProps {}

interface UnpublishedDashletState extends WithSelectedState<SandboxItem> {
  total: number;
  loading: boolean;
  limit: number;
  offset: number;
}

export function UnpublishedDashlet(props: UnpublishedDashletProps) {
  const { borderLeftColor = palette.blue.tint, onMinimize } = props;
  const site = useActiveSiteId();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const [
    { loading, total, items, isAllSelected, hasSelected, selected, selectedCount, limit, offset },
    setState,
    onSelectItem,
    onSelectAll,
    isSelected
  ] = useSpreadStateWithSelected<UnpublishedDashletState>({
    loading: false,
    total: null,
    limit: 10,
    offset: 0
  });
  const currentPage = offset / limit;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const [itemsByPath, setItemsByPath] = useSpreadState<LookupTable<DetailedItem>>({});
  const selectedItems = Object.values(itemsByPath)?.filter((item) => selected[item.id]) ?? [];
  const selectionOptions = useSelectionOptions(selectedItems, formatMessage, selectedCount);
  const isIndeterminate = hasSelected && !isAllSelected;
  const onRefresh = useMemo(
    () => () => {
      setState({
        items: null,
        selected: {},
        hasSelected: false,
        isAllSelected: false,
        selectedCount: 0,
        loading: true
      });
      fetchUnpublished(site, { limit, offset: 0 }).subscribe((items) => {
        setState({ loading: false, items, offset: 0, total: items.total });
      });
    },
    [setState, site, limit]
  );

  const loadPage = useCallback(
    (pageNumber: number, backgroundRefresh?: boolean) => {
      const newOffset = pageNumber * limit;
      if (!backgroundRefresh) {
        setState({ loading: true });
      }
      fetchUnpublished(site, { limit, offset: newOffset }).subscribe((items) => {
        setState({ items, offset: newOffset, total: items.total, ...(!backgroundRefresh && { loading: false }) });
      });
    },
    [limit, setState, site]
  );

  const onOptionClicked = (option) => {
    if (option === 'clear') {
      setState({ selectedCount: 0, isAllSelected: false, selected: {}, hasSelected: false });
    } else {
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
        itemsObj[item.id] = parseSandBoxItemToDetailedItem(item);
      });
      setItemsByPath(itemsObj);
    }
  }, [items, setItemsByPath]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [deleteContentEvent.type, workflowEvent.type, publishEvent.type, contentEvent.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      loadPage(0, true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [loadPage]);
  // endregion

  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="unpublishedDashlet.widgetTitle" defaultMessage="Unpublished Work" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
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
          isIndeterminate={isIndeterminate}
          onCheckboxChange={onSelectAll}
          onOptionClicked={onOptionClicked}
          options={selectionOptions?.concat([
            ...(selectedCount > 0
              ? [
                  {
                    id: 'clear',
                    label: formatMessage(translations.clear, { count: selectedCount })
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
    >
      {loading && getItemSkeleton({ numOfItems: 3, showAvatar: false, showCheckbox: true })}
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
                    showPublishingTarget={false}
                    onClick={(e) =>
                      isPage(item.systemType) || item.availableActionsMap.view ? onItemClick(e, item) : null
                    }
                    showNavigableAsLinks={isPage(item.systemType) || item.availableActionsMap.view}
                  />
                }
                secondary={
                  <Typography color="text.secondary" variant="body2">
                    <FormattedMessage
                      id="unpublishedDashlet.entrySecondaryText"
                      defaultMessage="Edited by {name} on {date}"
                      values={{
                        name: item.modifier,
                        date: asLocalizedDateTime(item.dateModified, locale.localeCode, locale.dateTimeFormatOptions)
                      }}
                    />
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}
      {/* TODO: remove or statement once backend is fixed (total doesn't match) */}
      {(total === 0 || (total && items?.length === 0)) && (
        <DashletEmptyMessage>
          <FormattedMessage
            id="unpublishedDashlet.noUnpublishedItems"
            defaultMessage="There are no unpublished items"
          />
        </DashletEmptyMessage>
      )}
    </DashletCard>
  );
}

export default UnpublishedDashlet;
