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

import React, { useRef, useState } from 'react';
import DialogBody from '../DialogBody/DialogBody';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { FormattedMessage, useIntl } from 'react-intl';
import { SearchItem } from '../../models';
import MediaCard from '../MediaCard/MediaCard';
import { useStyles } from './styles';
import SearchBar from '../SearchBar/SearchBar';
import MediaSkeletonCard from './MediaSkeletonCard';
import EmptyState from '../EmptyState/EmptyState';
import Pagination from '../Pagination';
import FolderBrowserTreeView from '../FolderBrowserTreeView';
import Box from '@mui/material/Box';
import { BrowseFilesDialogUIProps } from './utils';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { filtersMessages } from '../SiteSearchSortBy';
import { camelize } from '../../utils/string';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { inputBaseClasses } from '@mui/material/InputBase';
import ListViewIcon from '@mui/icons-material/ViewStreamRounded';
import GridViewIcon from '@mui/icons-material/GridOnRounded';
import ReorderRoundedIcon from '@mui/icons-material/ReorderRounded';

export function BrowseFilesDialogUI(props: BrowseFilesDialogUIProps) {
  // region const { ... } = props;
  const {
    items,
    guestBase,
    selectedCard,
    selectedArray,
    multiSelect = false,
    path,
    currentPath,
    searchParameters,
    setSearchParameters,
    limit,
    offset,
    keyword,
    total,
    numOfLoaderItems = 12,
    sortKeys,
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
    onUpload,
    allowUpload = true,
    viewMode = 'card',
    onToggleViewMode
  } = props;
  // endregion
  const { classes, cx: clsx } = useStyles();
  const { formatMessage } = useIntl();
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const buttonRef = useRef();

  return (
    <>
      <DialogBody className={classes.dialogBody}>
        <Box display="flex" className={classes.dialogContent}>
          <Box className={classes.leftWrapper} display="flex" flexDirection="column" rowGap="20px">
            <FolderBrowserTreeView rootPath={path} onPathSelected={onPathSelected} selectedPath={currentPath} />
          </Box>
          <section className={classes.rightWrapper}>
            <Paper className={classes.actionsBar}>
              <Toolbar disableGutters variant="dense">
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                  <Tooltip title={<FormattedMessage id="word.refresh" defaultMessage="Refresh" />}>
                    <IconButton onClick={onRefresh}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  {allowUpload && (
                    <Tooltip title={<FormattedMessage id="word.upload" defaultMessage="Upload" />}>
                      <IconButton onClick={onUpload} sx={{ mr: 1 }}>
                        <UploadFileIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Divider orientation="vertical" flexItem className={classes.actionsBarDivider} />
                  <SearchBar
                    keyword={keyword}
                    onChange={handleSearchKeyword}
                    showDecoratorIcon
                    showActionButton={Boolean(keyword)}
                    classes={{ root: classes.searchRoot, inputInput: classes.searchInput }}
                  />
                  <Divider orientation="vertical" flexItem className={classes.actionsBarDivider} />
                  <Button
                    id="sort-button"
                    aria-haspopup="true"
                    aria-controls={sortMenuOpen ? 'sort-menu' : undefined}
                    aria-expanded={sortMenuOpen ? 'true' : undefined}
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    ref={buttonRef}
                    sx={{ ml: 1, mr: 1 }}
                    startIcon={<FilterListIcon />}
                  >
                    <FormattedMessage id="words.sorting" defaultMessage="Sorting" />
                  </Button>
                  <Menu
                    id="sort-menu"
                    anchorEl={buttonRef.current}
                    open={sortMenuOpen}
                    onClose={() => setSortMenuOpen(false)}
                    MenuListProps={{
                      'aria-labelledby': 'sort-button'
                    }}
                  >
                    <MenuItem>
                      <FormControl fullWidth>
                        <InputLabel>
                          <FormattedMessage id="BrowseFilesDialog.sortBy" defaultMessage="Sort By" />
                        </InputLabel>
                        <Select
                          fullWidth
                          value={searchParameters.sortBy}
                          onChange={({ target }) => {
                            setSearchParameters({
                              sortBy: target.value
                            });
                          }}
                          size="small"
                          className={classes.sortingSelect}
                          label={<FormattedMessage id="BrowseFilesDialog.sortBy" defaultMessage="Sort By" />}
                        >
                          <MenuItem value={'_score'}>
                            <FormattedMessage id="words.relevance" defaultMessage="Relevance" />
                          </MenuItem>
                          <MenuItem value={'internalName'}>
                            <FormattedMessage id="words.name" defaultMessage="Name" />
                          </MenuItem>
                          {sortKeys.map((name, i) => (
                            <MenuItem value={name} key={i}>
                              {formatMessage(filtersMessages[camelize(name)])}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </MenuItem>
                    <MenuItem>
                      <FormControl fullWidth>
                        <InputLabel>
                          <FormattedMessage id="words.order" defaultMessage="Order" />
                        </InputLabel>
                        <Select
                          fullWidth
                          value={searchParameters.sortOrder}
                          onChange={({ target }) => {
                            setSearchParameters({
                              sortOrder: target.value
                            });
                          }}
                          size="small"
                          className={classes.sortingSelect}
                          label={<FormattedMessage id="words.order" defaultMessage="Order" />}
                        >
                          <MenuItem value={'asc'}>
                            {searchParameters.sortBy === '_score' ? (
                              <FormattedMessage
                                id="browseFilesDialog.lessRelevantFirst"
                                defaultMessage="Less relevant first"
                              />
                            ) : (
                              <FormattedMessage id="words.ascending" defaultMessage="Ascending" />
                            )}
                          </MenuItem>
                          <MenuItem value={'desc'}>
                            {searchParameters.sortBy === '_score' ? (
                              <FormattedMessage
                                id="browseFilesDialog.mostRelevantFirst"
                                defaultMessage="Most relevant first"
                              />
                            ) : (
                              <FormattedMessage id="words.descending" defaultMessage="Descending" />
                            )}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </MenuItem>
                  </Menu>
                  <Divider orientation="vertical" flexItem className={classes.actionsBarDivider} />
                </Box>
                <Box sx={{ display: 'flex', flexGrow: 0 }}>
                  <Tooltip title={<FormattedMessage defaultMessage="Switch view mode" />}>
                    <IconButton onClick={onToggleViewMode} sx={{ mr: 1 }}>
                      {viewMode === 'card' ? (
                        <ListViewIcon />
                      ) : viewMode === 'compact' ? (
                        <ReorderRoundedIcon />
                      ) : (
                        <GridViewIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Divider orientation="vertical" flexItem className={classes.actionsBarDivider} />
                  {items && (
                    <Pagination
                      sxs={{
                        toolbar: { pl: 0 },
                        root: {
                          [`.${inputBaseClasses.root}`]: {
                            marginRight: (theme) => theme.spacing(1),
                            backgroundColor: (theme) =>
                              theme.palette.background[theme.palette.mode === 'dark' ? 'default' : 'paper']
                          }
                        }
                      }}
                      count={total}
                      rowsPerPage={limit}
                      page={Math.ceil(offset / limit)}
                      onPageChange={(e, page: number) => onChangePage(page)}
                      onRowsPerPageChange={onChangeRowsPerPage}
                    />
                  )}
                </Box>
              </Toolbar>
            </Paper>
            <Box
              className={classes.cardsContainer}
              sx={viewMode === 'row' && { display: 'flex !important', flexFlow: 'wrap' }}
            >
              {items
                ? items.map((item: SearchItem) => (
                    <MediaCard
                      viewMode={viewMode}
                      classes={{
                        root: clsx(classes.mediaCardRoot, item.path === selectedCard?.path && classes.selectedCard)
                      }}
                      key={item.path}
                      item={item}
                      selected={multiSelect ? selectedArray : null}
                      onSelect={multiSelect ? onCheckboxChecked : null}
                      onPreview={onPreviewImage ? () => onPreviewImage(item) : null}
                      previewAppBaseUri={guestBase}
                      onClick={() => onCardSelected(item)}
                      showPath={true}
                    />
                  ))
                : new Array(numOfLoaderItems).fill(null).map((x, i) => <MediaSkeletonCard key={i} />)}
            </Box>
            {items && items.length === 0 && (
              <EmptyState
                styles={{ root: { flexGrow: 1 } }}
                title={<FormattedMessage id="browseFilesDialog.noResults" defaultMessage="No items found." />}
              />
            )}
          </section>
        </Box>
      </DialogBody>
      <DialogFooter>
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
