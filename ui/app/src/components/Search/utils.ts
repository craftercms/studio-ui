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

import { ElasticParams, MediaItem, SearchResult } from '../../models/Search';
import { AllItemActions, DetailedItem } from '../../models/Item';
import { History, Location } from 'history';
import { generateMultipleItemOptions, generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useSelection } from '../../hooks/useSelection';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useEnv } from '../../hooks/useEnv';
import { useDetailedItems } from '../../hooks/useDetailedItems';
import { ContextMenuOption } from '../ContextMenu';
import { showEditDialog, showItemMegaMenu, showPreviewDialog, updatePreviewDialog } from '../../state/actions/dialogs';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath } from '../../utils/content';
import LookupTable from '../../models/LookupTable';
import { search } from '../../services/search';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { translations } from './translations';
import { ApiResponse } from '../../models/ApiResponse';
import { contentEvent, deleteContentEvent } from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import { getPreviewURLFromPath } from '../../utils/path';
import { fetchContentXML } from '../../services/content';

export const drawerWidth = 300;

export const initialSearchParameters: ElasticParams = {
  query: '',
  keywords: '',
  offset: 0,
  limit: 21,
  sortBy: '_score',
  sortOrder: 'desc',
  filters: {}
};

export const actionsToBeShown: AllItemActions[] = [
  'edit',
  'delete',
  'publish',
  'rejectPublish',
  'duplicate',
  'duplicateAsset',
  'dependencies',
  'history'
];

export interface URLDrivenSearchProps {
  history: History;
  location: Location;
  mode?: 'default' | 'select';
  embedded?: boolean;
  onClose?(): void;
  onSelect?(path: string, selected: boolean): any;
  onAcceptSelection?(items: string[]): any;
}

export interface SearchParameters extends Partial<ElasticParams> {
  path?: string;
}

export interface SearchProps {
  mode?: 'default' | 'select';
  embedded?: boolean;
  initialParameters?: SearchParameters;
  onClose?(): void;
  onSelect?(path: string, selected: boolean): any;
  onAcceptSelection?(items: string[]): any;
}

export interface CheckedFilter {
  key: string;
  value: string;
}

export const setCheckedParameterFromURL = (queryParams: Partial<ElasticParams>) => {
  if (queryParams['filters']) {
    let checked: any = {};
    let parseQP = JSON.parse(queryParams['filters']);
    Object.keys(parseQP).forEach((facet) => {
      if (Array.isArray(parseQP[facet])) {
        checked[facet] = {};
        parseQP[facet].forEach((name: string) => {
          checked[facet][name] = true;
        });
      } else {
        checked[facet] = parseQP[facet];
      }
    });
    return checked;
  } else {
    return {};
  }
};

export const serializeSearchFilters = (filters: SearchParameters['filters']) => {
  const serializedFilters = {};
  if (filters) {
    Object.entries(filters).forEach(([key, filter]: [string, any]) => {
      if (Array.isArray(filter)) {
        serializedFilters[key] = filter.reduce((checked, key) => ({ ...checked, [key]: true }), {});
      } else if (filter.date) {
        serializedFilters[key] = `${filter.min ?? ''}TODATE${filter.max ?? ''}ID${filter.id}`;
      } else {
        serializedFilters[key] = `${filter.min ?? ''}TO${filter.max ?? ''}`;
      }
    });
  }
  return serializedFilters;
};

export const deserializeSearchFilters = (filters) => {
  const deserializedFilters = {};
  if (filters) {
    Object.keys(filters).forEach((key) => {
      if (filters[key].includes('TODATE')) {
        let id = filters[key].split('ID');
        let range = id[0].split('TODATE');
        deserializedFilters[key] = {
          date: true,
          id: id[1],
          min: range[0] !== 'null' ? range[0] : null,
          max: range[1] !== 'null' ? range[1] : null
        };
      } else if (filters[key].includes('TO')) {
        let range = filters[key].split('TO');
        deserializedFilters[key] = {
          min: range[0] !== null && range[0] !== '' ? range[0] : null,
          max: range[1] !== null && range[1] !== '' ? range[1] : null
        };
      } else if (typeof filters[key] === 'object' && !Array.isArray(filters[key])) {
        deserializedFilters[key] = Object.keys(filters[key]);
      } else {
        deserializedFilters[key] = filters[key];
      }
    });
  }
  return deserializedFilters;
};

interface useSearchStateProps {
  searchParameters: ElasticParams;
  onSelect?(path: string, selected: boolean): any;
}

interface useSearchStateReturn {
  selected: string[];
  areAllSelected: boolean;
  selectionOptions: ContextMenuOption[];
  itemsByPath: LookupTable<DetailedItem>;
  guestBase: string;
  searchResults: SearchResult;
  selectedPath: string;
  error: ApiResponse;
  drawerOpen: boolean;
  currentView: 'grid' | 'list';
  isFetching: boolean;
  onActionClicked(option: AllItemActions, event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onHeaderButtonClick(event: any, item: MediaItem): void;
  handleClearSelected(): void;
  handleSelect(path: string, isSelected: boolean): void;
  handleSelectAll(checked: boolean): void;
  onPreview(item: MediaItem): void;
  clearPath(): void;
  onSelectedPathChanges(path: string): void;
  toggleDrawer(): void;
  handleChangeView(): void;
}

export const useSearchState = ({ searchParameters, onSelect }: useSearchStateProps): useSearchStateReturn => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const clipboard = useSelection((state) => state.content.clipboard);
  const site = useActiveSiteId();
  const { authoringBase, guestBase } = useEnv();
  const [selected, setSelected] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult>(null);
  const [selectedPath, setSelectedPath] = useState<string>(searchParameters.path ?? '');
  const { itemsByPath, isFetching } = useDetailedItems(selected);
  const [drawerOpen, setDrawerOpen] = useState(window.innerWidth > 960);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<ApiResponse>(null);
  const [isFetchingResults, setIsFetchingResults] = useState(false);

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

  const areAllSelected = useMemo(() => {
    if (!searchResults || searchResults.items.length === 0) return false;
    return !searchResults.items.some((item: any) => !selected.includes(item.path));
  }, [searchResults, selected]);

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

  const onHeaderButtonClick = (event: any, item: MediaItem) => {
    const path = item.path;
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

  const refreshSearch = useCallback(() => {
    setError(null);
    setIsFetchingResults(true);
    search(site, searchParameters).subscribe({
      next(result) {
        setSearchResults(result);
        setIsFetchingResults(false);
      },
      error(error) {
        setIsFetchingResults(false);
        setSearchResults({ total: 0, items: [], facets: [] });
        const { response } = error;
        if (response && response.response) {
          setError(response.response);
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
    });
  }, [dispatch, formatMessage, searchParameters, site]);

  const handleClearSelected = useCallback(() => {
    selected.forEach((path) => {
      onSelect?.(path, false);
    });
    setSelected([]);
  }, [onSelect, selected]);

  const handleSelect = (path: string, isSelected: boolean) => {
    if (isSelected) {
      setSelected([...selected, path]);
    } else {
      let selectedItems = [...selected];
      let index = selectedItems.indexOf(path);
      selectedItems.splice(index, 1);
      setSelected(selectedItems);
    }
    onSelect?.(path, isSelected);
  };

  const handleSelectAll = (checked: boolean) => {
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
            url: `${guestBase}${getPreviewURLFromPath(item.path)}?crafterCMSGuestDisabled=true`
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

  const clearPath = () => {
    setSelectedPath(undefined);
  };

  const onSelectedPathChanges = (path: string) => {
    setSelectedPath(path);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleChangeView = () => {
    if (currentView === 'grid') {
      setCurrentView('list');
    } else {
      setCurrentView('grid');
    }
  };

  useEffect(() => {
    const eventsThatNeedReaction = [contentEvent.type, deleteContentEvent.type];
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
    refreshSearch();
    return () => setError(null);
  }, [refreshSearch]);

  return {
    error,
    selected,
    guestBase,
    drawerOpen,
    currentView,
    itemsByPath,
    selectedPath,
    searchResults,
    areAllSelected,
    selectionOptions,
    handleClearSelected,
    isFetching: isFetchingResults,
    clearPath,
    onPreview,
    toggleDrawer,
    handleSelect,
    handleSelectAll,
    onActionClicked,
    handleChangeView,
    onHeaderButtonClick,
    onSelectedPathChanges
  };
};
