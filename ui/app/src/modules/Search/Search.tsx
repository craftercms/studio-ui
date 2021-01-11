/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import { defineMessages, useIntl } from 'react-intl';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import MediaCard from '../../components/MediaCard';
import { search } from '../../services/search';
import { setRequestForgeryToken } from '../../utils/auth';
import { ElasticParams, Filter, MediaItem } from '../../models/Search';
import Spinner from '../../components/SystemStatus/Spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import EmptyState from '../../components/SystemStatus/EmptyState';
import queryString from 'query-string';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import clsx from 'clsx';
import { History, Location } from 'history';
import { getContentXML } from '../../services/content';
import { showEditDialog, showItemMenu, showPreviewDialog, updatePreviewDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, useSelection } from '../../utils/hooks';
import { completeDetailedItem, fetchUserPermissions } from '../../state/actions/content';
import { getPreviewURLFromPath } from '../../utils/path';
import ApiResponseErrorState from '../../components/ApiResponseErrorState';
import SiteSearchToolBar from '../../components/SiteSearchToolbar';
import { Drawer } from '@material-ui/core';
import SiteSearchFilters from '../../components/SiteSearchFilters';
import ItemActionsSnackBar from '../../components/ItemActionsSnackBar';
import { dispatchDOMEvent } from '../../state/actions/misc';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { DetailedItem } from '../../models/Item';
import palette from '../../styles/palette';
import Button from '@material-ui/core/Button';

const drawerWidth = 300;
let unsubscribeOnActionSuccess;
const idActionSuccess = 'actionSuccess';
const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 65px)',
    overflowY: 'scroll',
    background: theme.palette.background.default,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    '&.hasContent': {
      height: 'inherit'
    },
    '&.select': {
      paddingBottom: '60px'
    }
  },
  wrapperSelectMode: {
    height: 'calc(100% - 130px)'
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
    padding: '25px 30px'
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
    height: 'calc(100% - 65px)',
    bottom: 0,
    width: drawerWidth,
    zIndex: theme.zIndex.appBar - 1
  },
  drawerPaperSelect: {
    top: 0,
    height: '100%'
  },
  paginationCaption: {
    order: -1,
    marginRight: '25px'
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
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.default : palette.white
  },
  selectToolbarTitle: {
    flexGrow: 1
  },
  drawerModal: {
    '& .MuiBackdrop-root': {
      background: 'transparent'
    }
  },
  actionsMenu: {
    flex: '0 0 auto',
    display: 'flex',
    padding: '14px 20px',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${palette.gray.light3}`,
    '& > :not(:first-child)': {
      marginLeft: '12px'
    }
  }
}));

const initialSearchParameters: ElasticParams = {
  query: '',
  keywords: '',
  offset: 0,
  limit: 21,
  sortBy: '_score',
  sortOrder: 'desc',
  filters: {}
};

const messages = defineMessages({
  noResults: {
    id: 'search.noResults',
    defaultMessage: 'No Results Were Found.'
  },
  changeQuery: {
    id: 'search.changeQuery',
    defaultMessage: 'Try changing your query.'
  },
  videoProcessed: {
    id: 'search.videoProcessed',
    defaultMessage: 'Video is being processed, preview will be available when processing is complete'
  },
  selectAll: {
    id: 'search.selectAll',
    defaultMessage: 'Select all on this page'
  },
  resultsSelected: {
    id: 'search.resultsSelected',
    defaultMessage: '{count, plural, one {{count} item selected} other {{count} items selected}}'
  },
  itemsPerPage: {
    id: 'search.itemsPerPage',
    defaultMessage: 'Items per page:'
  },
  noPermissions: {
    id: 'search.noPermissions',
    defaultMessage: 'No permissions available.'
  },
  edit: {
    id: 'words.edit',
    defaultMessage: 'Edit'
  },
  delete: {
    id: 'words.delete',
    defaultMessage: 'Delete'
  },
  preview: {
    id: 'search.goToPreview',
    defaultMessage: 'Go to page'
  },
  resultsCaption: {
    id: 'search.resultsCaption',
    defaultMessage: '{from}-{to} of {count} results {keywordLength, plural, =0 {}other{ for <b>“{keyword}”</b>}} '
  },
  filtersActive: {
    id: 'search.filtersActive',
    defaultMessage: ' • <span>Filters Active</span>'
  },
  search: {
    id: 'words.search',
    defaultMessage: 'Search'
  },
  cancel: {
    id: 'words.cancel',
    defaultMessage: 'Cancel'
  },
  acceptSelection: {
    id: 'search.acceptSelection',
    defaultMessage: 'Accept Selection'
  }
});

interface SearchProps {
  history: History;
  location: Location;
  mode?: string;
  embedded?: boolean;
  onClose?(): void;
  onSelect?(path: string, selected: boolean): any;
  onAcceptSelection?(items: DetailedItem[]): any;
}

export default function Search(props: SearchProps) {
  const classes = useStyles({});
  const { current: refs } = useRef<any>({});
  const { history, location, mode = 'default', onSelect, embedded = false, onAcceptSelection, onClose } = props;
  const queryParams = useMemo(() => queryString.parse(location.search), [location.search]);
  const searchParameters = useMemo(() => setSearchParameters(initialSearchParameters, queryParams), [queryParams]);
  const [keyword, setKeyword] = useState(queryParams['keywords'] || '');
  const [currentView, setCurrentView] = useState('grid');
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState([]);
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const site = useActiveSiteId();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const guestBase = useSelection<string>((state) => state.env.guestBase);
  const legacyFormSrc = `${authoringBase}/legacy/form?`;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const [drawerOpen, setDrawerOpen] = useState(!embedded);
  const [checkedFilters, setCheckedFilters] = React.useState({});
  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [selectedPath, setSelectedPath] = useState(queryParams['path'] as string);
  const items = useSelection((state) => state.content.items);

  refs.createQueryString = createQueryString;

  setRequestForgeryToken();

  const getItemsDetails = useCallback(
    (items) => {
      items.forEach((item) => {
        dispatch(fetchUserPermissions({ path: item.path }));
        dispatch(completeDetailedItem({ path: item.path }));
      });
    },

    [dispatch]
  );

  useEffect(() => {
    search(site, searchParameters).subscribe(
      (result) => {
        setSearchResults(result);
        getItemsDetails(result.items);
      },
      ({ response }) => {
        if (response) {
          setApiState({ error: true, errorResponse: response.response });
        }
      }
    );
    return () => setApiState({ error: false, errorResponse: null });
  }, [searchParameters, site, getItemsDetails]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((keywords: string) => {
      if (!keywords) keywords = undefined;
      let qs = refs.createQueryString({ name: 'keywords', value: keywords });
      history.push({
        pathname: '/',
        search: `?${qs}`
      });
    });
    return () => subscription.unsubscribe();
  }, [history, onSearch$, refs]);

  const refreshSearch = useCallback(() => {
    search(site, searchParameters).subscribe(
      (result) => {
        setSearchResults(result);
        getItemsDetails(result.items);
      },
      ({ response }) => {
        if (response) {
          setApiState({ error: true, errorResponse: response });
        }
      }
    );
  }, [searchParameters, site, getItemsDetails]);

  const handleClearSelected = useCallback(() => {
    selected.forEach((path) => {
      onSelect?.(path, false);
    });
    setSelected([]);
  }, [onSelect, selected]);

  useEffect(() => {
    if (selected.length === 1) {
      unsubscribeOnActionSuccess = createCallbackListener(idActionSuccess, function() {
        handleClearSelected();
        refreshSearch();
      });
    } else if (!selected.length) {
      unsubscribeOnActionSuccess?.();
    }
  }, [selected, handleClearSelected, refreshSearch]);

  function renderMediaCards(items: [MediaItem], currentView: string) {
    if (items.length > 0) {
      return items.map((item: MediaItem, i: number) => {
        return currentView === 'grid' ? (
          <Grid key={i} item xs={12} sm={6} md={4} lg={4} xl={3}>
            <MediaCard
              item={item}
              onPreview={onPreview}
              onSelect={handleSelect}
              selected={selected}
              previewAppBaseUri={guestBase}
              onHeaderButtonClick={onHeaderButtonClick}
            />
          </Grid>
        ) : (
          <Grid key={i} item xs={12}>
            <MediaCard
              item={item}
              isList={true}
              onPreview={onPreview}
              onSelect={handleSelect}
              classes={{
                root: classes.mediaCardListRoot,
                checkbox: classes.mediaCardListCheckbox,
                header: classes.mediaCardListHeader,
                media: classes.mediaCardListMedia,
                mediaIcon: classes.mediaCardListMediaIcon
              }}
              selected={selected}
              previewAppBaseUri={guestBase}
              onHeaderButtonClick={onHeaderButtonClick}
            />
          </Grid>
        );
      });
    } else {
      return <EmptyState title={formatMessage(messages.noResults)} subtitle={formatMessage(messages.changeQuery)} />;
    }
  }

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
    let qs = createQueryString(filter, isFilter);
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
    searchResults.facets.forEach((facet) => clearFilter(facet.name));
    clearPath();
  }

  function clearPath() {
    handleFilterChange({ name: 'path', value: undefined }, false);
    setSelectedPath(undefined);
  }

  // createQueryString:
  // isFilter: It means that the filter is nested on object filter
  function createQueryString(filter: Filter, isFilter = false) {
    let newFilters;
    let filters: any = queryParams['filters'];
    filters = filters ? JSON.parse(filters) : {};
    if (isFilter) {
      filters[filter.name] = filter.value;
      queryParams.filters = JSON.stringify(filters);
      if (queryParams.filters === '{}') {
        queryParams.filters = undefined;
      }
      newFilters = { ...queryParams };
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
        newFilters = { ...queryParams, [filter.name]: filter.value, sortOrder: 'asc' };
      } else if (filter.name === 'sortBy' && queryParams['sortBy'] !== '_score' && filter.value === '_score') {
        newFilters = { ...queryParams, [filter.name]: filter.value, sortOrder: 'desc' };
      } else {
        newFilters = { ...queryParams, [filter.name]: filter.value };
      }
    }
    return queryString.stringify(newFilters);
  }

  function setSearchParameters(initialSearchParameters: ElasticParams, queryParams: Partial<ElasticParams>) {
    let formatParameters = { ...queryParams };
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
    let qs = refs.createQueryString({ name: 'offset', value: offset });
    history.push({
      pathname: '/',
      search: `?${qs}`
    });
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    let qs = refs.createQueryString({ name: 'limit', value: parseInt(event.target.value, 10) });
    history.push({
      pathname: '/',
      search: `?${qs}`
    });
  }

  function handleSelect(path: string, isSelected: boolean) {
    if (isSelected) {
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
    dispatch(fetchUserPermissions({ path }));
    dispatch(completeDetailedItem({ path }));
    dispatch(
      showItemMenu({
        path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top: event.clientY, left: event.clientX }
      })
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
        const src = `${legacyFormSrc}site=${site}&path=${item.path}&type=form&readonly=true`;
        dispatch(showEditDialog({ src }));
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

        getContentXML(site, url).subscribe((content) => {
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

  return (
    <>
      <SiteSearchToolBar
        onChange={handleSearchKeyword}
        onMenuIconClick={toggleDrawer}
        handleChangeView={handleChangeView}
        currentView={currentView}
        keyword={keyword}
        showActionButton={Boolean(keyword)}
        embedded={embedded}
      />
      <Drawer
        variant={desktopScreen && !embedded ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        className={classes.drawer}
        classes={{
          paper: clsx(classes.drawerPaper, { [classes.drawerPaperSelect]: mode === 'select' }),
          modal: classes.drawerModal
        }}
        ModalProps={{
          ...(desktopScreen && !embedded
            ? {}
            : {
                onBackdropClick: toggleDrawer,
                onEscapeKeyDown: toggleDrawer
              })
        }}
      >
        {searchResults && searchResults.facets && (
          <SiteSearchFilters
            mode={mode}
            className={classes.searchDropdown}
            facets={searchResults.facets}
            handleFilterChange={handleFilterChange}
            queryParams={queryParams}
            checkedFilters={checkedFilters}
            setCheckedFilters={setCheckedFilters}
            clearFilters={clearFilters}
            handleClearClick={clearFilter}
            selectedPath={selectedPath}
            setSelectedPath={setSelectedPath}
          />
        )}
      </Drawer>
      <section
        className={clsx(classes.wrapper, {
          select: mode === 'select',
          [classes.shift]: drawerOpen,
          [classes.wrapperSelectMode]: mode === 'select'
        })}
        style={
          drawerOpen && desktopScreen && !embedded
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
                  checked={areAllSelected()}
                  onClick={(e: any) => handleSelectAll(e.target.checked)}
                />
              }
              label={<Typography color="textPrimary">{formatMessage(messages.selectAll)}</Typography>}
            />
          </FormGroup>
          <TablePagination
            rowsPerPageOptions={[9, 15, 21]}
            className={classes.pagination}
            component="div"
            labelRowsPerPage={null}
            labelDisplayedRows={({ from, to, count }) => (
              <>
                {formatMessage(messages.resultsCaption, {
                  from,
                  to,
                  count,
                  keyword: Array.isArray(keyword) ? keyword.join(' ') : keyword,
                  keywordLength: keyword.length,
                  b: (content) => <strong key={content}>{content}</strong>
                })}
                {(Object.keys(checkedFilters).length > 0 || Boolean(selectedPath)) && (
                  <strong>
                    {formatMessage(messages.filtersActive, {
                      span: (content) => (
                        <span key={content} className={classes.filtersActive}>
                          {content}
                        </span>
                      )
                    })}
                  </strong>
                )}
              </>
            )}
            count={searchResults?.total ?? 0}
            rowsPerPage={searchParameters.limit}
            page={Math.ceil(searchParameters.offset / searchParameters.limit)}
            backIconButtonProps={{
              'aria-label': 'previous page'
            }}
            nextIconButtonProps={{
              'aria-label': 'next page'
            }}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            classes={{
              caption: classes.paginationCaption,
              selectRoot: classes.paginationSelectRoot,
              select: classes.paginationSelect
            }}
          />
        </div>
        <section className={classes.content}>
          {apiState.error ? (
            <ApiResponseErrorState error={apiState.errorResponse} />
          ) : (
            <Grid container spacing={3} className={searchResults?.items.length === 0 ? classes.empty : ''}>
              {searchResults === null ? (
                <Spinner background="inherit" />
              ) : (
                renderMediaCards(searchResults.items, currentView)
              )}
            </Grid>
          )}
        </section>
      </section>
      {mode === 'default' && (
        <ItemActionsSnackBar
          open={selected.length > 0}
          mode={mode}
          selectedItems={selected}
          handleClearSelected={handleClearSelected}
          onActionSuccess={dispatchDOMEvent({ id: idActionSuccess })}
          onAcceptSelection={onAcceptSelection}
        />
      )}
      {mode === 'select' && (
        <section className={classes.actionsMenu}>
          <Button variant="outlined" onClick={onClose}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={selected.length === 0}
            onClick={() => onAcceptSelection?.(selected.map((path) => items.byPath?.[path]))}
          >
            {formatMessage(messages.acceptSelection)}
          </Button>
        </section>
      )}
    </>
  );
}

function createCallbackListener(id: string, listener: EventListener): Function {
  let callback;
  callback = (e) => {
    listener(e.detail);
    document.removeEventListener(id, callback, false);
  };
  document.addEventListener(id, callback, false);
  return () => {
    document.removeEventListener(id, callback, false);
  };
}
