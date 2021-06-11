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
import { LegacyDeploymentHistoryType } from '../../models/Dashboard';
import { useActiveSiteId, useLocale, useLogicResource, useSpreadState } from '../../utils/hooks';
import { fetchLegacyDeploymentHistory } from '../../services/dashboard';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { FormattedMessage } from 'react-intl';
import SecondaryButton from '../SecondaryButton';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { DetailedItem } from '../../models/Item';
import { parseLegacyItemToDetailedItem } from '../../utils/content';
import LookupTable from '../../models/LookupTable';
import Dashlet from '../Dashlet';
import useStyles from './styles';
import RecentlyPublishedDashletUISkeletonTable from './RecentlyPublishedDashletUISkeletonTable';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

export interface RecentlyPublishedWidgetProps {
  selectedLookup: LookupTable<boolean>;
  onItemChecked(paths: string[], forceChecked?: boolean): void;
  onItemMenuClick(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem): void;
}

export interface DashboardItem {
  label: string;
  children: string[];
}

export default function RecentlyPublishedDashlet(props: RecentlyPublishedWidgetProps) {
  const { selectedLookup, onItemChecked, onItemMenuClick } = props;
  const [expandedWidget, setExpandedWidget] = useState(true);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<ApiResponse>();
  const [parentItems, setParentItems] = useState<DashboardItem[]>();
  const [itemsLookup, setItemsLookup] = useSpreadState<LookupTable<DetailedItem>>({});
  const [filterBy, setFilterBy] = useState<LegacyDeploymentHistoryType>('page');
  const [numItems, setNumItems] = useState(20);
  const [expandedItems, setExpandedItems] = useSpreadState<LookupTable<boolean>>({});
  const siteId = useActiveSiteId();
  const localeBranch = useLocale();
  const classes = useStyles();

  const allCollapsed = useMemo(() => Object.keys(expandedItems).every((key) => !Boolean(expandedItems[key])), [
    expandedItems
  ]);
  const isAllChecked = useMemo(() => !Object.keys(itemsLookup).some((path) => !selectedLookup[path]), [
    itemsLookup,
    selectedLookup
  ]);
  const isIndeterminate = useMemo(
    () => Object.keys(itemsLookup).some((path) => selectedLookup[path]) && !isAllChecked,
    [itemsLookup, selectedLookup, isAllChecked]
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
    setFilterBy(e.target.value);
  };

  const onNumItemsChange = (e) => {
    e.stopPropagation();
    setNumItems(e.target.value);
  };

  const onCollapseAll = (e) => {
    e.stopPropagation();
    toggleCollapseAllItems(parentItems, allCollapsed);
  };

  const toggleSelectAllItems = () => {
    const checkedPaths = [];
    Object.keys(itemsLookup).forEach((path) => checkedPaths.push(path));
    onItemChecked(checkedPaths, !isAllChecked);
  };

  useEffect(() => {
    setFetchingHistory(true);
    fetchLegacyDeploymentHistory(siteId, 'eventDate', false, 30, numItems, filterBy).subscribe(
      (history) => {
        const parentItems = [];
        const childrenLookup = {};
        history.documents.forEach((document) => {
          if (document.children.length) {
            parentItems.push({
              label: document.internalName,
              children: document.children.map((item) => {
                childrenLookup[item.uri] = parseLegacyItemToDetailedItem(item);
                return item.uri;
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
  }, [siteId, filterBy, numItems, toggleCollapseAllItems, setItemsLookup]);

  const resource = useLogicResource<DashboardItem[], { items: DashboardItem[]; error: ApiResponse; fetching: boolean }>(
    useMemo(() => ({ items: parentItems, error: errorHistory, fetching: fetchingHistory }), [
      parentItems,
      errorHistory,
      fetchingHistory
    ]),
    {
      shouldResolve: (source) => Boolean(source.items) && !fetchingHistory,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetchingHistory && resource.complete,
      resultSelector: (source) => source.items,
      errorSelector: () => errorHistory
    }
  );

  return (
    <Dashlet
      title={
        <FormattedMessage
          id="recentlyPublished.recentlyPublished"
          defaultMessage="RecentlyPublished ({total})"
          values={{
            total: Object.keys(itemsLookup).length
          }}
        />
      }
      onToggleExpanded={() => setExpandedWidget(!expandedWidget)}
      expanded={expandedWidget}
      headerRightSection={
        <>
          <FormControl variant="outlined">
            <InputLabel id="itemsNumberLabel">
              <FormattedMessage id="words.show" defaultMessage="Show" />
            </InputLabel>
            <Select
              labelId="itemsNumberLabel"
              id="itemsNumber"
              value={numItems}
              onChange={onNumItemsChange}
              label={<FormattedMessage id="words.show" defaultMessage="Show" />}
              className={classes.rightAction}
              classes={{
                root: classes.filterSelectRoot,
                select: classes.filterSelectInput
              }}
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
            </Select>
          </FormControl>
          <SecondaryButton onClick={onCollapseAll} className={classes.rightAction}>
            {!allCollapsed ? (
              <FormattedMessage id="recentlyPublished.collapseAll" defaultMessage="Collapse All" />
            ) : (
              <FormattedMessage id="recentlyPublished.expandAll" defaultMessage="Expand All" />
            )}
          </SecondaryButton>
          <Select
            value={filterBy}
            onChange={onFilterChange}
            className={classes.filterSelectBtn}
            classes={{
              root: classes.filterSelectRoot,
              select: classes.filterSelectInput
            }}
          >
            <MenuItem value={'page'}>
              <FormattedMessage id="words.pages" defaultMessage="Pages" />
            </MenuItem>
            <MenuItem value={'component'}>
              <FormattedMessage id="words.components" defaultMessage="Components" />
            </MenuItem>
            <MenuItem value={'document'}>
              <FormattedMessage id="words.documents" defaultMessage="Documents" />
            </MenuItem>
            <MenuItem value={'all'}>
              <FormattedMessage id="words.all" defaultMessage="All" />
            </MenuItem>
          </Select>
        </>
      }
    >
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <RecentlyPublishedDashletUISkeletonTable items={parentItems} expandedLookup={expandedItems} />
        }}
      >
        <RecentlyPublishedWidgetUI
          resource={resource}
          itemsLookup={itemsLookup}
          localeBranch={localeBranch}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
          onItemMenuClick={onItemMenuClick}
          selectedItems={selectedLookup}
          onItemChecked={onItemChecked}
          onClickSelectAll={toggleSelectAllItems}
          isAllChecked={isAllChecked}
          isIndeterminate={isIndeterminate}
        />
      </SuspenseWithEmptyState>
    </Dashlet>
  );
}
