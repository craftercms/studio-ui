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

import React, { useCallback, useEffect, useState } from 'react';
import { search } from '../../services/search';
import { MediaItem, SearchItem } from '../../models/Search';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useEnv } from '../../utils/hooks/useEnv';
import { useDebouncedInput } from '../../utils/hooks/useDebouncedInput';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { showPreviewDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import LookupTable from '../../models/LookupTable';
import { BrowseFilesDialogUI } from '.';
import { BrowseFilesDialogContainerProps, initialParameters } from './utils';

export function BrowseFilesDialogContainer(props: BrowseFilesDialogContainerProps) {
  const {
    path,
    onClose,
    onSuccess,
    rowsPerPageOptions,
    multiSelect = false,
    mimeTypes,
    contentTypes,
    numOfLoaderItems
  } = props;
  const [items, setItems] = useState<SearchItem[]>();
  const site = useActiveSiteId();
  const { guestBase } = useEnv();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState('');
  const [selectedCard, setSelectedCard] = useState<MediaItem>();
  const [searchParameters, setSearchParameters] = useSpreadState({
    ...initialParameters,
    filters: {
      ...initialParameters.filters,
      ...(mimeTypes && { 'mime-type': mimeTypes }),
      ...(contentTypes && { 'content-type': contentTypes })
    }
  });
  const [total, setTotal] = useState<number>();
  const [selectedLookup, setSelectedLookup] = useSpreadState<LookupTable<MediaItem>>({});
  const selectedArray = Object.keys(selectedLookup).filter((key) => selectedLookup[key]);
  const [currentPath, setCurrentPath] = useState(path);

  const fetchItems = useCallback(() => {
    search(site, { ...searchParameters, path: `${currentPath}/[^/]+` }).subscribe((response) => {
      setTotal(response.total);
      setItems(response.items);
    });
  }, [searchParameters, currentPath, site]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onCardSelected = (item: MediaItem) => {
    if (multiSelect) {
      setSelectedLookup({ [item.path]: selectedLookup[item.path] ? null : item });
    } else {
      setSelectedCard(selectedCard?.path === item.path ? null : item);
    }
  };

  const onSearch = useCallback(
    (keywords) => {
      setSearchParameters({ keywords });
    },
    [setSearchParameters]
  );

  const onSearch$ = useDebouncedInput(onSearch, 400);

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  const onSelectButtonClick = () => {
    onSuccess?.(multiSelect ? selectedArray.map((path) => selectedLookup[path]) : selectedCard);
  };

  const onChangePage = (page: number) => {
    setSearchParameters({ offset: page * searchParameters.limit });
  };

  const onChangeRowsPerPage = (e) => {
    setSearchParameters({ limit: e.target.value });
  };

  const onCheckboxChecked = (path: string, selected: boolean) => {
    setSelectedLookup({ [path]: selected ? items.find((item) => item.path === path) : null });
  };

  const onPreviewImage = (item: MediaItem) => {
    dispatch(
      showPreviewDialog({
        type: 'image',
        title: item.name,
        url: item.path
      })
    );
  };

  const onPathSelected = (path: string) => {
    setCurrentPath(path);
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <BrowseFilesDialogUI
      items={items}
      path={path}
      guestBase={guestBase}
      keyword={keyword}
      selectedCard={selectedCard}
      selectedArray={selectedArray}
      multiSelect={multiSelect}
      limit={searchParameters.limit}
      offset={searchParameters.offset}
      total={total}
      onCardSelected={onCardSelected}
      onChangePage={onChangePage}
      onChangeRowsPerPage={onChangeRowsPerPage}
      onCheckboxChecked={onCheckboxChecked}
      handleSearchKeyword={handleSearchKeyword}
      onCloseButtonClick={onCloseButtonClick}
      onPathSelected={onPathSelected}
      onPreviewImage={onPreviewImage}
      onSelectButtonClick={onSelectButtonClick}
      numOfLoaderItems={numOfLoaderItems}
      rowsPerPageOptions={rowsPerPageOptions}
    />
  );
}

export default BrowseFilesDialogContainer;
