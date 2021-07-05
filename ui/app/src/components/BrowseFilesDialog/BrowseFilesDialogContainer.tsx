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
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { FormattedMessage } from 'react-intl';
import { search } from '../../services/search';
import { ElasticParams, MediaItem, SearchItem } from '../../models/Search';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import MediaCard from '../MediaCard';
import { useEnv } from '../../utils/hooks/useEnv';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useStyles } from './styles';
import SearchBar from '../Controls/SearchBar';
import clsx from 'clsx';
import MediaSkeletonCard from './MediaSkeletonCard';
import { useDebouncedInput } from '../../utils/hooks/useDebouncedInput';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import EmptyState from '../SystemStatus/EmptyState';
import Pagination from '../Pagination';
import { showPreviewDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';

interface BrowseFilesDialogUIProps {
  path: string;
  contentTypes?: string[];
  mimeTypes?: string[];
  multiSelect?: boolean;
  rowsPerPageOptions?: number[];
  onClose(): void;
  onSuccess?(response: { name: string; url: string } | { name: string; url: string }[]): void;
  onClosed?(): void;
}

const initialParameters: ElasticParams = {
  query: '',
  keywords: '',
  offset: 0,
  limit: 20,
  sortBy: '_score',
  sortOrder: 'desc',
  filters: {}
};

export function BrowseFilesDialogContainer(props: BrowseFilesDialogUIProps) {
  const {
    path,
    onClose,
    onClosed,
    onSuccess,
    rowsPerPageOptions = [10, 15, 20],
    multiSelect = false,
    mimeTypes,
    contentTypes
  } = props;
  const [items, setItems] = useState<SearchItem[]>();
  const site = useActiveSiteId();
  const { guestBase } = useEnv();
  const dispatch = useDispatch();
  const classes = useStyles();
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
  const [selectedList, setSelectedList] = useState([]);

  useUnmount(onClosed);

  const fetchItems = useCallback(() => {
    search(site, { ...searchParameters, path }).subscribe((response) => {
      setTotal(response.total);
      setItems(response.items);
    });
  }, [searchParameters, path, site]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onCardSelected = (item: MediaItem) => {
    if (multiSelect) {
    } else {
      setSelectedCard(item);
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
    onSuccess?.({ name: selectedCard.name, url: selectedCard.path });
  };

  const onChangePage = (page: number) => {
    setSearchParameters({ offset: page * searchParameters.limit });
  };

  const onChangeRowsPerPage = (e) => {
    setSearchParameters({ limit: e.target.value });
  };

  const onCheckboxChecked = (path: string, selected: boolean) => {
    console.log(path);
    console.log(selected);
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

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="browseFilesDialog.uploadImage" defaultMessage="Select a file" />}
        onDismiss={onClose}
      />
      <DialogBody className={classes.dialogBody}>
        <SearchBar
          keyword={keyword}
          onChange={handleSearchKeyword}
          showDecoratorIcon={true}
          showActionButton={Boolean(keyword)}
          classes={{ root: classes.searchRoot }}
        />
        <div className={classes.cardsContainer}>
          {items
            ? items.map((item: SearchItem) => {
                return (
                  <MediaCard
                    classes={{
                      root: clsx(classes.mediaCardRoot, item.path === selectedCard?.path && 'selected'),
                      header: clsx(!multiSelect && classes.cardHeader)
                    }}
                    key={item.path}
                    item={item}
                    selected={multiSelect ? [] : null}
                    onSelect={multiSelect ? onCheckboxChecked : null}
                    onPreviewButton={item.type === 'Image' ? onPreviewImage : null}
                    previewAppBaseUri={guestBase}
                    onCardClicked={onCardSelected}
                    hasSubheader={false}
                  />
                );
              })
            : new Array(12).fill(null).map((x, i) => <MediaSkeletonCard key={i} />)}
        </div>
        {items && items.length === 0 && (
          <EmptyState
            classes={{ root: classes.emptyState }}
            title={<FormattedMessage id="browseFilesDialog.noResults" defaultMessage="No files found." />}
          />
        )}
      </DialogBody>
      <DialogFooter>
        {items && (
          <Pagination
            rowsPerPageOptions={rowsPerPageOptions}
            classes={{ root: classes.paginationRoot }}
            count={total}
            rowsPerPage={searchParameters.limit}
            page={Math.ceil(searchParameters.offset / searchParameters.limit)}
            onChangePage={(page: number) => onChangePage(page)}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={!selectedCard} onClick={onSelectButtonClick}>
          <FormattedMessage id="words.select" defaultMessage="Select" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
