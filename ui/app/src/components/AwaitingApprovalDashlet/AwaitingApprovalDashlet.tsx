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
import useStyles from './styles';
import { FormattedMessage } from 'react-intl';
import { fetchLegacyGetGoLiveItems } from '../../services/dashboard';
import { useActiveSiteId, useLogicResource, useSpreadState } from '../../utils/hooks';
import { DetailedItem } from '../../models/Item';
import AwaitingApprovalDashletGridUI from '../AwaitingApprovalDashletGrid';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import LookupTable from '../../models/LookupTable';
import { parseLegacyItemToDetailedItem } from '../../utils/content';
import Dashlet from '../Dashlet';
import ApiResponse from '../../models/ApiResponse';
import AwaitingApprovalDashletSkeletonTable from '../AwaitingApprovalDashletGrid/AwaitingApprovalDashletSkeletonTable';
import Button from '@material-ui/core/Button';

export interface AwaitingApprovalDashletProps {
  selectedLookup: LookupTable<boolean>;
  onItemChecked(paths: string[], forceChecked?: boolean): void;
  onItemMenuClick(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem): void;
}

export interface DashboardItem {
  label: string;
  path: string;
  children: string[];
}

export default function AwaitingApprovalDashlet(props: AwaitingApprovalDashletProps) {
  const site = useActiveSiteId();
  const classes = useStyles();
  const [state, setState] = useState<{
    itemsLookup: LookupTable<DetailedItem>;
    publishingTargetLookup: LookupTable<string>;
    parentItems: DashboardItem[];
    total: number;
  }>({
    publishingTargetLookup: {},
    itemsLookup: {},
    parentItems: null,
    total: null
  });
  const { selectedLookup, onItemChecked, onItemMenuClick } = props;
  const [expanded, setExpanded] = useState(true);
  const [expandedLookup, setExpandedLookup] = useSpreadState<LookupTable<boolean>>({});
  const [error, setError] = useState<ApiResponse>();
  const [showInProgressItems, setShowInProgressItems] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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
    fetchLegacyGetGoLiveItems(site, 'eventDate', null, showInProgressItems, null).subscribe(
      (response) => {
        const parentItems: DashboardItem[] = [];
        const itemsLookup = {};
        const publishingTargetLookup = {};
        const expandedLookup = {};
        response.documents.forEach((item) => {
          if (item.children.length) {
            expandedLookup[item.uri] = true;
            parentItems.push({
              label: item.name,
              path: item.uri,
              children: item.children.map((item) => {
                publishingTargetLookup[item.uri] = item.submittedToEnvironment;
                itemsLookup[item.uri] = parseLegacyItemToDetailedItem(item);
                return item.uri;
              })
            });
          }
        });
        setExpandedLookup(expandedLookup);
        setState({
          publishingTargetLookup,
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
  }, [setExpandedLookup, site, showInProgressItems]);

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

  const onToggleCollapse = (e) => {
    e.stopPropagation();
    const lookup = {};
    Object.keys(expandedLookup).forEach((path) => {
      lookup[path] = showExpanded;
    });
    setExpandedLookup(lookup);
  };

  const onShowInProgress = (e) => {
    e.stopPropagation();
    setShowInProgressItems(!showInProgressItems);
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

  const onRefresh = () => {
    refresh();
  };

  return (
    <Dashlet
      title={
        <FormattedMessage
          id="dashboardItemsApproval.itemsWaitingForApproval"
          defaultMessage="Items Waiting For Approval ({count})"
          values={{ count: state.total }}
        />
      }
      expanded={expanded}
      onToggleExpanded={() => setExpanded(!expanded)}
      refreshDisabled={isFetching}
      onRefresh={onRefresh}
      headerRightSection={
        <>
          <Button disabled={isFetching} onClick={onToggleCollapse} className={classes.collapseAll}>
            {showExpanded ? (
              <FormattedMessage id="dashboardItemsApproval.expandedAll" defaultMessage="Expand All" />
            ) : (
              <FormattedMessage id="dashboardItemsApproval.collapseAll" defaultMessage="Collapse All" />
            )}
          </Button>
          <Button disabled={isFetching} onClick={onShowInProgress}>
            {showInProgressItems ? (
              <FormattedMessage id="dashboardItemsApproval.hideUnpublished" defaultMessage="Hide Unpublished" />
            ) : (
              <FormattedMessage id="dashboardItemsApproval.showUnpublished" defaultMessage="Show Unpublished" />
            )}
          </Button>
        </>
      }
    >
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <AwaitingApprovalDashletSkeletonTable items={state.parentItems} expandedLookup={expandedLookup} />
        }}
      >
        <AwaitingApprovalDashletGridUI
          resource={resource}
          expandedLookup={expandedLookup}
          publishingTargetLookup={state.publishingTargetLookup}
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
