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
import { FormattedMessage } from 'react-intl';
import { fetchLegacyScheduledItems } from '../../services/dashboard';
import { parseLegacyItemToDetailedItem } from '../../utils/content';
import ApiResponse from '../../models/ApiResponse';
import { DashboardItem } from '../AwaitingApprovalDashlet';
import { DetailedItem } from '../../models/Item';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import ApprovedScheduledDashletGridUI from '../ApprovedScheduledDashletGrid';
import useStyles from './styles';
import ApprovedScheduledDashletSkeletonTable from '../ApprovedScheduledDashletGrid/ApprovedScheduledDashletSkeletonTable';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { itemsApproved, itemsDeleted, itemsRejected, itemsScheduled } from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { filter } from 'rxjs/operators';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useSpreadState } from '../../utils/hooks/useSpreadState';

export interface ApprovedScheduledDashletProps {
  selectedLookup: LookupTable<boolean>;
  onItemChecked(paths: string[], forceChecked?: boolean): void;
  onItemMenuClick(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem): void;
}

export default function ApprovedScheduledDashlet(props: ApprovedScheduledDashletProps) {
  const [expanded, setExpanded] = useState(true);
  const { selectedLookup, onItemChecked, onItemMenuClick } = props;
  const [error, setError] = useState<ApiResponse>();
  const site = useActiveSiteId();
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
  const [filterBy, setFilterBy] = useState('all');

  const showExpanded = useMemo(() => Object.values(expandedLookup).some((value) => !value), [expandedLookup]);
  const isAllChecked = useMemo(() => !Object.keys(state.itemsLookup).some((path) => !selectedLookup[path]), [
    selectedLookup,
    state.itemsLookup
  ]);
  const isIndeterminate = useMemo(
    () => Object.keys(state.itemsLookup).some((path) => selectedLookup[path]) && !isAllChecked,
    [isAllChecked, selectedLookup, state.itemsLookup]
  );

  const refresh = useCallback(() => {
    setIsFetching(true);
    fetchLegacyScheduledItems(site, 'eventDate', false, filterBy).subscribe(
      (response) => {
        const parentItems: DashboardItem[] = [];
        const itemsLookup = {};
        const targetLookup = {};
        const expandedLookup = {};
        response.documents.forEach((item) => {
          if (item.children.length) {
            expandedLookup[item.uri ?? item.name] = true;
            parentItems.push({
              label: item.name,
              path: item.uri ?? item.name,
              children: item.children.map((item) => {
                targetLookup[item.uri] = { target: item.environment, packageId: item.packageId };
                itemsLookup[item.uri] = parseLegacyItemToDetailedItem(item);
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
  }, [setExpandedLookup, site, filterBy]);

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
    onItemChecked(Object.keys(state.itemsLookup), !isAllChecked);
  };

  const handleItemChecked = (path: string) => {
    onItemChecked([path]);
  };

  const onFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    event.stopPropagation();
    setFilterBy(event.target.value as string);
  };

  return (
    <Dashlet
      title={
        <FormattedMessage
          id="dashboardItemsScheduled.approvedScheduledItems"
          defaultMessage="Approved Scheduled Items ({count})"
          values={{ count: state.total }}
        />
      }
      expanded={expanded}
      onToggleExpanded={() => setExpanded(!expanded)}
      onRefresh={refresh}
      headerRightSection={
        <>
          <Button disabled={isFetching} onClick={onToggleCollapse} className={classes.collapseAll}>
            {showExpanded ? (
              <FormattedMessage id="dashboardItemsScheduled.expandedAll" defaultMessage="Expand All" />
            ) : (
              <FormattedMessage id="dashboardItemsScheduled.collapseAll" defaultMessage="Collapse All" />
            )}
          </Button>
          <TextField
            label={<FormattedMessage id="dashboardItemsScheduled.filterBy" defaultMessage="Filter by" />}
            select
            size="small"
            value={filterBy}
            disabled={isFetching}
            onChange={onFilterChange}
          >
            <MenuItem value="page">
              <FormattedMessage id="words.pages" defaultMessage="Pages" />
            </MenuItem>
            <MenuItem value="components">
              <FormattedMessage id="words.components" defaultMessage="Components" />
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
      >
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
