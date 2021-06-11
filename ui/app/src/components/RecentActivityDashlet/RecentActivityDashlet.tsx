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
import LookupTable from '../../models/LookupTable';
import ApiResponse from '../../models/ApiResponse';
import { useActiveSiteId, useLocale, useLogicResource } from '../../utils/hooks';
import { DetailedItem } from '../../models/Item';
import { fetchLegacyUserActivities } from '../../services/dashboard';
import useStyles from './styles';
import { parseLegacyItemToDetailedItem } from '../../utils/content';
import Dashlet from '../Dashlet';
import { FormattedMessage } from 'react-intl';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import RecentActivityDashletUI from './RecentActivityDashletUI';
import { useSelector } from 'react-redux';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import SecondaryButton from '../SecondaryButton';
import RecentActivityDashletUiSkeleton from './RecentActivityDashletUISkeleton';
import GlobalState from '../../models/GlobalState';

export interface RecentActivityDashletProps {
  selectedLookup: LookupTable<boolean>;
  onItemChecked(paths: string[], forceChecked?: boolean): void;
  onItemMenuClick(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem): void;
}

export default function RecentActivityDashlet(props: RecentActivityDashletProps) {
  const { selectedLookup, onItemChecked, onItemMenuClick } = props;
  const [expandedDashlet, setExpandedDashlet] = useState(true);
  const [fetchingActivity, setFecthingActivity] = useState(false);
  const [errorActivity, setErrorActivity] = useState<ApiResponse>();
  const [items, setItems] = useState<DetailedItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [numItems, setNumItems] = useState(10);
  const [filterBy, setFilterBy] = useState('page'); // TODO: type
  const [sortType, setSortType] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState('dateModified');
  const [excludeLiveItems, setExcludeLiveItems] = useState(false);
  const siteId = useActiveSiteId();
  const currentUser = useSelector<GlobalState, string>((state) => state.user.username);
  const localeBranch = useLocale();
  const classes = useStyles();

  const isAllChecked = useMemo(() => !items.some((item) => !selectedLookup[item.path]), [items, selectedLookup]);
  const isIndeterminate = useMemo(() => items.some((item) => selectedLookup[item.path] && !isAllChecked), [
    items,
    selectedLookup,
    isAllChecked
  ]);

  const toggleSelectAllItems = () => {
    const checkedPaths = [];
    items.forEach((item) => checkedPaths.push(item.path));
    onItemChecked(checkedPaths, !isAllChecked);
  };

  const onFilterChange = (e) => {
    e.stopPropagation();
    setFilterBy(e.target.value);
  };

  const onNumItemsChange = (e) => {
    e.stopPropagation();
    setNumItems(e.target.value);
  };

  const onToggleHideLiveItems = (e) => {
    e.stopPropagation();
    setExcludeLiveItems(!excludeLiveItems);
  };

  const toggleSortType = () => {
    setSortType(sortType === 'asc' ? 'desc' : 'asc');
  };

  useEffect(() => {
    setFecthingActivity(true);
    fetchLegacyUserActivities(siteId, currentUser, 'eventDate', true, numItems, filterBy, excludeLiveItems).subscribe(
      (activities) => {
        setTotalItems(activities.total);
        const itemsList = [];
        activities.documents.forEach((item) => itemsList.push(parseLegacyItemToDetailedItem(item)));
        setItems(itemsList);
        setFecthingActivity(false);
      },
      (e) => {
        setErrorActivity(e);
        setFecthingActivity(false);
      }
    );
  }, [siteId, setItems, numItems, filterBy, excludeLiveItems, currentUser]);

  const resource = useLogicResource<DetailedItem[], { items: DetailedItem[]; error: ApiResponse; fetching: boolean }>(
    useMemo(() => ({ items, error: errorActivity, fetching: fetchingActivity }), [
      items,
      errorActivity,
      fetchingActivity
    ]),
    {
      shouldResolve: (source) => Boolean(source.items) && !fetchingActivity,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetchingActivity && resource.complete,
      resultSelector: (source) => source.items,
      errorSelector: () => errorActivity
    }
  );

  return (
    <Dashlet
      title={
        <>
          <FormattedMessage id="recentActivity.myRecentActivity" defaultMessage="My Recent Activity" /> ({items.length})
        </>
      }
      onToggleExpanded={() => setExpandedDashlet(!expandedDashlet)}
      expanded={expandedDashlet}
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
                root: classes.showSelectRoot
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              {totalItems > 0 && (
                <MenuItem value={totalItems}>
                  <FormattedMessage id="words.all" defaultMessage="All" /> ({totalItems})
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <SecondaryButton onClick={onToggleHideLiveItems} className={classes.rightAction}>
            {excludeLiveItems ? (
              <FormattedMessage id="recentActivity.showLiveItems" defaultMessage="Show Live Items" />
            ) : (
              <FormattedMessage id="recentActivity.hideLiveItems" defaultMessage="Hide Live Items" />
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
          fallback: <RecentActivityDashletUiSkeleton numOfItems={items.length} />
        }}
      >
        <RecentActivityDashletUI
          resource={resource}
          onOptionsButtonClick={onItemMenuClick}
          selectedLookup={selectedLookup}
          isAllChecked={isAllChecked}
          isIndeterminate={isIndeterminate}
          localeBranch={localeBranch}
          sortType={sortType}
          toggleSortType={toggleSortType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onItemChecked={onItemChecked}
          onClickSelectAll={toggleSelectAllItems}
        />
      </SuspenseWithEmptyState>
    </Dashlet>
  );
}
