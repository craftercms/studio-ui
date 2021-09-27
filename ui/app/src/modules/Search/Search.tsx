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
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import MediaCard from '../../components/MediaCard';
import { search } from '../../services/search';
import { ElasticParams, Filter, MediaItem } from '../../models/Search';
import Spinner from '../../components/SystemStatus/Spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import EmptyState from '../../components/SystemStatus/EmptyState';
import queryString from 'query-string';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import clsx from 'clsx';
import { History, Location } from 'history';
import { fetchContentXML } from '../../services/content';
import { showEditDialog, showItemMegaMenu, showPreviewDialog, updatePreviewDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import { completeDetailedItem } from '../../state/actions/content';
import { getPreviewURLFromPath } from '../../utils/path';
import ApiResponseErrorState from '../../components/ApiResponseErrorState';
import SiteSearchToolBar from '../../components/SiteSearchToolbar';
import Drawer from '@mui/material/Drawer';
import ListItemText from '@mui/material/ListItemText';
import SiteSearchFilters from '../../components/SiteSearchFilters';
import ItemActionsSnackbar from '../../components/ItemActionsSnackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AllItemActions, DetailedItem } from '../../models/Item';
import palette from '../../styles/palette';
import Button from '@mui/material/Button';
import { itemCreated, itemDuplicated, itemsDeleted, itemsPasted, itemUpdated } from '../../state/actions/system';
import { getHostToHostBus } from '../Preview/previewContext';
import { generateMultipleItemOptions, generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath } from '../../utils/content';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useEnv } from '../../utils/hooks/useEnv';
import { batchActions } from '../../state/actions/misc';
import { useDetailedItems } from '../../utils/hooks/useDetailedItems';

interface SearchProps {
  history: History;
  location: Location;
  mode?: 'default' | 'select';
  embedded?: boolean;
  onClose?(): void;
  onSelect?(path: string, selected: boolean): any;
  onAcceptSelection?(items: DetailedItem[]): any;
}

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  wrapper: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 65px)',
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
    padding: '25px 30px',
    overflowY: 'scroll'
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
  },
  clearSelected: {
    id: 'search.clearSelected',
    defaultMessage: 'Clear {count} selected'
  },
  nextPage: {
    id: 'pagination.nextPage',
    defaultMessage: 'Next page'
  },
  previousPage: {
    id: 'pagination.previousPage',
    defaultMessage: 'Previous page'
  },
  unknownError: {
    id: 'siteSearch.unknownErrorSearching',
    defaultMessage: 'An error occurred with the search service.'
  }
});

const actionsToBeShown: AllItemActions[] = [
  'edit',
  'delete',
  'publish',
  'rejectPublish',
  'duplicate',
  'duplicateAsset',
  'dependencies',
  'history'
];

export default function Search(props: SearchProps) {
  const classes = useStyles();
  const refs = useRef({ unsubscribeOnActionSuccess: null, createQueryString: null });
  const { history, location, mode = 'default', onSelect, embedded = false, onAcceptSelection, onClose } = props;
  const queryParams = useMemo(() => queryString.parse(location.search), [location.search]);
  const searchParameters = useMemo(() => setSearchParameters(initialSearchParameters, queryParams), [queryParams]);
  const [keyword, setKeyword] = useState(queryParams['keywords'] || '');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState([]);
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const clipboard = useSelection((state) => state.content.clipboard);
  const guestBase = useSelection<string>((state) => state.env.guestBase);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const [drawerOpen, setDrawerOpen] = useState(!embedded && window.innerWidth > 960);
  const [checkedFilters, setCheckedFilters] = useState({});
  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [selectedPath, setSelectedPath] = useState(queryParams['path'] as string);
  const { itemsByPath, isFetching } = useDetailedItems(selected);

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

  refs.current.createQueryString = createQueryString;

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
                message: formatMessage(messages.unknownError)
              }
            })
          );
        }
      }
    );
  }, [dispatch, formatMessage, searchParameters, site]);

  const handleClearSelected = useCallback(() => {
    selected.forEach((path) => {
      onSelect?.(path, false);
    });
    setSelected([]);
  }, [onSelect, selected]);

  useEffect(() => {
    refreshSearch();
    return () => setApiState({ error: false, errorResponse: null });
  }, [refreshSearch]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((keywords: string) => {
      if (!keywords) keywords = undefined;
      let qs = refs.current.createQueryString({ name: 'keywords', value: keywords });
      history.push({
        pathname: '/',
        search: `?${qs}`
      });
    });
    return () => subscription.unsubscribe();
  }, [history, onSearch$]);

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
    let qs = createQueryString(filter, isFilter, { offset: 0 });
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
    Object.keys(checkedFilters).map((filter) => clearFilter(filter));
    clearPath();
  }

  function clearPath() {
    handleFilterChange({ name: 'path', value: undefined }, false);
    setSelectedPath(undefined);
  }

  // createQueryString:
  // isFilter: It means that the filter is nested on object filter
  function createQueryString(filter: Filter, isFilter = false, overrideQueryParams = {}) {
    let newFilters;
    let filters: any = queryParams['filters'];
    filters = filters ? JSON.parse(filters) : {};
    if (isFilter) {
      filters[filter.name] = filter.value;
      queryParams.filters = JSON.stringify(filters);
      if (queryParams.filters === '{}') {
        queryParams.filters = undefined;
      }
      newFilters = { ...queryParams, ...overrideQueryParams };
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
        newFilters = { ...queryParams, [filter.name]: filter.value, sortOrder: 'asc', ...overrideQueryParams };
      } else if (filter.name === 'sortBy' && queryParams['sortBy'] !== '_score' && filter.value === '_score') {
        newFilters = { ...queryParams, [filter.name]: filter.value, sortOrder: 'desc', ...overrideQueryParams };
      } else {
        newFilters = { ...queryParams, [filter.name]: filter.value, ...overrideQueryParams };
      }
    }
    return queryString.stringify(newFilters);
  }

  function setSearchParameters(initialSearchParameters: ElasticParams, queryParams: Partial<ElasticParams>) {
    let formatParameters = {
      ...queryParams,
      ...(queryParams.limit && { limit: Number(queryParams.limit) }),
      ...(queryParams.offset && { offset: Number(queryParams.offset) })
    };
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
    let qs = refs.current.createQueryString({ name: 'offset', value: offset });
    history.push({
      pathname: '/',
      search: `?${qs}`
    });
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    let qs = refs.current.createQueryString({ name: 'limit', value: parseInt(event.target.value, 10) });
    history.push({
      pathname: '/',
      search: `?${qs}`
    });
  }

  function handleSelect(path: string, isSelected: boolean) {
    if (isSelected) {
      // dispatch(completeDetailedItem({ path }));
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
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
              'aria-label': formatMessage(messages.previousPage)
            }}
            nextIconButtonProps={{
              'aria-label': formatMessage(messages.nextPage)
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
          {apiState.error ? (
            <ApiResponseErrorState error={apiState.errorResponse} />
          ) : (
            <Grid container spacing={3} className={searchResults?.items.length === 0 ? classes.empty : ''}>
              {searchResults === null ? (
                <Spinner background="inherit" />
              ) : searchResults.items.length > 0 ? (
                searchResults.items.map((item: MediaItem, i) => (
                  <Grid key={i} item xs={12} {...(currentView === 'grid' ? { sm: 6, md: 4, lg: 4, xl: 3 } : {})}>
                    <MediaCard
                      isList={currentView === 'list'}
                      classes={
                        currentView === 'list'
                          ? {
                              root: classes.mediaCardListRoot,
                              checkbox: classes.mediaCardListCheckbox,
                              header: classes.mediaCardListHeader,
                              media: classes.mediaCardListMedia,
                              mediaIcon: classes.mediaCardListMediaIcon
                            }
                          : void 0
                      }
                      item={item}
                      onPreview={onPreview}
                      onSelect={handleSelect}
                      selected={selected}
                      previewAppBaseUri={guestBase}
                      onHeaderButtonClick={onHeaderButtonClick}
                    />
                  </Grid>
                ))
              ) : (
                <EmptyState title={formatMessage(messages.noResults)} subtitle={formatMessage(messages.changeQuery)} />
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
                primary={formatMessage(messages.clearSelected, {
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
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={selected.length === 0}
            onClick={() => onAcceptSelection?.(selected.map((path) => itemsByPath?.[path]))}
          >
            {formatMessage(messages.acceptSelection)}
          </Button>
        </section>
      )}
    </>
  );
}
