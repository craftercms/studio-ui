/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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
import RecentlyPublishedWidgetUI from './RecentlyPublishedDashletUI';
import ApiResponse from '../../models/ApiResponse';
import { DashboardPreferences } from '../../models/Dashboard';
import { fetchLegacyDeploymentHistory } from '../../services/dashboard';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { DetailedItem } from '../../models/Item';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath, parseLegacyItemToDetailedItem } from '../../utils/content';
import LookupTable from '../../models/LookupTable';
import Dashlet from '../Dashlet';
import useStyles from './styles';
import RecentlyPublishedDashletUISkeletonTable from './RecentlyPublishedDashletUISkeletonTable';
import TextField from '@mui/material/TextField';
import { itemsApproved, itemsDeleted, itemsRejected, itemsScheduled } from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { filter } from 'rxjs/operators';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { useLocale } from '../../utils/hooks/useLocale';
import { getStoredDashboardPreferences, setStoredDashboardPreferences } from '../../utils/state';
import { useDispatch, useSelector } from 'react-redux';
import GlobalState from '../../models/GlobalState';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { getEmptyStateStyleSet } from '../SystemStatus/EmptyState';
import { useActiveSite } from '../../utils/hooks/useActiveSite';
import { asLocalizedDateTime } from '../../utils/datetime';
import { reversePluckProps } from '../../utils/object';

export interface DashboardItem {
  label: string;
  children: string[];
}

const dashletInitialPreferences: DashboardPreferences = {
  filterBy: 'page',
  numItems: 20,
  expanded: true
};

export default function RecentlyPublishedDashlet() {
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<ApiResponse>();
  const [parentItems, setParentItems] = useState<DashboardItem[]>();
  const [itemsLookup, setItemsLookup] = useSpreadState<LookupTable<DetailedItem>>({});
  const dashletPreferencesId = 'recentlyPublishedDashlet';
  const currentUser = useSelector<GlobalState, string>((state) => state.user.username);
  const { id: siteId, uuid } = useActiveSite();
  const [preferences, setPreferences] = useSpreadState(
    getStoredDashboardPreferences(currentUser, uuid, dashletPreferencesId) ?? dashletInitialPreferences
  );
  const [expandedItems, setExpandedItems] = useSpreadState<LookupTable<boolean>>({});
  const localeBranch = useLocale();
  const classes = useStyles();
  const dispatch = useDispatch();

  const allCollapsed = useMemo(
    () => Object.keys(expandedItems).every((key) => !Boolean(expandedItems[key])),
    [expandedItems]
  );

  const toggleCollapseAllItems = useCallback(
    (documents, expanded) => {
      documents.forEach((document) => {
        setExpandedItems({
          [document.label]: expanded
        });
      });
    },
    [setExpandedItems]
  );

  const onFilterChange = (e) => {
    e.stopPropagation();
    setPreferences({
      filterBy: e.target.value
    });
  };

  const onNumItemsChange = (e) => {
    e.stopPropagation();
    setPreferences({
      numItems: e.target.value
    });
  };

  useEffect(() => {
    setStoredDashboardPreferences(preferences, currentUser, uuid, dashletPreferencesId);
  }, [preferences, currentUser, uuid]);

  const onCollapseAll = (e) => {
    e.stopPropagation();
    toggleCollapseAllItems(parentItems, allCollapsed);
  };

  const fetchHistory = useCallback(() => {
    setFetchingHistory(true);
    fetchLegacyDeploymentHistory(siteId, 30, preferences.numItems, preferences.filterBy).subscribe(
      (history) => {
        const parentItems = [];
        const childrenLookup = {};
        history.documents.forEach((document) => {
          if (document.children.length) {
            parentItems.push({
              label: asLocalizedDateTime(
                document.internalName,
                localeBranch.localeCode,
                reversePluckProps(localeBranch.dateTimeFormatOptions, 'hour', 'minute', 'second')
              ),
              children: document.children.map((item) => {
                const key = `${item.uri}:${item.eventDate}`;
                childrenLookup[key] = parseLegacyItemToDetailedItem(item);
                // For this dashlet, the property needed is eventDate, since we display the published date at the moment
                // of the publishing, not the current.
                childrenLookup[key].live.datePublished = item.eventDate;
                childrenLookup[key].staging.datePublished = item.eventDate;
                return key;
              })
            });
          }
          setItemsLookup(childrenLookup);
        });
        setParentItems(parentItems);
        toggleCollapseAllItems(parentItems, true);
        setFetchingHistory(false);
      },
      (e) => {
        setErrorHistory(e);
        setFetchingHistory(false);
      }
    );
  }, [siteId, preferences.numItems, preferences.filterBy, toggleCollapseAllItems, setItemsLookup]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [itemsDeleted.type, itemsRejected.type, itemsApproved.type, itemsScheduled.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        case itemsApproved.type:
        case itemsScheduled.type:
        case itemsDeleted.type:
        case itemsRejected.type: {
          if (payload.targets.some((path) => itemsLookup[path])) {
            fetchHistory();
          }
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchHistory, itemsLookup]);
  // endregion

  const resource = useLogicResource<DashboardItem[], { items: DashboardItem[]; error: ApiResponse; fetching: boolean }>(
    useMemo(
      () => ({ items: parentItems, error: errorHistory, fetching: fetchingHistory }),
      [parentItems, errorHistory, fetchingHistory]
    ),
    {
      shouldResolve: (source) => Boolean(source.items) && !fetchingHistory,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetchingHistory && resource.complete,
      resultSelector: (source) => source.items,
      errorSelector: () => errorHistory
    }
  );

  const onItemMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem) => {
    const path = item.path;
    dispatch(
      batchActions([
        completeDetailedItem({ path }),
        showItemMegaMenu({
          path,
          anchorReference: 'anchorPosition',
          anchorPosition: { top: event.clientY, left: event.clientX },
          numOfLoaderItems: getNumOfMenuOptionsForItem({
            path: item.path,
            systemType: getSystemTypeFromPath(item.path)
          } as DetailedItem)
        })
      ])
    );
  };

  return (
    <Dashlet
      title={
        <FormattedMessage
          id="recentlyPublishedDashlet.dashletTitle"
          defaultMessage="RecentlyPublished ({total})"
          values={{
            total: Object.keys(itemsLookup).length
          }}
        />
      }
      onToggleExpanded={() => setPreferences({ expanded: !preferences.expanded })}
      expanded={preferences.expanded}
      refreshDisabled={fetchingHistory}
      onRefresh={fetchHistory}
      headerRightSection={
        <>
          <Button onClick={onCollapseAll} className={classes.rightAction} disabled={fetchingHistory}>
            {!allCollapsed ? (
              <FormattedMessage id="recentlyPublishedDashlet.collapseAll" defaultMessage="Collapse All" />
            ) : (
              <FormattedMessage id="recentlyPublishedDashlet.expandAll" defaultMessage="Expand All" />
            )}
          </Button>

          <TextField
            label={<FormattedMessage id="words.show" defaultMessage="Show" />}
            select
            size="small"
            value={preferences.numItems}
            disabled={fetchingHistory}
            onChange={onNumItemsChange}
            className={classes.rightAction}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            {Object.keys(itemsLookup).length && (
              <MenuItem value={Object.keys(itemsLookup).length}>
                <FormattedMessage
                  id="words.all"
                  defaultMessage="All ({total})"
                  values={{
                    total: Object.keys(itemsLookup).length
                  }}
                />
              </MenuItem>
            )}
          </TextField>
          <TextField
            label={<FormattedMessage id="recentlyPublishedDashlet.filterBy" defaultMessage="Filter by" />}
            select
            size="small"
            value={preferences.filterBy}
            disabled={fetchingHistory}
            onChange={onFilterChange}
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
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <RecentlyPublishedDashletUISkeletonTable items={parentItems} expandedLookup={expandedItems} />
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: (
              <FormattedMessage
                id="recentlyPublishedDashlet.emptyMessage"
                defaultMessage="No items published recently"
              />
            ),
            styles: {
              ...getEmptyStateStyleSet('horizontal'),
              ...getEmptyStateStyleSet('image-sm')
            }
          }
        }}
      >
        <RecentlyPublishedWidgetUI
          resource={resource}
          itemsLookup={itemsLookup}
          localeBranch={localeBranch}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
          onItemMenuClick={onItemMenuClick}
        />
      </SuspenseWithEmptyState>
    </Dashlet>
  );
}
