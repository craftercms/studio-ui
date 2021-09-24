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

import React from 'react';
import DialogHeader from '../DialogHeader/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { FormattedMessage } from 'react-intl';
import { MediaItem, SearchItem } from '../../models/Search';
import MediaCard from '../MediaCard';
import { useStyles } from './styles';
import SearchBar from '../Controls/SearchBar';
import clsx from 'clsx';
import MediaSkeletonCard from './MediaSkeletonCard';
import EmptyState from '../SystemStatus/EmptyState';
import Pagination from '../Pagination';
import FolderBrowserTreeView from '../FolderBrowserTreeView';
import Box from '@mui/material/Box';

interface BrowseFilesDialogUIProps {
  items: SearchItem[];
  guestBase: string;
  selectedCard: MediaItem;
  selectedArray: string[];
  multiSelect?: boolean;
  path: string;
  limit: number;
  offset: number;
  keyword: string;
  rowsPerPageOptions?: number[];
  total: number;
  numOfLoaderItems?: number;
  onCardSelected(item: MediaItem): void;
  onPreviewImage(item: MediaItem): void;
  onCheckboxChecked(path: string, selected: boolean): void;
  handleSearchKeyword(keyword: string): void;
  onPathSelected(path: string): void;
  onSelectButtonClick(): void;
  onChangePage(page: number): void;
  onChangeRowsPerPage(event): void;
  onClose(): void;
}

export function BrowseFilesDialogUI(props: BrowseFilesDialogUIProps) {
  const {
    items,
    guestBase,
    selectedCard,
    selectedArray,
    multiSelect = false,
    path,
    limit,
    offset,
    keyword,
    rowsPerPageOptions = [10, 15, 20],
    total,
    numOfLoaderItems = 12,
    onCardSelected,
    onPreviewImage,
    onCheckboxChecked,
    handleSearchKeyword,
    onPathSelected,
    onSelectButtonClick,
    onChangePage,
    onChangeRowsPerPage,
    onClose
  } = props;
  const classes = useStyles();
  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="browseFilesDialog.uploadImage" defaultMessage="Select a file" />}
        onCloseButtonClick={onClose}
      />
      <DialogBody className={classes.dialogBody}>
        <Box display="flex">
          <section className={classes.leftWrapper}>
            <FolderBrowserTreeView
              classes={{ treeItemLabel: classes.treeItemLabel }}
              rootPath={path}
              showPathTextBox={false}
              onPathSelected={onPathSelected}
            />
          </section>
          <section className={classes.rightWrapper}>
            <SearchBar
              keyword={keyword}
              onChange={handleSearchKeyword}
              showDecoratorIcon={true}
              showActionButton={Boolean(keyword)}
              classes={{ root: classes.searchRoot }}
            />
            <div className={classes.cardsContainer}>
              {items
                ? items.map((item: SearchItem) => (
                    <MediaCard
                      classes={{
                        root: clsx(classes.mediaCardRoot, item.path === selectedCard?.path && 'selected'),
                        header: clsx(!multiSelect && classes.cardHeader)
                      }}
                      key={item.path}
                      item={item}
                      selected={multiSelect ? selectedArray : null}
                      onSelect={multiSelect ? onCheckboxChecked : null}
                      onPreviewButton={item.type === 'Image' ? onPreviewImage : null}
                      previewAppBaseUri={guestBase}
                      onCardClicked={onCardSelected}
                      hasSubheader={false}
                    />
                  ))
                : new Array(numOfLoaderItems).fill(null).map((x, i) => <MediaSkeletonCard key={i} />)}
            </div>
            {items && items.length === 0 && (
              <EmptyState
                classes={{ root: classes.emptyState }}
                title={<FormattedMessage id="browseFilesDialog.noResults" defaultMessage="No files found." />}
              />
            )}
          </section>
        </Box>
      </DialogBody>
      <DialogFooter>
        {items && (
          <Pagination
            rowsPerPageOptions={rowsPerPageOptions}
            classes={{ root: classes.paginationRoot }}
            count={total}
            rowsPerPage={limit}
            page={Math.ceil(offset / limit)}
            onPageChange={(page: number) => onChangePage(page)}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        )}
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={!Boolean(selectedArray.length) && !selectedCard} onClick={onSelectButtonClick}>
          <FormattedMessage id="words.select" defaultMessage="Select" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
