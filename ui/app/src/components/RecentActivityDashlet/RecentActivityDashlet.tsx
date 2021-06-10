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
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath, parseLegacyItemToDetailedItem } from '../../utils/content';
import Dashlet from '../Dashlet';
import { FormattedMessage } from 'react-intl';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import RecentActivityDashletUI from './RecentActivityDashletUI';
import { MediaItem } from '../../models/Search';
import { useDispatch } from 'react-redux';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

export interface RecentActivityDashletProps {
  selectedLookup: LookupTable<boolean>;
  onItemChecked(paths: string[], forceChecked?: boolean): void;
}

export default function RecentActivityDashlet(props: RecentActivityDashletProps) {
  const { selectedLookup, onItemChecked } = props;
  const [expandedDashlet, setExpandedDashlet] = useState(true);
  const [fetchingActivity, setFecthingActivity] = useState(false);
  const [errorActivity, setErrorActivity] = useState<ApiResponse>();
  const [items, setItems] = useState<DetailedItem[]>([]);
  const [numItems, setNumItems] = useState(10);
  const [filterBy, setFilterBy] = useState('page'); // TODO: type
  const siteId = useActiveSiteId();
  const localeBranch = useLocale();
  const classes = useStyles();
  const dispatch = useDispatch();

  const isAllChecked = useMemo(() => !items.some((item) => !selectedLookup[item.path]), [items, selectedLookup]);
  const isIndeterminate = useMemo(() => items.some((item) => selectedLookup[item.path] && !isAllChecked), [
    items,
    selectedLookup
  ]);

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

  const toggleSelectAllItems = () => {
    const checkedPaths = [];
    items.forEach((item) => checkedPaths.push(item.path));
    onItemChecked(checkedPaths, !isAllChecked);
  };

  const onFilterChange = (e) => {
    e.stopPropagation();
    setFilterBy(e.target.value);
  };

  useEffect(() => {
    setFecthingActivity(true);
    // TODO: user, sort. excludeLive
    fetchLegacyUserActivities(siteId, 'admin', 'eventDate', true, numItems, filterBy, false).subscribe(
      (activities) => {
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
  }, [siteId, setItems, numItems, filterBy]);

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
      title={<FormattedMessage id="recentActivity.myRecentActivity" defaultMessage="My Recent Activity" />}
      onToggleExpanded={() => setExpandedDashlet(!expandedDashlet)}
      expanded={expandedDashlet}
      headerRightSection={
        <>
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
          fallback: <>loading</>
        }}
      >
        <RecentActivityDashletUI
          resource={resource}
          onOptionsButtonClick={onOptionsButtonClick}
          selectedLookup={selectedLookup}
          isAllChecked={isAllChecked}
          isIndeterminate={isIndeterminate}
          onItemChecked={onItemChecked}
          onClickSelectAll={toggleSelectAllItems}
        />
      </SuspenseWithEmptyState>
    </Dashlet>
  );
}
