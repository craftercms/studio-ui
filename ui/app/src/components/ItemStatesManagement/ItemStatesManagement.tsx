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
import ApiResponse from '../../models/ApiResponse';
import { useActiveSiteId, useDebouncedInput, useLogicResource, useSpreadState } from '../../utils/hooks';
import { fetchItemStates } from '../../services/workflowStates';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import ItemStatesGridUI, { ItemStatesGridSkeletonTable, states } from '../ItemStatesGrid';
import SetWorkflowStateDialog from '../SetWorkflowStateDialog';
import Button from '@material-ui/core/Button';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';
import { useStyles } from './styles';
import LookupTable from '../../models/LookupTable';
import { createPresenceTable } from '../../utils/array';
import { getStateMask } from './utils';
import { ItemStateMap, SandboxItem } from '../../models/Item';
import { PagedArray } from '../../models/PagedArray';

interface ItemStatesManagementProps {
  embedded?: boolean;
}

export default function ItemStatesManagement(props: ItemStatesManagementProps) {
  const { embedded } = props;
  const [fetching, setFetching] = useState(false);
  const [itemStates, setItemStates] = useState<PagedArray<SandboxItem>>(null);
  const [error, setError] = useState<ApiResponse>();
  const siteId = useActiveSiteId();
  const [openSetStateDialog, setOpenSetStateDialog] = useState(false);
  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(true);
  const [filtersLookup, setFiltersLookup] = useSpreadState<LookupTable<boolean>>(createPresenceTable(states, false));
  const [pathRegex, setPathRegex] = useState('');
  const [debouncePathRegex, setDebouncePathRegex] = useState('');
  const classes = useStyles();

  const fetchStates = useCallback(() => {
    let stateMask = getStateMask(filtersLookup as ItemStateMap);

    setFetching(true);
    fetchItemStates(siteId, debouncePathRegex, stateMask).subscribe(
      (states) => {
        console.log(states);
        setItemStates(states);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  }, [debouncePathRegex, filtersLookup, siteId]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  const resource = useLogicResource<
    PagedArray<SandboxItem>,
    { states: PagedArray<SandboxItem>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ states: itemStates, error, fetching }), [itemStates, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.states) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.states,
      errorSelector: () => error
    }
  );

  const onPathRegex$ = useDebouncedInput(
    useCallback(
      (keyword: string) => {
        setDebouncePathRegex(keyword);
      },
      [setDebouncePathRegex]
    ),
    400
  );

  const onPathRegexInputChanges = (value: string) => {
    setPathRegex(value);
    onPathRegex$.next(value);
  };

  const onFilterChecked = (id: string, value: boolean) => {
    if (id === 'all') {
      setFiltersLookup(createPresenceTable(states, value));
    } else {
      setFiltersLookup({ [id]: value });
    }
  };

  const onClearFilters = () => {
    setFiltersLookup(createPresenceTable(states, false));
    setDebouncePathRegex('');
    setPathRegex('');
  };

  const onChangePage = () => {};

  const onChangeRowsPerPage = () => {};

  return (
    <section>
      <GlobalAppToolbar
        title={!embedded && <FormattedMessage id="siteTools.itemStates" defaultMessage="Item States" />}
        rightContent={
          <Button
            className={!embedded && classes.filterButton}
            endIcon={<FilterListRoundedIcon />}
            variant="outlined"
            color={pathRegex || Object.values(filtersLookup).some((value) => value) ? 'primary' : 'default'}
            onClick={() => setOpenFiltersDrawer(!openFiltersDrawer)}
          >
            <FormattedMessage id="words.filters" defaultMessage="Filters" />
          </Button>
        }
        showHamburgerMenuButton={!embedded}
        showAppsButton={!embedded}
      />
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <ItemStatesGridSkeletonTable />
        }}
      >
        <ItemStatesGridUI
          resource={resource}
          openFiltersDrawer={openFiltersDrawer}
          onFilterChecked={onFilterChecked}
          filtersLookup={filtersLookup}
          pathRegex={pathRegex}
          onPathRegexInputChanges={onPathRegexInputChanges}
          onClearFilters={onClearFilters}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      </SuspenseWithEmptyState>
      <SetWorkflowStateDialog open={openSetStateDialog} onClose={() => setOpenSetStateDialog(false)} />
    </section>
  );
}
