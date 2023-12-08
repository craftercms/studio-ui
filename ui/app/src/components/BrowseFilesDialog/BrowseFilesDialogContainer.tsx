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

import React, { useCallback, useEffect, useState } from 'react';
import { search } from '../../services/search';
import { MediaItem, SearchItem } from '../../models/Search';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useEnv } from '../../hooks/useEnv';
import { useDebouncedInput } from '../../hooks/useDebouncedInput';
import { useSpreadState } from '../../hooks/useSpreadState';
import { closeSingleFileUploadDialog, showSingleFileUploadDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import LookupTable from '../../models/LookupTable';
import { BrowseFilesDialogUI } from '.';
import { BrowseFilesDialogContainerProps, initialParameters } from './utils';
import { checkPathExistence } from '../../services/content';
import { FormattedMessage } from 'react-intl';
import EmptyState from '../EmptyState';
import BrowseFilesDialogContainerSkeleton from './BrowseFilesDialogContainerSkeleton';
import { batchActions, dispatchDOMEvent } from '../../state/actions/misc';
import { createCustomDocumentEventListener } from '../../utils/dom';
import { getStoredBrowseDialogCompactMode, setStoredBrowseDialogCompactMode } from '../../utils/state';
import useActiveUser from '../../hooks/useActiveUser';
import { withoutIndex } from '../../utils/path';

export function BrowseFilesDialogContainer(props: BrowseFilesDialogContainerProps) {
  const {
    path,
    onClose,
    onSuccess,
    multiSelect = false,
    mimeTypes,
    contentTypes,
    numOfLoaderItems,
    allowUpload = true
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
  const browsePath = path.replace(/\/+$/, '');
  const [currentPath, setCurrentPath] = useState(browsePath);
  const [fetchingBrowsePathExists, setFetchingBrowsePathExists] = useState(false);
  const [browsePathExists, setBrowsePathExists] = useState(false);
  const [sortKeys, setSortKeys] = useState([]);
  const { username } = useActiveUser();
  const [compact, setCompact] = useState(() => getStoredBrowseDialogCompactMode(username));

  const fetchItems = useCallback(
    () =>
      search(site, { ...searchParameters, path: `${currentPath}/[^/]+(/index\\.xml)?` }).subscribe((response) => {
        setTotal(response.total);
        setItems(response.items);
        setSortKeys(response.facets.map((facet) => facet.name));
      }),
    [searchParameters, currentPath, site]
  );

  useEffect(() => {
    let subscription;
    if (!browsePathExists) {
      setFetchingBrowsePathExists(true);
      subscription = checkPathExistence(site, browsePath).subscribe((exists) => {
        if (exists) {
          fetchItems();
          setBrowsePathExists(true);
        }
        setFetchingBrowsePathExists(false);
      });
    } else {
      fetchItems();
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchItems, site, browsePath, browsePathExists]);

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
    setSearchParameters({ offset: 0, limit: e.target.value });
  };

  const onCheckboxChecked = (path: string, selected: boolean) => {
    setSelectedLookup({ [path]: selected ? items.find((item) => item.path === path) : null });
  };

  const onPathSelected = (path: string) => {
    setCurrentPath(withoutIndex(path));
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  const onUpload = () => {
    dispatch(
      showSingleFileUploadDialog({
        site,
        path: currentPath,
        fileTypes: mimeTypes,
        onClose: closeSingleFileUploadDialog(),
        onUploadComplete: batchActions([closeSingleFileUploadDialog(), dispatchDOMEvent({ id: 'imageUploaded' })])
      })
    );

    createCustomDocumentEventListener('imageUploaded', (response) => {
      setTimeout(() => {
        fetchItems();
      }, 2000);
    });
  };

  const onRefresh = () => {
    fetchItems();
  };

  const toggleCompact = () => {
    setStoredBrowseDialogCompactMode(username, !compact);
    setCompact(!compact);
  };

  return fetchingBrowsePathExists ? (
    <BrowseFilesDialogContainerSkeleton />
  ) : browsePathExists ? (
    <BrowseFilesDialogUI
      compact={compact}
      onToggleViewMode={toggleCompact}
      currentPath={currentPath}
      items={items}
      path={browsePath}
      guestBase={guestBase}
      keyword={keyword}
      selectedCard={selectedCard}
      selectedArray={selectedArray}
      multiSelect={multiSelect}
      searchParameters={searchParameters}
      setSearchParameters={setSearchParameters}
      limit={searchParameters.limit}
      offset={searchParameters.offset}
      total={total}
      sortKeys={sortKeys}
      onCardSelected={onCardSelected}
      onChangePage={onChangePage}
      onChangeRowsPerPage={onChangeRowsPerPage}
      onCheckboxChecked={onCheckboxChecked}
      handleSearchKeyword={handleSearchKeyword}
      onCloseButtonClick={onCloseButtonClick}
      onPathSelected={onPathSelected}
      onSelectButtonClick={onSelectButtonClick}
      numOfLoaderItems={numOfLoaderItems}
      onRefresh={onRefresh}
      onUpload={onUpload}
      allowUpload={allowUpload}
    />
  ) : (
    <EmptyState
      styles={{ root: { height: '60vh' } }}
      title={
        <FormattedMessage
          id="browseFilesDialog.emptyStateMessage"
          defaultMessage="Path `{path}` doesn't exist."
          values={{ path: currentPath }}
        />
      }
    />
  );
}

export default BrowseFilesDialogContainer;
