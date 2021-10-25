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

import { initialSearchParameters, SearchProps, useSearchState } from './utils';
import SearchUI from './SearchUI';
import React, { useEffect, useMemo, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Subject } from 'rxjs';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { Filter } from '../../models/Search';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { reversePluckProps } from '../../utils/object';

export function Search(props: SearchProps) {
  const { mode = 'default', onSelect, embedded = false, onAcceptSelection, onClose } = props;

  // region State
  const [filters, setFilters] = useSpreadState({
    sortBy: undefined,
    sortOrder: undefined
  });
  const [keyword, setKeyword] = useState('');
  const [checkedFilters, setCheckedFilters] = useState({});
  const [searchParameters, setSearchParameters] = useSpreadState({ ...initialSearchParameters });
  // endregion

  // region Hooks
  const theme = useTheme();
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  const {
    apiState,
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
  // endregion

  // region Callbacks

  const clearFilter = (facet: string) => {
    setSearchParameters({ filters: { ...searchParameters.filters, [facet]: undefined } });
    setCheckedFilters({ ...reversePluckProps(checkedFilters, facet) });
  };

  const clearFilters = () => {
    setCheckedFilters({});
    clearPath();
  };

  const handleFilterChange = (filter: Filter, isFilter: boolean) => {
    console.log(filter);
    switch (filter.name) {
      case 'sortOrder':
      case 'sortBy': {
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
            min: range[0] !== '-Infinity' && range[0] !== '' ? range[0] : null,
            max: range[1] !== 'Infinity' && range[1] !== '' ? range[1] : null
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

  const onCheckedFiltersChanges = (checkedFilters: object) => {
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
      apiState={apiState}
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
