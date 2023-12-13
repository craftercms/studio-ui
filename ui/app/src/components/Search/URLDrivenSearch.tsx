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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import queryString from 'query-string';
import { Subject } from 'rxjs';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ElasticParams, Filter } from '../../models/Search';
import {
  deserializeSearchFilters,
  initialSearchParameters,
  setCheckedParameterFromURL,
  URLDrivenSearchProps,
  useSearchState
} from './utils';
import SearchUI from '../SearchUI';
import { UNDEFINED } from '../../utils/constants';

export function URLDrivenSearch(props: URLDrivenSearchProps) {
  const { history, location, mode = 'default', onSelect, embedded = false, onAcceptSelection, onClose } = props;

  // region hooks
  const refs = useRef({ createQueryString: null });
  const queryParams = useMemo(() => queryString.parse(location.search), [location.search]);
  const searchParameters = useMemo(() => setSearchParameters(initialSearchParameters, queryParams), [queryParams]);
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  // endregion

  // region state
  const [keyword, setKeyword] = useState(queryParams['keywords'] || '');
  const [checkedFilters, setCheckedFilters] = useState({});
  // endregion

  // region useSearchState({ ... })
  const {
    error,
    isFetching,
    areAllSelected,
    selected,
    currentView,
    onActionClicked,
    selectionOptions,
    onHeaderButtonClick,
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
    handleChangeView
  } = useSearchState({
    searchParameters,
    onSelect
  });
  // endregion

  refs.current.createQueryString = createQueryString;

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((keywords: string) => {
      if (!keywords) keywords = undefined;
      let qs = refs.current.createQueryString({ name: 'keywords', value: keywords }, false, { offset: UNDEFINED });
      history.push({
        pathname: '/',
        search: qs ? `?${qs}` : ''
      });
    });
    return () => subscription.unsubscribe();
  }, [history, onSearch$]);

  useEffect(() => {
    setCheckedFilters(setCheckedParameterFromURL(queryParams));
  }, [queryParams, setCheckedFilters]);

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  function handleFilterChange(filter: Filter, isFilter?: boolean) {
    let qs = createQueryString(filter, isFilter, { offset: UNDEFINED });
    if (qs || location.search) {
      history.push({
        pathname: '/',
        search: `?${qs}`
      });
    } else {
      return false;
    }
  }

  function clearFilter(facet: string) {
    if (checkedFilters[facet]) {
      if (typeof checkedFilters[facet] === 'string') {
        setCheckedFilters({ ...checkedFilters, [facet]: '' });
      } else {
        let emptyFilter = { ...checkedFilters[facet] };
        Object.keys(emptyFilter).forEach((name) => {
          emptyFilter[name] = false;
        });
        setCheckedFilters({ ...checkedFilters, [facet]: emptyFilter });
      }
    }
    handleFilterChange({ name: facet, value: undefined }, true);
  }

  function clearFilters() {
    Object.keys(checkedFilters).map((filter) => clearFilter(filter));
    // TODO: Should change the path clearing to depend on a more specific prop (e.g. `pathLock`)
    if (mode !== 'select') {
      handleFilterChange({ name: 'path', value: UNDEFINED });
      onSelectedPathChanges(UNDEFINED);
      clearPath();
    }
  }

  // isFilter: It means that the filter is nested on object filter
  function createQueryString(filter: Filter, isFilter = false, overrideQueryParams = {}) {
    let newFilters;
    let filters: any = queryParams['filters'];
    filters = filters ? JSON.parse(filters) : {};
    if (isFilter) {
      filters[filter.name] = filter.value;
      queryParams.filters = JSON.stringify(filters);
      if (queryParams.filters === '{}') {
        queryParams.filters = undefined;
      }
      newFilters = { ...queryParams, ...overrideQueryParams };
    } else {
      queryParams.filters = JSON.stringify(filters);
      if (queryParams.filters === '{}') {
        queryParams.filters = undefined;
      }
      // queryParams['sortBy'] === undefined: this means the current filter is the default === _score
      if (
        filter.name === 'sortBy' &&
        (queryParams['sortBy'] === '_score' || queryParams['sortBy'] === undefined) &&
        filter.value !== '_score'
      ) {
        newFilters = { ...queryParams, [filter.name]: filter.value, sortOrder: 'asc', ...overrideQueryParams };
      } else if (filter.name === 'sortBy' && queryParams['sortBy'] !== '_score' && filter.value === '_score') {
        newFilters = { ...queryParams, [filter.name]: filter.value, sortOrder: 'desc', ...overrideQueryParams };
      } else {
        newFilters = { ...queryParams, [filter.name]: filter.value, ...overrideQueryParams };
      }
    }
    return queryString.stringify(newFilters);
  }

  function setSearchParameters(initialSearchParameters: ElasticParams, queryParams: Partial<ElasticParams>) {
    let formatParameters = {
      ...queryParams,
      ...(queryParams.limit && { limit: Number(queryParams.limit) }),
      ...(queryParams.offset && { offset: Number(queryParams.offset) })
    };
    if (formatParameters.filters) {
      formatParameters.filters = JSON.parse(formatParameters.filters);
      formatParameters.filters = deserializeSearchFilters(formatParameters.filters);
    }
    return { ...initialSearchParameters, ...formatParameters };
  }

  function handleChangePage(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    let offset = newPage * searchParameters.limit;
    let qs = refs.current.createQueryString({ name: 'offset', value: offset });
    history.push({
      pathname: '/',
      search: `?${qs}`
    });
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    let qs = refs.current.createQueryString({ name: 'limit', value: parseInt(event.target.value, 10) });
    history.push({
      pathname: '/',
      search: `?${qs}`
    });
  }

  const onCheckedFiltersChanges = (checkedFilters: object) => {
    setCheckedFilters(checkedFilters);
  };

  return (
    <SearchUI
      sortBy={queryParams['sortBy'] as string}
      sortOrder={queryParams['sortOrder'] as string}
      currentView={currentView}
      embedded={embedded}
      keyword={Array.isArray(keyword) ? keyword.join(' ') : keyword}
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
      error={error}
      isFetching={isFetching}
      areAllSelected={areAllSelected}
      guestBase={guestBase}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
      handleClearSelected={handleClearSelected}
      handleSelect={handleSelect}
      handleSelectAll={handleSelectAll}
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

export default URLDrivenSearch;
