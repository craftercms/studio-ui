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

import { actionsToBeShown, initialSearchParameters, SearchProps } from './utils';
import SearchUI from './SearchUI';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Subject } from 'rxjs';
import { useSelection } from '../../utils/hooks/useSelection';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { useDetailedItems } from '../../utils/hooks/useDetailedItems';
import { AllItemActions, DetailedItem } from '../../models/Item';
import { generateMultipleItemOptions, generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useEnv } from '../../utils/hooks/useEnv';
import { useDispatch } from 'react-redux';
import { MediaItem } from '../../models/Search';
import { batchActions } from '../../state/actions/misc';
import { completeDetailedItem } from '../../state/actions/content';
import { showEditDialog, showItemMegaMenu, showPreviewDialog, updatePreviewDialog } from '../../state/actions/dialogs';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath } from '../../utils/content';
import { useIntl } from 'react-intl';
import { getPreviewURLFromPath } from '../../utils/path';
import { fetchContentXML } from '../../services/content';
import { search } from '../../services/search';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { translations } from './translations';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { itemCreated, itemDuplicated, itemsDeleted, itemsPasted, itemUpdated } from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';

export function Search(props: SearchProps) {
  const { mode = 'default', onSelect, embedded = false, onAcceptSelection, onClose } = props;

  // region State
  const [sortBy, setSortBy] = useState<string>();
  const [sortOrder, setTortOrder] = useState<string>();
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [keyword, setKeyword] = useState('');
  const [checkedFilters, setCheckedFilters] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(window.innerWidth > 960);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [selected, setSelected] = useState([]);
  const [searchParameters, setSearchParameters] = useSpreadState({ ...initialSearchParameters });
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const { itemsByPath, isFetching } = useDetailedItems(selected);

  // endregion

  // region Hooks
  const site = useActiveSiteId();
  const { authoringBase, guestBase } = useEnv();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  const areAllSelected = useMemo(() => {
    if (!searchResults || searchResults.items.length === 0) return false;
    return !searchResults.items.some((item: any) => !selected.includes(item.path));
  }, [searchResults, selected]);
  const clipboard = useSelection((state) => state.content.clipboard);
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
  // endregion

  // region Callbacks
  const clearPath = () => {
    setSelectedPath(undefined);
  };

  const clearFilter = (facet: string) => {
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
  };

  const clearFilters = () => {
    Object.keys(checkedFilters).map((filter) => clearFilter(filter));
    clearPath();
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

  const handleFilterChange = () => {};

  const handleSearchKeyword = (keyword: string) => {
    setKeyword(keyword);
    onSearch$.next(keyword);
  };

  const onSelectedPathChanges = (path: string) => {
    setSelectedPath(path);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {};

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {};

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

  const handleClearSelected = useCallback(() => {
    selected.forEach((path) => {
      onSelect?.(path, false);
    });
    setSelected([]);
  }, [onSelect, selected]);

  const onCheckedFiltersChanges = useCallback((checkedFilters: object) => {
    console.log('setCheckedFilters onCheckedFiltersChanges');
    setCheckedFilters(checkedFilters);
  }, []);

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
  // endregion

  // region Effects
  useEffect(() => {
    refreshSearch();
    return () => setApiState({ error: false, errorResponse: null });
  }, [refreshSearch]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((keywords: string) => {
      if (!keywords) keywords = undefined;
    });
    return () => subscription.unsubscribe();
  }, [onSearch$]);

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
  // endregion

  return (
    <SearchUI
      sortBy={sortBy}
      sortOrder={sortOrder}
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
