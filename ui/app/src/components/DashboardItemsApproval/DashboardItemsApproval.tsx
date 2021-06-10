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

import React, { useEffect, useMemo, useState } from 'react';
import useStyles from './styles';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import { fetchLegacyGetGoLiveItems } from '../../services/dashboard';
import { useActiveSiteId, useLogicResource, useSpreadState } from '../../utils/hooks';
import { DetailedItem } from '../../models/Item';
import DashboardItemsApprovalGridUI from '../DashboardItemsApprovalGrid';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import LookupTable from '../../models/LookupTable';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath, parseLegacyItemToDetailedItem } from '../../utils/content';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import Dashlet from '../Dashlet';
import ApiResponse from '../../models/ApiResponse';
import DashboardItemsApprovalSkeletonTable from '../DashboardItemsApprovalGrid/DashboardItemsApprovalSkeletonTable';

export interface DashboardItemsApprovalProps {
  selectedLookup: LookupTable<boolean>;
  onItemChecked(path: string, value: boolean, lookup?: LookupTable<boolean>): void;
}

export interface DashboardItem {
  label: string;
  path: string;
  children: string[];
}

export default function DashboardItemsApproval(props: DashboardItemsApprovalProps) {
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
  const { selectedLookup, onItemChecked } = props;
  const [expanded, setExpanded] = useState(true);
  const [expandedLookup, setExpandedLookup] = useSpreadState<LookupTable<boolean>>({});
  const [error, setError] = useState<ApiResponse>();
  const [showInProgressItems, setShowInProgressItems] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const dispatch = useDispatch();

  const showExpanded = useMemo(() => Object.values(expandedLookup).some((value) => !value), [expandedLookup]);
  // const isAllChecked = useMemo(
  //   () => Object.values(state.itemsLookup).some((items) => !items.some((item) => !selectedLookup[item.path])),
  //   [selectedLookup, state.itemsLookup]
  // );

  // console.log(isAllChecked);
  // const isIndeterminate = useMemo(() => Object.values(state.itemsLookup).map(), []);

  useEffect(() => {
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

  const onItemMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem) => {
    const path = item.path;
    dispatch(completeDetailedItem({ path }));
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

  const onToggleCheckedAll = () => {
    // onItemChecked();
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
      headerRightSection={
        <>
          <SecondaryButton disabled={isFetching} onClick={onToggleCollapse} className={classes.collapseAll}>
            {showExpanded ? (
              <FormattedMessage id="dashboardItemsApproval.expandedAll" defaultMessage="Expand All" />
            ) : (
              <FormattedMessage id="dashboardItemsApproval.collapseAll" defaultMessage="Collapse All" />
            )}
          </SecondaryButton>
          <SecondaryButton disabled={isFetching} onClick={onShowInProgress}>
            {showInProgressItems ? (
              <FormattedMessage id="dashboardItemsApproval.hideInProgress" defaultMessage='Hide "In-Progress" items' />
            ) : (
              <FormattedMessage id="dashboardItemsApproval.showInProgress" defaultMessage='Show "In-Progress" items' />
            )}
          </SecondaryButton>
        </>
      }
    >
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <DashboardItemsApprovalSkeletonTable items={state.parentItems} expandedLookup={expandedLookup} />
        }}
      >
        <DashboardItemsApprovalGridUI
          resource={resource}
          expandedLookup={expandedLookup}
          publishingTargetLookup={state.publishingTargetLookup}
          itemsLookup={state.itemsLookup}
          selectedLookup={selectedLookup}
          onToggleCheckedAll={onToggleCheckedAll}
          isAllChecked={false}
          onExpandedRow={onExpandedRow}
          onItemMenuClick={onItemMenuClick}
          onItemChecked={onItemChecked}
        />
      </SuspenseWithEmptyState>
    </Dashlet>
  );
}
