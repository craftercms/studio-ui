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
import RecentlyPublishedWidgetUI from './RecentlyPublishedWidgetUI';
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
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath, parseLegacyItemToDetailedItem } from '../../utils/content';
import LookupTable from '../../models/LookupTable';
import { MediaItem } from '../../models/Search';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import Dashlet from '../Dashlet';
import useStyles from './styles';
import RecentlyPublishedWidgetUiSkeletonTable from './RecentlyPublishedWidgetUISkeletonTable';
import Typography from '@material-ui/core/Typography';

export interface RecentlyPublishedWidgetProps {
  selectedLookup: LookupTable<boolean>;
  onItemChecked(paths: string[], forceChecked?: boolean): void;
}

export interface DashboardItem {
  label: string;
  children: string[];
}

export default function RecentlyPublishedWidget(props: RecentlyPublishedWidgetProps) {
  const { selectedLookup, onItemChecked } = props;
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
  const dispatch = useDispatch();

  const isAllChecked = useMemo(() => !Object.keys(itemsLookup).some((path) => !selectedLookup[path]), [
    itemsLookup,
    selectedLookup
  ]);
  const isIntedeteminate = useMemo(
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

  const onOptionsButtonClick = (e: any, item: MediaItem) => {
    e.stopPropagation();
    const path = item.path;
    dispatch(completeDetailedItem({ path }));
    dispatch(
      showItemMegaMenu({
        path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top: e.clientY, left: e.clientX },
        numOfLoaderItems: getNumOfMenuOptionsForItem({
          path: item.path,
          systemType: getSystemTypeFromPath(item.path)
        } as DetailedItem)
      })
    );
  };

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
    toggleCollapseAllItems(parentItems, false);
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
      title="Recently Published"
      onToggleExpanded={() => setExpandedWidget(!expandedWidget)}
      expanded={expandedWidget}
      headerRightSection={
        <>
          <SecondaryButton onClick={onCollapseAll} className={classes.collapseAllButton}>
            <FormattedMessage id="recentlyPublished.collapseAll" defaultMessage="Collapse All" />
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
            <MenuItem value={'page'}>Pages</MenuItem>
            <MenuItem value={'component'}>Components</MenuItem>
            <MenuItem value={'document'}>Documents</MenuItem>
            <MenuItem value={'all'}>All</MenuItem>
          </Select>
        </>
      }
    >
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: (
            <RecentlyPublishedWidgetUiSkeletonTable
              items={parentItems}
              expandedLookup={expandedItems}
              // itemsLookup={itemsLookup} // TODO: pending change to itemsLookup: LookupTable<DetailedItem>
            />
          )
        }}
      >
        <RecentlyPublishedWidgetUI
          resource={resource}
          itemsLookup={itemsLookup}
          localeBranch={localeBranch}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
          onOptionsButtonClick={onOptionsButtonClick}
          selectedItems={selectedLookup}
          onItemChecked={onItemChecked}
          onClickSelectAll={toggleSelectAllItems}
          isAllChecked={isAllChecked}
          isIndeterminate={isIntedeteminate}
        />
      </SuspenseWithEmptyState>
      <div className={classes.showSelectorContainer}>
        <Typography variant="subtitle2" className={classes.showLabel}>
          <FormattedMessage id="words.show" defaultMessage="Show" />
        </Typography>
        <Select
          value={numItems}
          onChange={onNumItemsChange}
          className={classes.filterSelectBtn}
          classes={{
            root: classes.filterSelectRoot,
            select: classes.filterSelectInput
          }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
      </div>
    </Dashlet>
  );
}
