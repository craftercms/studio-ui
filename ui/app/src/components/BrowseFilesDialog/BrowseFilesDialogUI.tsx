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

import React from 'react';
import DialogBody from '../DialogBody/DialogBody';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { FormattedMessage } from 'react-intl';
import { SearchItem } from '../../models';
import MediaCard from '../MediaCard/MediaCard';
import { useStyles } from './styles';
import SearchBar from '../SearchBar/SearchBar';
import clsx from 'clsx';
import MediaSkeletonCard from './MediaSkeletonCard';
import EmptyState from '../EmptyState/EmptyState';
import Pagination from '../Pagination';
import Box from '@mui/material/Box';
import { BrowseFilesDialogUIProps } from './utils';
import Divider from '@mui/material/Divider';
import InputUnstyled from '@mui/base/InputUnstyled';
import { FolderBrowserPathNavigator } from '../FolderBrowserPathNavigator';

export function BrowseFilesDialogUI(props: BrowseFilesDialogUIProps) {
  const {
    items,
    guestBase,
    selectedCard,
    selectedArray,
    multiSelect = false,
    path,
    currentPath,
    limit,
    offset,
    keyword,
    rowsPerPageOptions = [9, 15, 21],
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
    onCloseButtonClick,
    onRefresh,
    onUpload
  } = props;
  const classes = useStyles();
  return (
    <>
      <DialogBody className={classes.dialogBody}>
        <Box display="flex">
          <section className={classes.leftWrapper}>
            <FolderBrowserPathNavigator rootPath={path} onPathSelected={onPathSelected} />
          </section>
          <section className={classes.rightWrapper}>
            <InputUnstyled value={currentPath} className={classes.currentPath} disabled title={currentPath} />
            <Divider />
            <Box display="flex" alignItems="center" marginTop="16px" marginBottom="16px" gap="8px">
              <SecondaryButton onClick={onUpload}>
                <FormattedMessage id="word.upload" defaultMessage="Upload" />
              </SecondaryButton>
              <SecondaryButton onClick={onRefresh}>
                <FormattedMessage id="word.refresh" defaultMessage="Refresh" />
              </SecondaryButton>
              <SearchBar
                keyword={keyword}
                onChange={handleSearchKeyword}
                showDecoratorIcon
                showActionButton={Boolean(keyword)}
                classes={{ root: classes.searchRoot }}
              />
            </Box>

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
        <SecondaryButton onClick={onCloseButtonClick}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={!Boolean(selectedArray.length) && !selectedCard} onClick={onSelectButtonClick}>
          <FormattedMessage id="words.select" defaultMessage="Select" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default BrowseFilesDialogUI;
