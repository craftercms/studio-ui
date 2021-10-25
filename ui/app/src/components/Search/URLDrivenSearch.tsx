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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import queryString from 'query-string';
import { Subject } from 'rxjs';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useEnv } from '../../utils/hooks/useEnv';
import { useSelection } from '../../utils/hooks/useSelection';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDetailedItems } from '../../utils/hooks/useDetailedItems';
import { generateMultipleItemOptions, generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { search } from '../../services/search';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { translations } from './translations';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { itemCreated, itemDuplicated, itemsDeleted, itemsPasted, itemUpdated } from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { ElasticParams, Filter, MediaItem } from '../../models/Search';
import { batchActions } from '../../state/actions/misc';
import { completeDetailedItem } from '../../state/actions/content';
import { showEditDialog, showItemMegaMenu, showPreviewDialog, updatePreviewDialog } from '../../state/actions/dialogs';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath } from '../../utils/content';
import { AllItemActions, DetailedItem } from '../../models/Item';
import { getPreviewURLFromPath } from '../../utils/path';
import { fetchContentXML } from '../../services/content';
import { actionsToBeShown, initialSearchParameters, setCheckedParameterFromURL, URLDrivenSearchProps } from './utils';
import SearchUI from './SearchUI';

export function URLDrivenSearch(props: URLDrivenSearchProps) {
  const refs = useRef({ createQueryString: null });
  const { history, location, mode = 'default', onSelect, embedded = false, onAcceptSelection, onClose } = props;
  const queryParams = useMemo(() => queryString.parse(location.search), [location.search]);
  const searchParameters = useMemo(() => setSearchParameters(initialSearchParameters, queryParams), [queryParams]);
  const [keyword, setKeyword] = useState(queryParams['keywords'] || '');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState([]);
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const site = useActiveSiteId();
  const { authoringBase, guestBase } = useEnv();
  const dispatch = useDispatch();
  const clipboard = useSelection((state) => state.content.clipboard);
  const { formatMessage } = useIntl();
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const [drawerOpen, setDrawerOpen] = useState(window.innerWidth > 960);
  const [checkedFilters, setCheckedFilters] = useState({});
  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [selectedPath, setSelectedPath] = useState(queryParams['path'] as string);
  const { itemsByPath, isFetching } = useDetailedItems(selected);

  const selectionOptions = useMemo(() => {
    if (selected.length === 0) {
      return null;
    } else if (selected.length) {
      if (selected.length === 1) {
        const path = selected[0];
        const item = itemsByPath[path];
        if (item) {
          return generateSingleItemOptions(item, formatMessage, { includeOnly: actionsToBeShown }).flat();
        }
      } else {
        let items = [];
        selected.forEach((itemPath) => {
          const item = itemsByPath[itemPath];
          if (item) {
            items.push(item);
          }
        });
        if (items.length && !isFetching) {
          return generateMultipleItemOptions(items, formatMessage, { includeOnly: actionsToBeShown });
        }
      }
    }
  }, [formatMessage, isFetching, itemsByPath, selected]);

  refs.current.createQueryString = createQueryString;

  const refreshSearch = useCallback(() => {
    search(site, searchParameters).subscribe(
      (result) => {
        setSearchResults(result);
      },
      (error) => {
        const { response } = error;
        if (response && response.response) {
          setApiState({ error: true, errorResponse: response.response });
        } else {
          console.error(error);
          dispatch(
            showErrorDialog({
              error: {
                message: formatMessage(translations.unknownError)
              }
            })
          );
        }
      }
    );
  }, [dispatch, formatMessage, searchParameters, site]);

  const handleClearSelected = useCallback(() => {
    selected.forEach((path) => {
      onSelect?.(path, false);
    });
    setSelected([]);
  }, [onSelect, selected]);

  useEffect(() => {
    refreshSearch();
    return () => setApiState({ error: false, errorResponse: null });
  }, [refreshSearch]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((keywords: string) => {
      if (!keywords) keywords = undefined;
      let qs = refs.current.createQueryString({ name: 'keywords', value: keywords });
      history.push({
        pathname: '/',
        search: `?${qs}`
      });
    });
    return () => subscription.unsubscribe();
  }, [history, onSearch$]);

  useEffect(() => {
    const eventsThatNeedReaction = [
      itemDuplicated.type,
      itemsDeleted.type,
      itemCreated.type,
      itemUpdated.type,
      itemsPasted.type
    ];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => eventsThatNeedReaction.includes(e.type))).subscribe(() => {
      handleClearSelected();
      refreshSearch();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [handleClearSelected, refreshSearch]);

  useEffect(() => {
    setCheckedFilters(setCheckedParameterFromURL(queryParams));
  }, [queryParams, setCheckedFilters]);

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  function handleChangeView() {
    if (currentView === 'grid') {
      setCurrentView('list');
    } else {
      setCurrentView('grid');
    }
  }

  function handleFilterChange(filter: Filter, isFilter: boolean) {
    let qs = createQueryString(filter, isFilter, { offset: 0 });
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
    clearPath();
  }

  function clearPath() {
    handleFilterChange({ name: 'path', value: undefined }, false);
    setSelectedPath(undefined);
  }

  // createQueryString:
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
      Object.keys(formatParameters.filters).forEach((key) => {
        if (formatParameters.filters[key].includes('TODATE')) {
          let id = formatParameters.filters[key].split('ID');
          let range = id[0].split('TODATE');
          formatParameters.filters[key] = {
            date: true,
            id: id[1],
            min: range[0] !== 'null' ? range[0] : null,
            max: range[1] !== 'null' ? range[1] : null
          };
        } else if (formatParameters.filters[key].includes('TO')) {
          let range = formatParameters.filters[key].split('TO');
          formatParameters.filters[key] = {
            min: range[0] !== '-Infinity' && range[0] !== '' ? range[0] : null,
            max: range[1] !== 'Infinity' && range[1] !== '' ? range[1] : null
          };
        }
      });
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

  function handleSelect(path: string, isSelected: boolean) {
    if (isSelected) {
      // dispatch(completeDetailedItem({ path }));
      setSelected([...selected, path]);
    } else {
      let selectedItems = [...selected];
      let index = selectedItems.indexOf(path);
      selectedItems.splice(index, 1);
      setSelected(selectedItems);
    }
    onSelect?.(path, isSelected);
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      let selectedItems: any[] = [];
      searchResults.items.forEach((item: any) => {
        if (selected.indexOf(item.path) === -1) {
          selectedItems.push(item.path);
          onSelect?.(item.path, true);
        }
      });
      setSelected([...selected, ...selectedItems]);
    } else {
      let newSelectedItems = [...selected];
      searchResults.items.forEach((item: any) => {
        let index = newSelectedItems.indexOf(item.path);
        if (index >= 0) {
          newSelectedItems.splice(index, 1);
          onSelect?.(item.path, false);
        }
      });
      setSelected(newSelectedItems);
    }
  }

  function areAllSelected() {
    if (!searchResults || searchResults.items.length === 0) return false;
    return !searchResults.items.some((item: any) => !selected.includes(item.path));
  }

  const onHeaderButtonClick = (event: any, item: MediaItem) => {
    const path = item.path;
    dispatch(
      batchActions([
        completeDetailedItem({ path }),
        showItemMegaMenu({
          path,
          anchorReference: 'anchorPosition',
          anchorPosition: { top: event.clientY, left: event.clientX },
          numOfLoaderItems: getNumOfMenuOptionsForItem({
            path: item.path,
            systemType: getSystemTypeFromPath(item.path)
          } as DetailedItem)
        })
      ])
    );
  };

  const onPreview = (item: MediaItem) => {
    const { type, name: title, path: url } = item;
    switch (type) {
      case 'Image': {
        dispatch(
          showPreviewDialog({
            type: 'image',
            title,
            url
          })
        );
        break;
      }
      case 'Page': {
        dispatch(
          showPreviewDialog({
            type: 'page',
            title,
            url: `${guestBase}${getPreviewURLFromPath(item.path)}`
          })
        );
        break;
      }
      case 'Component':
      case 'Taxonomy': {
        dispatch(showEditDialog({ site, path: item.path, authoringBase, readonly: true }));
        break;
      }
      default: {
        let mode = 'txt';
        if (type === 'Template') {
          mode = 'ftl';
        } else if (type === 'Groovy') {
          mode = 'groovy';
        } else if (type === 'JavaScript') {
          mode = 'javascript';
        } else if (type === 'CSS') {
          mode = 'css';
        }
        dispatch(
          showPreviewDialog({
            type: 'editor',
            title,
            url,
            mode
          })
        );

        fetchContentXML(site, url).subscribe((content) => {
          dispatch(
            updatePreviewDialog({
              content
            })
          );
        });
        break;
      }
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const onActionClicked = (option: AllItemActions, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (selected.length > 1) {
      const detailedItems = [];
      selected.forEach((path) => {
        itemsByPath?.[path] && detailedItems.push(itemsByPath[path]);
      });
      itemActionDispatcher({
        site,
        item: detailedItems,
        option,
        authoringBase,
        dispatch,
        formatMessage,
        clipboard,
        event
      });
    } else {
      const path = selected[0];
      const item = itemsByPath?.[path];
      itemActionDispatcher({
        site,
        item,
        option,
        authoringBase,
        dispatch,
        formatMessage,
        clipboard,
        event
      });
    }
  };

  const onSelectedPathChanges = (path: string) => {
    setSelectedPath(path);
  };

  const onCheckedFiltersChanges = (checkedFilters: object) => {
    setCheckedFilters(checkedFilters);
  };

  return (
    <SearchUI
      sortBy={queryParams['sortBy'] as string}
      sortOrder={queryParams['sortOrder'] as string}
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
      areAllSelected={areAllSelected()}
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

export default URLDrivenSearch;
