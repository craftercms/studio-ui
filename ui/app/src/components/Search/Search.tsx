/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { CheckedFilter, initialSearchParameters, SearchProps, useSearchState } from './utils';
import SearchUI from '../SearchUI';
import React, { useEffect, useMemo, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Subject } from 'rxjs';
import { useSpreadState } from '../../hooks/useSpreadState';
import { Filter } from '../../models/Search';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { reversePluckProps } from '../../utils/object';
import LookupTable from '../../models/LookupTable';
import { UNDEFINED } from '../../utils/constants';
import useMount from '../../hooks/useMount';

export function Search(props: SearchProps) {
  const { mode = 'default', onSelect, embedded = false, onAcceptSelection, onClose, parameters } = props;

  // region State
  const [filters, setFilters] = useSpreadState({
    sortBy: parameters?.sortBy ?? undefined,
    sortOrder: parameters?.sortOrder ?? undefined
  });
  const [keyword, setKeyword] = useState('');
  const [checkedFilters, setCheckedFilters] = useState<LookupTable<CheckedFilter>>({});
  const [searchParameters, setSearchParameters] = useSpreadState({
    ...initialSearchParameters,
    ...parameters
  });
  // endregion

  // region Hooks
  const theme = useTheme();
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  const {
    error,
    isFetching,
    areAllSelected,
    selected,
    onActionClicked,
    selectionOptions,
    onHeaderButtonClick,
    itemsByPath,
    handleClearSelected,
    handleSelect,
    handleSelectAll,
    onPreview,
    guestBase,
    searchResults,
    selectedPath,
    clearPath,
    onSelectedPathChanges,
    drawerOpen,
    toggleDrawer,
    currentView,
    handleChangeView
  } = useSearchState({
    searchParameters,
    onSelect
  });

  useMount(() => {
    // Set initial filters coming from props to checkedFilters
    if (parameters?.filters) {
      const newCheckedFilters = {};
      Object.entries(parameters.filters).forEach(([key, filter]: [string, any]) => {
        if (Array.isArray(filter)) {
          newCheckedFilters[key] = filter.reduce((checked, key) => ({ ...checked, [key]: true }), {});
        } else if (filter.date) {
          newCheckedFilters[key] = `${filter.min ?? ''}TODATE${filter.max ?? ''}ID${filter.id}`;
        } else {
          newCheckedFilters[key] = `${filter.min ?? ''}TO${filter.max ?? ''}`;
        }
      });
      setCheckedFilters(newCheckedFilters);
    }
  });
  // endregion

  // region Callbacks

  const clearFilter = (facet: string) => {
    setSearchParameters({ filters: { ...searchParameters.filters, [facet]: undefined } });
    setCheckedFilters({ ...reversePluckProps(checkedFilters, facet) });
  };

  const clearFilters = () => {
    setCheckedFilters({});
    // TODO: Should change the path clearing to depend on a more specific prop (e.g. `pathLock`)
    if (mode !== 'select') {
      handleFilterChange({ name: 'path', value: UNDEFINED });
      onSelectedPathChanges(UNDEFINED);
      clearPath();
    }
    setSearchParameters({ ...initialSearchParameters });
  };

  const handleFilterChange = (filter: Filter, isFilter?: boolean) => {
    switch (filter.name) {
      case 'path':
      case 'sortBy':
      case 'sortOrder': {
        setFilters({ [filter.name]: filter.value });
        setSearchParameters({ [filter.name]: filter.value });
        break;
      }
      default: {
        const filters = { ...searchParameters.filters };
        if (filter.value.includes('TODATE')) {
          let id = filter.value.split('ID');
          let range = id[0].split('TODATE');
          filters[filter.name] = {
            date: true,
            id: id[1],
            min: range[0] !== 'null' ? range[0] : null,
            max: range[1] !== 'null' ? range[1] : null
          };
          setCheckedFilters({ ...checkedFilters, [filter.name]: filter.value });
        } else if (filter.value.includes('TO')) {
          let range = filter.value.split('TO');
          filters[filter.name] = {
            min: range[0] !== null && range[0] !== '' ? range[0] : null,
            max: range[1] !== null && range[1] !== '' ? range[1] : null
          };
          setCheckedFilters({ ...checkedFilters, [filter.name]: filter.value });
        } else {
          // for this filters checkedFilters is already handle on onCheckedFiltersChanges
          filters[filter.name] = filter.value;
        }
        setSearchParameters({ filters });
        break;
      }
    }
  };

  const handleSearchKeyword = (keyword: string) => {
    setKeyword(keyword);
    onSearch$.next(keyword);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
    setSearchParameters({ offset: newPage * searchParameters.limit });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchParameters({ limit: parseInt(event.target.value, 10) });
  };

  const onCheckedFiltersChanges = (checkedFilters: LookupTable<CheckedFilter>) => {
    setCheckedFilters(checkedFilters);
  };

  // endregion

  // region Effects
  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((keywords: string) => {
      setSearchParameters({ keywords });
    });
    return () => subscription.unsubscribe();
  }, [onSearch$, setSearchParameters]);
  // endregion

  return (
    <SearchUI
      error={error}
      isFetching={isFetching}
      sortBy={filters.sortBy}
      sortOrder={filters.sortOrder}
      currentView={currentView}
      embedded={embedded}
      keyword={keyword}
      mode={mode}
      checkedFilters={checkedFilters}
      desktopScreen={desktopScreen}
      drawerOpen={drawerOpen}
      searchResults={searchResults}
      selectedPath={selectedPath}
      clearFilter={clearFilter}
      toggleDrawer={toggleDrawer}
      clearFilters={clearFilters}
      handleChangeView={handleChangeView}
      handleFilterChange={handleFilterChange}
      handleSearchKeyword={handleSearchKeyword}
      onSelectedPathChanges={onSelectedPathChanges}
      onCheckedFiltersChanges={onCheckedFiltersChanges}
      areAllSelected={areAllSelected}
      guestBase={guestBase}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
      handleClearSelected={handleClearSelected}
      handleSelect={handleSelect}
      handleSelectAll={handleSelectAll}
      itemsByPath={itemsByPath}
      onAcceptSelection={onAcceptSelection}
      onActionClicked={onActionClicked}
      onClose={onClose}
      onHeaderButtonClick={onHeaderButtonClick}
      onPreview={onPreview}
      searchParameters={searchParameters}
      selected={selected}
      selectionOptions={selectionOptions}
    />
  );
}

export default Search;
