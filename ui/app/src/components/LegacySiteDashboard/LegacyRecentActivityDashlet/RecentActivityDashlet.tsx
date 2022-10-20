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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LookupTable from '../../../models/LookupTable';
import ApiResponse from '../../../models/ApiResponse';
import { AllItemActions, DetailedItem } from '../../../models/Item';
import { fetchLegacyUserActivities } from '../../../services/dashboard';
import useStyles from './styles';
import {
  getNumOfMenuOptionsForItem,
  getSystemTypeFromPath,
  parseLegacyItemToDetailedItem
} from '../../../utils/content';
import LegacyDashletCard from '../LegacyDashletCard';
import { FormattedMessage, useIntl } from 'react-intl';
import RecentActivityDashletGridUI from '../LegacyRecentActivityDashletGrid/RecentActivityDashletGridUI';
import { useDispatch, useSelector } from 'react-redux';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import RecentActivityDashletUiSkeleton from '../LegacyRecentActivityDashletGrid/RecentActivityDashletUISkeleton';
import GlobalState from '../../../models/GlobalState';
import { deleteContentEvent, publishEvent, workflowEvent } from '../../../state/actions/system';
import { getHostToHostBus } from '../../../utils/subjects';
import { filter, map, switchMap } from 'rxjs/operators';
import TextField from '@mui/material/TextField';
import { useLocale } from '../../../hooks/useLocale';
import { LegacyDashboardPreferences } from '../../../models/Dashboard';
import { useSpreadState } from '../../../hooks/useSpreadState';
import { getStoredDashboardPreferences, setStoredDashboardPreferences } from '../../../utils/state';
import { createPresenceTable } from '../../../utils/array';
import { showItemMegaMenu } from '../../../state/actions/dialogs';
import {
  generateMultipleItemOptions,
  generateSingleItemOptions,
  itemActionDispatcher
} from '../../../utils/itemActions';
import { useEnv } from '../../../hooks/useEnv';
import ActionsBar, { ActionsBarAction } from '../../ActionsBar';
import translations from './translations';
import { EmptyState, getEmptyStateStyleSet } from '../../EmptyState/EmptyState';
import { useActiveSite } from '../../../hooks/useActiveSite';
import { fetchItemsByPath } from '../../../services/content';
import useItemsByPath from '../../../hooks/useItemsByPath';
import useFetchSandboxItems from '../../../hooks/useFetchSandboxItems';
import useSelection from '../../../hooks/useSelection';
import { ApiResponseErrorState } from '../../ApiResponseErrorState';

const dashletInitialPreferences: LegacyDashboardPreferences = {
  filterBy: 'page',
  numItems: 10,
  expanded: true,
  excludeLiveItems: false
};

const actionsToBeShown: AllItemActions[] = [
  'edit',
  'delete',
  'publish',
  'rejectPublish',
  'duplicate',
  'duplicateAsset',
  'dependencies',
  'history'
];

export function RecentActivityDashlet() {
  const [fetchingActivity, setFetchingActivity] = useState(false);
  const [errorActivity, setErrorActivity] = useState<ApiResponse>();
  const [items, setItems] = useState<DetailedItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const { id: siteId, uuid } = useActiveSite();
  const currentUser = useSelector<GlobalState, string>((state) => state.user.username);
  const dashletPreferencesId = 'recentActivityDashlet';
  const [preferences, setPreferences] = useSpreadState(
    getStoredDashboardPreferences(currentUser, uuid, dashletPreferencesId) ?? dashletInitialPreferences
  );
  const [selectedLookup, setSelectedLookup] = useState<LookupTable<boolean>>({});
  const [sortType, setSortType] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState('dateModified');
  const locale = useLocale();
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const itemsByPath = useItemsByPath();
  useFetchSandboxItems(Object.keys(selectedLookup));
  const itemsBeingFetchedByPath = useSelection((state) => state.content.itemsBeingFetchedByPath);
  const isFetching = useMemo(() => {
    return Object.keys(selectedLookup).some((path) => itemsBeingFetchedByPath[path]);
  }, [itemsBeingFetchedByPath, selectedLookup]);

  const isAllChecked = useMemo(() => {
    const nonDeletedItems = items.filter((item) => !item.stateMap.deleted);
    if (nonDeletedItems.length) {
      // Is there at least one (non deleted item) that's not checked? If so, they're NOT all checked.
      return !nonDeletedItems.some((item) => !selectedLookup[item.path]);
    } else {
      return false;
    }
  }, [items, selectedLookup]);

  const isIndeterminate = useMemo(
    () => items.some((item) => selectedLookup[item.path] && !isAllChecked),
    [items, selectedLookup, isAllChecked]
  );

  const selectedItemsLength = useMemo(() => Object.values(selectedLookup).filter(Boolean).length, [selectedLookup]);

  const onFilterChange = (e) => {
    setPreferences({
      filterBy: e.target.value
    });
  };

  const onNumItemsChange = (e) => {
    setPreferences({
      numItems: e.target.value
    });
  };

  useEffect(() => {
    setStoredDashboardPreferences(preferences, currentUser, uuid, dashletPreferencesId);
  }, [preferences, currentUser, uuid]);

  const onToggleHideLiveItems = (e) => {
    e.stopPropagation();
    setPreferences({ excludeLiveItems: !preferences.excludeLiveItems });
  };

  const toggleSortType = () => {
    setSortType(sortType === 'asc' ? 'desc' : 'asc');
  };

  const fetchActivity = useCallback(
    (backgroundRefresh?: boolean) => {
      if (!backgroundRefresh) {
        setFetchingActivity(true);
      }
      fetchLegacyUserActivities(
        siteId,
        currentUser,
        'eventDate',
        true,
        preferences.numItems,
        preferences.filterBy,
        preferences.excludeLiveItems
      )
        .pipe(
          switchMap((activities) => {
            const paths = [];
            const pathsToFetch = [];
            const deleted = {};
            const legacyItems = {};
            activities.documents.forEach((item) => {
              let legacyToDetailedParsedItem = parseLegacyItemToDetailedItem(item);
              let path = legacyToDetailedParsedItem.path;
              legacyItems[path] = legacyToDetailedParsedItem;
              paths.push(path);
              if (item.isDeleted) {
                deleted[path] = legacyToDetailedParsedItem;
              } else {
                pathsToFetch.push(path);
              }
            });
            return fetchItemsByPath(siteId, pathsToFetch, { castAsDetailedItem: true }).pipe(
              map((items) => {
                // The idea is to present the items in the same order that the original call returned.
                const itemLookup = items.reduce((lookup, item) => {
                  lookup[item.path] = item;
                  return lookup;
                }, {});
                return {
                  total: activities.total,
                  items: paths.map((path) => ({
                    ...(itemLookup[path] ?? deleted[path] ?? legacyItems[path]),
                    live: itemLookup[path]?.stateMap.live ? legacyItems[path].live : null,
                    staging: itemLookup[path]?.stateMap.staged ? legacyItems[path].staging : null
                  }))
                };
              })
            );
          })
        )
        .subscribe({
          next(response) {
            setTotalItems(response.total);
            setItems(response.items);
            if (!backgroundRefresh) {
              setFetchingActivity(false);
            }
          },
          error(e) {
            setErrorActivity(e);
            if (!backgroundRefresh) {
              setFetchingActivity(false);
            }
          }
        });
    },
    [siteId, currentUser, preferences.numItems, preferences.filterBy, preferences.excludeLiveItems]
  );

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [deleteContentEvent.type, workflowEvent.type, publishEvent.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      if (type === deleteContentEvent.type) {
        setSelectedLookup({});
      }
      fetchActivity();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchActivity, selectedLookup]);
  // endregion

  const onToggleCheckedAll = () => {
    if (isAllChecked) {
      setSelectedLookup({});
    } else {
      setSelectedLookup({
        ...selectedLookup,
        ...createPresenceTable(
          items.filter((item) => !item.stateMap.deleted),
          true,
          (item) => item.path
        )
      });
    }
  };

  const handleItemChecked = (path: string) => {
    setSelectedLookup({ ...selectedLookup, [path]: !selectedLookup[path] });
  };

  const onItemMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem) => {
    const path = item.path;
    dispatch(
      showItemMegaMenu({
        path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top: event.clientY, left: event.clientX },
        numOfLoaderItems: getNumOfMenuOptionsForItem({
          path: item.path,
          systemType: getSystemTypeFromPath(item.path)
        } as DetailedItem)
      })
    );
  };

  const onActionBarOptionClicked = (option: string) => {
    if (option === 'clear') {
      setSelectedLookup({});
    } else {
      const selected = items.filter((item) => selectedLookup[item.path]);
      itemActionDispatcher({
        site: siteId,
        item: selected.length > 1 ? selected : selected[0],
        option: option as AllItemActions,
        authoringBase,
        dispatch,
        formatMessage
      });
    }
  };

  const selectionOptions = useMemo(() => {
    const selected = Object.keys(selectedLookup).filter((path) => selectedLookup[path]);
    if (selected.length === 0) {
      return null;
    } else if (selected.length) {
      if (selected.length === 1) {
        const path = selected[0];
        const item = itemsByPath[path];
        return generateSingleItemOptions(item, formatMessage, { includeOnly: actionsToBeShown }).flat();
      } else {
        let items = [];
        selected.forEach((itemPath) => {
          const item = itemsByPath[itemPath];
          if (item) {
            items.push(item);
          }
        });
        return generateMultipleItemOptions(items, formatMessage, { includeOnly: actionsToBeShown });
      }
    }
  }, [formatMessage, itemsByPath, selectedLookup]);

  return (
    <LegacyDashletCard
      title={
        <>
          <FormattedMessage id="recentActivityDashlet.dashletTitle" defaultMessage="My Recent Activity" /> (
          {items.length})
        </>
      }
      onToggleExpanded={() => setPreferences({ expanded: !preferences.expanded })}
      expanded={preferences.expanded}
      refreshDisabled={fetchingActivity}
      onRefresh={fetchActivity}
      headerRightSection={
        <>
          <Button onClick={onToggleHideLiveItems} className={classes.rightAction}>
            {preferences.excludeLiveItems ? (
              <FormattedMessage id="recentActivityDashlet.showLiveItems" defaultMessage="Show Live Items" />
            ) : (
              <FormattedMessage id="recentActivityDashlet.hideLiveItems" defaultMessage="Hide Live Items" />
            )}
          </Button>
          <TextField
            label={<FormattedMessage id="words.show" defaultMessage="Show" />}
            select
            size="small"
            value={preferences.numItems}
            disabled={fetchingActivity}
            onChange={onNumItemsChange}
            onClick={(e) => e.stopPropagation()}
            className={classes.rightAction}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            {totalItems > 0 && (
              <MenuItem value={totalItems}>
                <FormattedMessage id="words.all" defaultMessage="All" /> ({totalItems})
              </MenuItem>
            )}
          </TextField>
          <TextField
            label={<FormattedMessage id="recentActivityDashlet.filterBy" defaultMessage="Filter by" />}
            select
            size="small"
            value={preferences.filterBy}
            disabled={fetchingActivity}
            onChange={onFilterChange}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem value="page">
              <FormattedMessage id="words.pages" defaultMessage="Pages" />
            </MenuItem>
            <MenuItem value="component">
              <FormattedMessage id="words.components" defaultMessage="Components" />
            </MenuItem>
            <MenuItem value="asset">
              <FormattedMessage id="words.assets" defaultMessage="Assets" />
            </MenuItem>
            <MenuItem value="all">
              <FormattedMessage id="words.all" defaultMessage="All" />
            </MenuItem>
          </TextField>
        </>
      }
    >
      {errorActivity ? (
        <ApiResponseErrorState error={errorActivity} />
      ) : fetchingActivity ? (
        <RecentActivityDashletUiSkeleton numOfItems={items.length} />
      ) : items ? (
        items.length ? (
          <>
            {(isIndeterminate || isAllChecked) && (
              <ActionsBar
                classes={{
                  root: classes.actionsBarRoot,
                  checkbox: classes.actionsBarCheckbox
                }}
                options={
                  selectionOptions?.concat([
                    { id: 'clear', label: formatMessage(translations.clear, { count: selectedItemsLength }) }
                  ]) as ActionsBarAction[]
                }
                isIndeterminate={isIndeterminate}
                isChecked={isAllChecked}
                isLoading={isFetching}
                numOfSkeletonItems={selectedItemsLength > 1 ? 3 : 7}
                onOptionClicked={onActionBarOptionClicked}
                onCheckboxChange={onToggleCheckedAll}
              />
            )}
            <RecentActivityDashletGridUI
              items={items}
              onOptionsButtonClick={onItemMenuClick}
              selectedLookup={selectedLookup}
              isAllChecked={isAllChecked}
              isIndeterminate={isIndeterminate}
              locale={locale}
              sortType={sortType}
              toggleSortType={toggleSortType}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onItemChecked={handleItemChecked}
              onClickSelectAll={onToggleCheckedAll}
            />
          </>
        ) : (
          <EmptyState
            title={<FormattedMessage id="recentActivityDashlet.emptyMessage" defaultMessage="No recent activity" />}
            styles={{
              ...getEmptyStateStyleSet('horizontal'),
              ...getEmptyStateStyleSet('image-sm')
            }}
          />
        )
      ) : (
        <></>
      )}
    </LegacyDashletCard>
  );
}

export default RecentActivityDashlet;
