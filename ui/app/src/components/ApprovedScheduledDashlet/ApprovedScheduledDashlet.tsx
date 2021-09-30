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
import LookupTable from '../../models/LookupTable';
import Dashlet from '../Dashlet';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchLegacyScheduledItems } from '../../services/dashboard';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath, parseLegacyItemToDetailedItem } from '../../utils/content';
import ApiResponse from '../../models/ApiResponse';
import { DashboardItem } from '../AwaitingApprovalDashlet';
import { AllItemActions, DetailedItem } from '../../models/Item';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import ApprovedScheduledDashletGridUI from '../ApprovedScheduledDashletGrid';
import useStyles from './styles';
// prettier-ignore
import ApprovedScheduledDashletSkeletonTable
  from '../ApprovedScheduledDashletGrid/ApprovedScheduledDashletSkeletonTable';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { itemsApproved, itemsDeleted, itemsRejected, itemsScheduled } from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { filter } from 'rxjs/operators';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { DashboardPreferences } from '../../models/Dashboard';
import { getStoredDashboardPreferences, setStoredDashboardPreferences } from '../../utils/state';
import { useDispatch, useSelector } from 'react-redux';
import GlobalState from '../../models/GlobalState';
import { createPresenceTable } from '../../utils/array';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { itemActionDispatcher } from '../../utils/itemActions';
import { useEnv } from '../../utils/hooks/useEnv';
import ActionsBar from '../ActionsBar';
import translations from './translations';
import { batchActions } from '../../state/actions/misc';
import { getEmptyStateStyleSet } from '../SystemStatus/EmptyState';
import { useActiveSite } from '../../utils/hooks/useActiveSite';
import { asLocalizedDateTime } from '../../utils/datetime';
import { reversePluckProps } from '../../utils/object';
import { useLocale } from '../../utils/hooks/useLocale';

const dashletInitialPreferences: DashboardPreferences = {
  filterBy: 'all',
  expanded: true
};

export default function ApprovedScheduledDashlet() {
  const [selectedLookup, setSelectedLookup] = useState<LookupTable<boolean>>({});
  const [error, setError] = useState<ApiResponse>();
  const { id: siteId, uuid } = useActiveSite();
  const currentUser = useSelector<GlobalState, string>((state) => state.user.username);
  const classes = useStyles();
  const [state, setState] = useState<{
    itemsLookup: LookupTable<DetailedItem>;
    targetLookup: LookupTable<{ target: string; packageId: string }>;
    parentItems: DashboardItem[];
    total: number;
  }>({
    targetLookup: {},
    itemsLookup: {},
    parentItems: null,
    total: null
  });
  const [expandedLookup, setExpandedLookup] = useSpreadState<LookupTable<boolean>>({});
  const [isFetching, setIsFetching] = useState(false);
  const dashletPreferencesId = 'approvedScheduledDashlet';
  const [preferences, setPreferences] = useSpreadState(
    getStoredDashboardPreferences(currentUser, uuid, dashletPreferencesId) ?? dashletInitialPreferences
  );
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();

  const showExpanded = useMemo(() => Object.values(expandedLookup).some((value) => !value), [expandedLookup]);
  const isAllChecked = useMemo(
    () => !Object.keys(state.itemsLookup).some((path) => !selectedLookup[path]),
    [selectedLookup, state.itemsLookup]
  );
  const selectedItemsLength = useMemo(() => Object.values(selectedLookup).filter(Boolean).length, [selectedLookup]);
  const isIndeterminate = useMemo(
    () => Object.keys(state.itemsLookup).some((path) => selectedLookup[path]) && !isAllChecked,
    [isAllChecked, selectedLookup, state.itemsLookup]
  );
  const locale = useLocale();

  const refresh = useCallback(() => {
    setIsFetching(true);
    fetchLegacyScheduledItems(siteId, 'eventDate', false, preferences.filterBy).subscribe(
      (response) => {
        const parentItems: DashboardItem[] = [];
        const itemsLookup: LookupTable<DetailedItem> = {};
        const targetLookup: LookupTable<{ target: string; packageId: string }> = {};
        const expandedLookup: LookupTable<boolean> = {};
        response.documents.forEach((item) => {
          if (item.children.length) {
            expandedLookup[item.uri ?? item.name] = true;
            parentItems.push({
              label: asLocalizedDateTime(
                item.name,
                locale.localeCode,
                reversePluckProps(locale.dateTimeFormatOptions, 'hour', 'minute', 'second')
              ),
              path: item.uri ?? item.name,
              children: item.children.map((item) => {
                targetLookup[item.uri] = { target: item.environment, packageId: item.packageId };
                itemsLookup[item.uri] = parseLegacyItemToDetailedItem(item);
                // TODO: remove this when legacy item submittedToEnvironment is not null
                itemsLookup[item.uri].stateMap.submittedToLive = item.environment === 'live';
                itemsLookup[item.uri].stateMap.submittedToStaging = item.environment === 'staging';
                // endTODO
                return item.uri;
              })
            });
          }
        });
        setExpandedLookup(expandedLookup);
        setState({
          targetLookup,
          itemsLookup,
          parentItems,
          total: response.total
        });
        setIsFetching(false);
      },
      ({ response }) => {
        setError(response);
      }
    );
  }, [setExpandedLookup, siteId, preferences.filterBy]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resource = useLogicResource<
    DashboardItem[],
    {
      items: DashboardItem[];
      error: ApiResponse;
      isFetching: boolean;
    }
  >(
    useMemo(() => ({ items: state.parentItems, error, isFetching }), [state.parentItems, error, isFetching]),
    {
      shouldResolve: (source) => Boolean(source.items) && !isFetching,
      shouldReject: (source) => Boolean(source.error),
      shouldRenew: (source, resource) => source.isFetching && resource.complete,
      resultSelector: (source) => source.items,
      errorSelector: (source) => source.error
    }
  );

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
          if (payload.targets.some((path) => state.itemsLookup[path])) {
            refresh();
          }
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [refresh, state.itemsLookup]);
  // endregion

  const onToggleCollapse = (e) => {
    e.stopPropagation();
    const lookup = {};
    Object.keys(expandedLookup).forEach((path) => {
      lookup[path] = showExpanded;
    });
    setExpandedLookup(lookup);
  };

  const onExpandedRow = (path: string, value: boolean) => {
    setExpandedLookup({ [path]: value });
  };

  const onToggleCheckedAll = () => {
    if (isAllChecked) {
      setSelectedLookup({});
    } else {
      setSelectedLookup({ ...selectedLookup, ...createPresenceTable(Object.keys(state.itemsLookup)) });
    }
  };

  const handleItemChecked = (path: string) => {
    setSelectedLookup({ ...selectedLookup, [path]: !selectedLookup[path] });
  };

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

  const onActionBarOptionClicked = (option: string) => {
    if (option === 'clear') {
      setSelectedLookup({});
    } else {
      itemActionDispatcher({
        site: siteId,
        item: Object.keys(selectedLookup)
          .filter((path) => selectedLookup[path])
          .map((path) => state.itemsLookup[path]),
        option: option as AllItemActions,
        authoringBase,
        dispatch,
        formatMessage
      });
    }
  };

  const onFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    event.stopPropagation();
    setPreferences({
      filterBy: event.target.value as string
    });
  };

  useEffect(() => {
    setStoredDashboardPreferences(preferences, currentUser, uuid, dashletPreferencesId);
  }, [preferences, currentUser, uuid]);

  return (
    <Dashlet
      title={
        <FormattedMessage
          id="approvedScheduledItemsDashlet.dashletTitle"
          defaultMessage="Approved Scheduled Items ({count})"
          values={{ count: state.total }}
        />
      }
      expanded={preferences.expanded}
      onToggleExpanded={() => setPreferences({ expanded: !preferences.expanded })}
      refreshDisabled={isFetching}
      onRefresh={refresh}
      headerRightSection={
        <>
          <Button disabled={isFetching} onClick={onToggleCollapse} className={classes.collapseAll}>
            {showExpanded ? (
              <FormattedMessage id="approvedScheduledItemsDashlet.expandedAll" defaultMessage="Expand All" />
            ) : (
              <FormattedMessage id="approvedScheduledItemsDashlet.collapseAll" defaultMessage="Collapse All" />
            )}
          </Button>
          <TextField
            label={<FormattedMessage id="approvedScheduledItemsDashlet.filterBy" defaultMessage="Filter by" />}
            select
            size="small"
            value={preferences.filterBy}
            disabled={isFetching}
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
          fallback: <ApprovedScheduledDashletSkeletonTable items={state.parentItems} expandedLookup={expandedLookup} />
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: (
              <FormattedMessage
                id="approvedScheduledItemsDashlet.emptyMessage"
                defaultMessage="No items are scheduled"
              />
            ),
            styles: {
              ...getEmptyStateStyleSet('horizontal'),
              ...getEmptyStateStyleSet('image-sm')
            }
          }
        }}
      >
        {(isIndeterminate || isAllChecked) && (
          <ActionsBar
            classes={{
              root: classes.actionsBarRoot,
              checkbox: classes.actionsBarCheckbox
            }}
            options={[
              { id: 'rejectPublish', label: formatMessage(translations.reject) },
              { id: 'schedulePublish', label: formatMessage(translations.schedule) },
              { id: 'publish', label: formatMessage(translations.publish) },
              { id: 'clear', label: formatMessage(translations.clear, { count: selectedItemsLength }) }
            ]}
            isIndeterminate={isIndeterminate}
            isChecked={isAllChecked}
            onOptionClicked={onActionBarOptionClicked}
            toggleSelectAll={onToggleCheckedAll}
          />
        )}
        <ApprovedScheduledDashletGridUI
          resource={resource}
          expandedLookup={expandedLookup}
          targetLookup={state.targetLookup}
          itemsLookup={state.itemsLookup}
          selectedLookup={selectedLookup}
          onToggleCheckedAll={onToggleCheckedAll}
          isAllChecked={isAllChecked}
          isIndeterminate={isIndeterminate}
          onExpandedRow={onExpandedRow}
          onItemMenuClick={onItemMenuClick}
          onItemChecked={handleItemChecked}
        />
      </SuspenseWithEmptyState>
    </Dashlet>
  );
}
