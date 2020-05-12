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
import React, { ElementType, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import AppsIcon from '@material-ui/icons/Apps';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import MediaCard from '../../components/MediaCard';
import { search } from '../../services/search';
import { setRequestForgeryToken } from '../../utils/auth';
import { ElasticParams, Filter, MediaItem, Preview } from '../../models/Search';
import Spinner from '../../components/SystemStatus/Spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import EmptyState from '../../components/SystemStatus/EmptyState';
import ViewListIcon from '@material-ui/icons/ViewList';
import FilterSearchDropdown from './FilterSearchDropdown';
import queryString from 'query-string';
import ErrorState from '../../components/SystemStatus/ErrorState';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import AsyncVideoPlayer from '../../components/AsyncVideoPlayer';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import clsx from 'clsx';
import Editor from '../../components/Editor';
import IFrame from '../../components/IFrame';
import { getPreviewURLFromPath } from '../../utils/path';
import { History, Location } from 'history';
import { getContent } from '../../services/content';
import { palette } from '../../styles/theme';
import SearchBar from '../../components/Controls/SearchBar';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { isEditableAsset } from '../../utils/content';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import DialogHeader from '../../components/Dialogs/DialogHeader';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    '&.hasContent': {
      height: 'inherit'
    },
    '&.select': {
      paddingBottom: '60px'
    }
  },
  searchHeader: {
    padding: '15px 20px',
    display: 'flex',
    borderBottom: `1px solid ${palette.gray.light3}`,
    justifyContent: 'center',
    alignItems: 'center',
    background: palette.gray.light0
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
    alignItems: 'center'
  },
  resultsSelected: {
    marginRight: '10px',
    display: 'flex',
    alignItems: 'center'
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
  avatarContent: {
    margin: 5,
    padding: 0
  },
  avatar: {
    background: palette.gray.light3,
    color: palette.gray.medium3
  },
  content: {
    flexGrow: 1,
    padding: '25px 30px',
    background: palette.gray.light0
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
  optionIcon: {
    color: palette.gray.medium3,
    marginRight: '5px'
  },
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
  loadingPermissions: {
    id: 'search.loadingPermissions',
    defaultMessage: 'Loading...'
  }
});

interface CardMenuOption {
  name: string;
  icon?: ElementType<any>;

  onClick(...params: any): any;
}

interface SearchProps {
  history: History;
  location: Location;
  mode: string;
  siteId: string;
  previewAppBaseUri: string;

  onEdit(path: string, refreshSearch: any, readonly: boolean): any;

  onDelete(path: string, refreshSearch: any): any;

  onPreview(url: string): any;

  onSelect(path: string, selected: boolean): any;

  onGetUserPermissions(path: string): any;
}

function Search(props: SearchProps) {
  const classes = useStyles({});
  const { current: refs } = useRef<any>({});
  const { history, location, onEdit, onDelete, onPreview, onSelect, onGetUserPermissions, mode, siteId, previewAppBaseUri } = props;
  const queryParams = useMemo(() => queryString.parse(location.search), [location.search]);
  const searchParameters = useMemo(() => setSearchParameters(initialSearchParameters, queryParams), [queryParams]);
  const [keyword, setKeyword] = useState(queryParams['keywords'] || '');
  const [currentView, setCurrentView] = useState('grid');
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState({
    url: null,
    type: null,
    name: null,
    open: false,
    data: null
  });
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const { formatMessage } = useIntl();
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [optionsPermissions, setOptionsPermissions] = useState<any>(formatMessage(messages.loadingPermissions));

  refs.createQueryString = createQueryString;

  setRequestForgeryToken();

  useEffect(() => {
    search(siteId, searchParameters).subscribe(
      (result) => {
        setSearchResults(result);
      },
      ({ response }) => {
        if (response) {
          setApiState({ error: true, errorResponse: response.response });
        }
      }
    );
    return () => setApiState({ error: false, errorResponse: null });
  }, [searchParameters, siteId]);

  useEffect(() => {
    const subscription = onSearch$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((keywords: string) => {
      if (!keywords) keywords = undefined;
      let qs = refs.createQueryString({ name: 'keywords', value: keywords });
      history.push({
        pathname: '/',
        search: `?${qs}`
      });
    });
    return () => subscription.unsubscribe();
  }, [history, onSearch$, refs]);

  function renderMediaCards(items: [MediaItem], currentView: string) {
    if (items.length > 0) {
      return items.map((item: MediaItem, i: number) => {
        return (
          (currentView === 'grid') ? (
            <Grid key={i} item xs={12} sm={6} md={4} lg={3} xl={2}>
              <MediaCard
                item={item}
                onEdit={handleEdit}
                onPreview={handlePreview}
                onPreviewAsset={handlePreviewAsset}
                onSelect={handleSelect}
                selected={selected}
                previewAppBaseUri={previewAppBaseUri}
                onHeaderButtonClick={handleHeaderButtonClick}
              />
            </Grid>
          ) : (
            <Grid key={i} item xs={12}>
              <MediaCard
                item={item}
                isList={true}
                onEdit={handleEdit}
                onPreview={handlePreview}
                onPreviewAsset={handlePreviewAsset}
                onSelect={handleSelect}
                classes={{
                  root: classes.mediaCardListRoot,
                  checkbox: classes.mediaCardListCheckbox,
                  header: classes.mediaCardListHeader,
                  media: classes.mediaCardListMedia,
                  mediaIcon: classes.mediaCardListMediaIcon
                }}
                selected={selected}
                previewAppBaseUri={previewAppBaseUri}
                onHeaderButtonClick={handleHeaderButtonClick}
              />
            </Grid>
          )
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
      if (filter.name === 'sortBy' && (queryParams['sortBy'] === '_score' || queryParams['sortBy'] === undefined) && filter.value !== '_score') {
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
            min: (range[0] !== 'null') ? range[0] : null,
            max: (range[1] !== 'null') ? range[1] : null
          };
        } else if (formatParameters.filters[key].includes('TO')) {
          let range = formatParameters.filters[key].split('TO');
          formatParameters.filters[key] = {
            min: (range[0] !== '-Infinity' && range[0] !== '') ? range[0] : null,
            max: (range[1] !== 'Infinity' && range[1] !== '') ? range[1] : null
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

  function refreshSearch() {
    search(siteId, searchParameters).subscribe(
      (result) => {
        setSearchResults(result);
      },
      ({ response }) => {
        if (response) {
          setApiState({ error: true, errorResponse: response });
        }
      }
    );
  }

  function handleEdit(path: string, readonly: boolean = false) {
    onEdit(path, refreshSearch, readonly);
  }

  function handlePreview(url: string) {
    onPreview(url);
  }

  function handlePreviewAsset(url: string, type: string, name: string) {
    if (type === 'Template' || type === 'Groovy') {
      getContent(siteId, url).subscribe(
        (response) => {
          setPreview({ url, open: true, type, name, data: response });
        }
      );
    } else {
      setPreview({ url, open: true, type, name, data: null });
    }
  }

  function handleClosePreview() {
    setPreview({ ...preview, url: null, open: false, type: null, name: null, data: null });
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
    onSelect(path, isSelected);
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      let selectedItems: any[] = [];
      searchResults.items.forEach((item: any) => {
        if (selected.indexOf(item.path) === -1) {
          selectedItems.push(item.path);
          onSelect(item.path, true);
        }
      });
      setSelected([...selected, ...selectedItems]);
    } else {
      let newSelectedItems = [...selected];
      searchResults.items.forEach((item: any) => {
        let index = newSelectedItems.indexOf(item.path);
        if (index >= 0) {
          newSelectedItems.splice(index, 1);
          onSelect(item.path, false);
        }
      });
      setSelected(newSelectedItems);
    }
  }

  function handleClearSelected() {
    selected.forEach(path => {
      onSelect(path, false);
    });
    setSelected([]);
  }

  function areAllSelected() {
    if (!searchResults || searchResults.items.length === 0) return false;
    return !searchResults.items.some((item: any) => !selected.includes(item.path));
  }

  function renderPreview(preview: Preview) {
    switch (preview.type) {
      case 'Image':
        return <img src={preview.url} alt='' />;
      case 'Video':
        return (
          <AsyncVideoPlayer
            playerOptions={{ src: preview.url, autoplay: true }}
            nonPlayableMessage={formatMessage(messages.videoProcessed)}
          />);
      case 'Page':
        return (
          <IFrame
            url={getPreviewURLFromPath(previewAppBaseUri, preview.url)}
            name={preview.name}
            width={960}
            height={600}
          />);
      case 'Template':
        return <Editor mode={'ace/mode/html'} data={preview.data} />;
      case 'Groovy':
        return <Editor mode={'ace/mode/java'} data={preview.data} />;
      default:
        break;
    }
  }

  function handleHeaderButtonClick(event: any, item: MediaItem) {
    setAnchorEl(event.target);
    onGetUserPermissions(item.path).then(
      ({ permissions }) => {
        let options = [];
        let editable = isEditableAsset(item.path);
        let isWriteAllowed = permissions.includes('write') || false;
        let isDeleteAllowed = permissions.includes('delete') || false;
        if (editable && isWriteAllowed) {
          options.push(
            {
              name: 'Edit',
              onClick: () => onEdit(item.path, refreshSearch, false),
              icon: EditIcon
            }
          );
        }
        if (isDeleteAllowed && mode === 'default') {
          options.push(
            {
              name: 'Delete',
              onClick: () => onDelete(item.path, refreshSearch),
              icon: DeleteIcon
            }
          );
        }
        setOptionsPermissions(options.length ? options : formatMessage(messages.noPermissions));
      },
      () => {
        setOptionsPermissions(formatMessage(messages.noPermissions));
      }
    );
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  return (
    <section
      className={
        clsx(classes.wrapper, {
          'hasContent': (searchResults && searchResults.total),
          'select': mode === 'select'
        })}
    >
      <header className={classes.searchHeader}>
        <div className={classes.search}>
          <SearchBar
            onChange={handleSearchKeyword}
            keyword={keyword}
            showActionButton={Boolean(keyword)}
            showDecoratorIcon
          />
        </div>
        <div className={classes.helperContainer}>
          {
            searchResults && searchResults.facets &&
            <FilterSearchDropdown
              text={'Filters'}
              className={classes.searchDropdown}
              facets={searchResults.facets}
              handleFilterChange={handleFilterChange}
              queryParams={queryParams}
            />
          }
          <IconButton className={classes.avatarContent} onClick={handleChangeView}>
            <Avatar className={classes.avatar}>
              {
                currentView === 'grid'
                  ? <ViewListIcon />
                  : <AppsIcon />
              }
            </Avatar>
          </IconButton>
        </div>
      </header>
      {
        (searchResults && !!searchResults.total) &&
        <div className={classes.searchHelperBar}>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox
                color="primary" checked={areAllSelected()}
                onClick={(e: any) => handleSelectAll(e.target.checked)}
              />}
              label={formatMessage(messages.selectAll)}
            />
          </FormGroup>
          {
            (selected.length > 0) &&
            <Typography variant="body2" className={classes.resultsSelected} color={'textSecondary'}>
              {formatMessage(messages.resultsSelected, {
                count: selected.length,
                total: searchResults.total
              })}
              <HighlightOffIcon className={classes.clearSelected} onClick={handleClearSelected} />
            </Typography>
          }
          <TablePagination
            rowsPerPageOptions={[9, 15, 21]}
            className={classes.pagination}
            component="div"
            labelRowsPerPage={formatMessage(messages.itemsPerPage)}
            count={searchResults.total}
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
          />
        </div>
      }
      <section className={classes.content}>
        {
          apiState.error ?
            <ErrorState error={apiState.errorResponse} />
            :
            (
              <Grid container spacing={3} className={searchResults?.items.length === 0 ? classes.empty : ''}>
                {
                  searchResults === null
                    ? <Spinner background="inherit" />
                    : renderMediaCards(searchResults.items, currentView)
                }
              </Grid>
            )
        }
      </section>
      <Dialog onClose={handleClosePreview} aria-labelledby="preview" open={preview.open} maxWidth='md'>
        <DialogHeader title={preview.name} onDismiss={handleClosePreview}/>
        <div className={classes.mediaPreview}>
          {renderPreview(preview)}
        </div>
      </Dialog>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {
          Array.isArray(optionsPermissions) ? (
            optionsPermissions.map((option: CardMenuOption, i: number) => {
              let Icon = option.icon;
              return (
                <MenuItem
                  key={i}
                  onClick={() => {
                    handleMenuClose();
                    option.onClick();
                  }}
                >
                  {
                    Icon && <Icon className={classes.optionIcon} />
                  }
                  {option.name}
                </MenuItem>
              );
            })
          ) : (
            <MenuItem>{optionsPermissions}</MenuItem>
          )
        }
      </Menu>
    </section>
  );
}

export default Search;
