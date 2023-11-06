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

import SiteSearchToolBar from '../SiteSearchToolbar';
import React, { ReactNode, useRef } from 'react';
import Drawer from '@mui/material/Drawer';
import SiteSearchFilters from '../SiteSearchFilters';
import { makeStyles } from 'tss-react/mui';
import palette from '../../styles/palette';
import { ElasticParams, Filter, MediaItem, SearchResult } from '../../models/Search';
import { CheckedFilter, drawerWidth } from '../Search/utils';
import LookupTable from '../../models/LookupTable';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { translations } from '../Search/translations';
import TablePagination from '@mui/material/TablePagination';
import ApiResponseErrorState from '../ApiResponseErrorState';
import Grid from '@mui/material/Grid';
import MediaCard from '../MediaCard/MediaCard';
import EmptyState from '../EmptyState/EmptyState';
import ItemActionsSnackbar from '../ItemActionsSnackbar';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import { FormattedMessage, useIntl } from 'react-intl';
import { AllItemActions } from '../../models/Item';
import { ContextMenuOption } from '../ContextMenu';
import ApiResponse from '../../models/ApiResponse';
import IconButton from '@mui/material/IconButton';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import { UNDEFINED } from '../../utils/constants';
import { LoadingState } from '../LoadingState';

export interface SearchUIProps {
  selectedPath: string;
  selected: string[];
  selectionOptions: ContextMenuOption[];
  guestBase: string;
  sortBy?: string;
  sortOrder?: string;
  keyword: string[] | string;
  mode: 'select' | 'default';
  drawerOpen: boolean;
  embedded: boolean;
  desktopScreen: boolean;
  currentView: 'grid' | 'list';
  searchResults: SearchResult;
  areAllSelected: boolean;
  checkedFilters: LookupTable<CheckedFilter>;
  searchParameters: ElasticParams;
  error: ApiResponse;
  isFetching: boolean;
  onActionClicked(option: AllItemActions, event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  handleSelectAll(checked: any): void;
  onSelectedPathChanges(path: string): void;
  onCheckedFiltersChanges(checkedFilters: LookupTable<CheckedFilter>): any;
  clearFilter(facet: string): void;
  clearFilters(): void;
  handleSearchKeyword(keyword: string): void;
  handleChangeView(): void;
  toggleDrawer(): void;
  handleFilterChange(filter: Filter, isFilter?: boolean): void;
  handleChangePage(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number): void;
  handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void;
  handleSelect(path: string, isSelected: boolean): void;
  onPreview(item: MediaItem): void;
  onHeaderButtonClick(event: any, item: MediaItem): void;
  handleClearSelected(): void;
  onClose(): void;
  onAcceptSelection?(items: string[]): void;
}

const useStyles = makeStyles()((theme) => ({
  wrapper: {
    height: 'calc(100% - 65px)', // 100% - toolbar height
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.background.default,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    '&.hasContent': {
      height: 'inherit'
    },
    '&.select': {}
  },
  wrapperSelectMode: {
    height: 'calc(100% - 136px)'
  },
  shift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  searchHeader: {
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  searchDropdown: {
    marginRight: '7px'
  },
  search: {
    width: '500px'
  },
  searchHelperBar: {
    display: 'flex',
    padding: '0 6px 0 20px',
    alignItems: 'center',
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  clearSelected: {
    marginLeft: '5px',
    cursor: 'pointer'
  },
  helperContainer: {
    display: 'flex',
    marginLeft: 'auto',
    alignItems: 'center'
  },
  content: {
    flexGrow: 1,
    padding: '25px 30px',
    overflowY: 'scroll',
    position: 'relative'
  },
  empty: {
    height: '100%',
    justifyContent: 'center'
  },
  pagination: {
    marginLeft: 'auto',
    '& p': {
      padding: 0
    },
    '& svg': {
      top: 'inherit'
    }
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '10px',
    padding: '10px 0'
  },
  dialogCloseButton: {
    marginLeft: 'auto'
  },
  mediaPreview: {
    maxWidth: '700px',
    minWidth: '400px',
    minHeight: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      maxWidth: '100%'
    }
  },
  videoPreview: {},
  mediaCardListRoot: {
    display: 'flex'
  },
  mediaCardListCheckbox: {
    justifyContent: 'center',
    order: -2,
    marginRight: '5px',
    marginLeft: '16px'
  },
  mediaCardListHeader: {
    marginLeft: '15px'
  },
  mediaCardListMedia: {
    paddingTop: 0,
    height: '80px',
    width: '80px',
    order: -1
  },
  mediaCardListMediaIcon: {
    height: '80px',
    width: '80px',
    paddingTop: '0',
    order: -1
  },
  drawer: {
    flexShrink: 0
  },
  drawerPaper: {
    top: 65,
    bottom: 0,
    width: drawerWidth,
    zIndex: theme.zIndex.appBar - 1,
    height: 'auto',
    position: 'absolute'
  },
  drawerPaperSelect: {
    bottom: '71px'
  },
  paginationSelectRoot: {
    marginRight: 0
  },
  paginationSelect: {
    border: 'none'
  },
  filtersActive: {
    color: '#FFB400',
    marginLeft: '2px'
  },
  selectAppbar: {
    boxShadow: 'none',
    borderBottom: `1px solid ${palette.gray.light3}`
  },
  selectToolbar: {
    placeContent: 'center space-between',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : palette.white
  },
  selectToolbarTitle: {
    flexGrow: 1
  },
  drawerModal: {
    position: 'absolute',
    '& .MuiBackdrop-root': {
      background: 'transparent'
    }
  },
  actionsMenu: {
    flex: '0 0 auto',
    display: 'flex',
    padding: '14px 20px',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.divider}`,
    '& > :not(:first-child)': {
      marginLeft: '12px'
    }
  },
  container: {
    height: '100%',
    position: 'relative',
    background: theme.palette.background.default
  },
  cardActionArea: {
    width: 'auto',
    display: 'flex'
  },
  cardHeader: {
    flexGrow: 1
  }
}));

export function SearchUI(props: SearchUIProps) {
  const { classes, cx } = useStyles();
  // region const { ... } = props
  const {
    areAllSelected,
    error,
    isFetching,
    sortBy,
    sortOrder,
    searchParameters,
    mode,
    currentView,
    desktopScreen,
    embedded,
    keyword,
    handleSearchKeyword,
    checkedFilters,
    drawerOpen,
    searchResults,
    toggleDrawer,
    handleChangeView,
    handleFilterChange,
    clearFilter,
    clearFilters,
    selectedPath,
    onSelectedPathChanges,
    onCheckedFiltersChanges,
    handleSelectAll,
    handleChangePage,
    handleChangeRowsPerPage,
    onPreview,
    handleSelect,
    selected,
    guestBase,
    selectionOptions,
    onHeaderButtonClick,
    onActionClicked,
    handleClearSelected,
    onClose,
    onAcceptSelection
  } = props;
  // endregion

  const { formatMessage } = useIntl();

  const container = useRef();

  return (
    <section ref={container} className={classes.container}>
      <SiteSearchToolBar
        onChange={handleSearchKeyword}
        onMenuIconClick={toggleDrawer}
        handleChangeView={handleChangeView}
        currentView={currentView}
        keyword={keyword}
        showActionButton={Boolean(keyword)}
        showTitle={mode === 'select' || (mode === 'default' && !embedded)}
        embedded={embedded}
      />
      <Drawer
        variant={desktopScreen ? 'persistent' : 'temporary'}
        container={container.current}
        anchor="left"
        open={drawerOpen}
        className={classes.drawer}
        classes={{
          paper: cx(classes.drawerPaper, mode === 'select' && classes.drawerPaperSelect),
          modal: classes.drawerModal
        }}
        ModalProps={{
          ...(!desktopScreen && {
            onClose: () => toggleDrawer()
          })
        }}
      >
        {searchResults && searchResults.facets && (
          <SiteSearchFilters
            mode={mode}
            className={classes.searchDropdown}
            facets={searchResults.facets}
            handleFilterChange={handleFilterChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            checkedFilters={checkedFilters}
            setCheckedFilters={onCheckedFiltersChanges}
            clearFilters={clearFilters}
            handleClearClick={clearFilter}
            selectedPath={selectedPath}
            setSelectedPath={onSelectedPathChanges}
          />
        )}
      </Drawer>
      <section
        className={cx(classes.wrapper, {
          [classes.shift]: drawerOpen,
          [classes.wrapperSelectMode]: mode === 'select'
        })}
        style={
          drawerOpen && desktopScreen
            ? { width: `calc(100% - ${drawerWidth}px`, marginLeft: drawerWidth }
            : { marginLeft: 0 }
        }
      >
        <div className={classes.searchHelperBar}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={areAllSelected}
                  onClick={(e: any) => handleSelectAll(e.target.checked)}
                />
              }
              label={<Typography color="textPrimary">{formatMessage(translations.selectAll)}</Typography>}
            />
          </FormGroup>
          <TablePagination
            rowsPerPageOptions={[9, 15, 21]}
            className={classes.pagination}
            component="div"
            labelRowsPerPage={null}
            labelDisplayedRows={({ from, to, count }) => (
              <>
                <FormattedMessage
                  id="search.resultsCaption"
                  defaultMessage="{from}-{to} of {count} results {keywordLength, plural, =0 {}other{ for <b>“{keyword}”</b>}}"
                  values={{
                    from,
                    to,
                    count,
                    keyword: Array.isArray(keyword) ? keyword.join(' ') : keyword,
                    keywordLength: keyword.length,
                    b: (content: ReactNode[]) => <strong key={content[0] as string}>{content[0]}</strong>
                  }}
                />
                {(Object.keys(checkedFilters).length > 0 || Boolean(selectedPath)) && (
                  <strong>
                    <FormattedMessage
                      id="search.filtersActive"
                      defaultMessage=" • <span>Filters Active</span>"
                      values={{
                        span: (content: ReactNode[]) => (
                          <span key={content[0] as string} className={classes.filtersActive}>
                            {content[0]}
                          </span>
                        )
                      }}
                    />
                  </strong>
                )}
              </>
            )}
            count={searchResults?.total ?? 0}
            rowsPerPage={searchParameters.limit}
            page={Math.ceil(searchParameters.offset / searchParameters.limit)}
            backIconButtonProps={{
              'aria-label': formatMessage(translations.previousPage)
            }}
            nextIconButtonProps={{
              'aria-label': formatMessage(translations.nextPage)
            }}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            classes={{
              selectRoot: classes.paginationSelectRoot,
              select: classes.paginationSelect
            }}
          />
        </div>
        <section className={classes.content}>
          {error ? (
            <ApiResponseErrorState error={error} />
          ) : (
            <Grid
              container
              spacing={3}
              minHeight="100%"
              className={searchResults?.items.length === 0 ? classes.empty : ''}
            >
              {isFetching || searchResults === null ? (
                <LoadingState />
              ) : (
                <>
                  {searchResults.items.length > 0 ? (
                    searchResults.items.map((item: MediaItem, i) => (
                      <Grid key={i} item xs={12} {...(currentView === 'grid' ? { sm: 6, md: 4, lg: 4, xl: 3 } : {})}>
                        <MediaCard
                          classes={
                            currentView === 'list'
                              ? {
                                  root: classes.mediaCardListRoot,
                                  checkbox: classes.mediaCardListCheckbox,
                                  media: classes.mediaCardListMedia,
                                  mediaIcon: classes.mediaCardListMediaIcon,
                                  cardActionArea: classes.cardActionArea,
                                  cardHeader: classes.cardHeader
                                }
                              : {}
                          }
                          item={item}
                          onPreview={mode === 'default' ? () => onPreview(item) : UNDEFINED}
                          onClick={
                            mode === 'select' ? () => handleSelect(item.path, !selected.includes(item.path)) : UNDEFINED
                          }
                          onSelect={handleSelect}
                          selected={selected}
                          previewAppBaseUri={guestBase}
                          action={
                            mode === 'default' ? (
                              <IconButton onClick={(e) => onHeaderButtonClick(e, item)} size="small">
                                <MoreVertRounded />
                              </IconButton>
                            ) : null
                          }
                        />
                      </Grid>
                    ))
                  ) : (
                    <EmptyState
                      title={formatMessage(translations.noResults)}
                      subtitle={formatMessage(translations.changeQuery)}
                    />
                  )}
                </>
              )}
            </Grid>
          )}
        </section>
      </section>
      {mode === 'default' && (
        <ItemActionsSnackbar
          open={selected.length > 0}
          options={selectionOptions}
          onActionClicked={onActionClicked}
          append={
            <Button size="small" color="primary" variant="text" onClick={handleClearSelected}>
              <ListItemText
                primary={formatMessage(translations.clearSelected, {
                  count: selected.length
                })}
              />
            </Button>
          }
        />
      )}
      {mode === 'select' && (
        <section className={classes.actionsMenu}>
          <Button variant="outlined" onClick={onClose}>
            {formatMessage(translations.cancel)}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={selected.length === 0}
            onClick={() => onAcceptSelection?.(selected)}
          >
            {formatMessage(translations.acceptSelection)}
          </Button>
        </section>
      )}
    </section>
  );
}

export default SearchUI;
