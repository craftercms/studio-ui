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
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import AppsIcon from '@material-ui/icons/Apps';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import MediaCard from '../../components/MediaCard';
import { search } from '../../services/search';
import { setRequestForgeryToken } from '../../utils/auth';
import { ElasticParams, Filter, MediaItem } from '../../models/Search';
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
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import clsx from 'clsx';
import { History, Location } from 'history';
import { fetchWorkflowAffectedItems, getContentXML } from '../../services/content';
import SearchBar from '../../components/Controls/SearchBar';
import palette from '../../styles/palette';
import {
  closeDeleteDialog,
  deleteDialogClosed,
  showCodeEditorDialog,
  showDeleteDialog,
  showEditDialog,
  showPreviewDialog,
  showWorkflowCancellationDialog,
  updatePreviewDialog
} from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, useLogicResource, usePermissions, useSelection } from '../../utils/hooks';
import { fetchUserPermissions } from '../../state/actions/content';
import { Resource } from '../../models/Resource';
import { LookupTable } from '../../models/LookupTable';
import createStyles from '@material-ui/styles/createStyles';
import { Loader } from '../../components/ItemMenu/ItemMenu';
import { isEditableAsset } from '../../utils/content';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { batchActions, dispatchDOMEvent } from '../../state/actions/misc';
import { getStoredPreviewChoice } from '../../utils/state';
import { getPreviewURLFromPath } from '../../utils/path';

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

const loaderStyles = makeStyles(() =>
  createStyles({
    loadingWrapper: {
      width: '75px',
      padding: '0px 15px'
    }
  })
);

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
    defaultMessage:
      'Video is being processed, preview will be available when processing is complete'
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
  }
});

interface SearchProps {
  history: History;
  location: Location;
  mode?: string;
  onSelect(path: string, selected: boolean): any;
}

export default function Search(props: SearchProps) {
  const classes = useStyles({});
  const { current: refs } = useRef<any>({});
  const { history, location, mode = 'default', onSelect } = props;
  const queryParams = useMemo(() => queryString.parse(location.search), [location.search]);
  const searchParameters = useMemo(
    () => setSearchParameters(initialSearchParameters, queryParams),
    [queryParams]
  );
  const [keyword, setKeyword] = useState(queryParams['keywords'] || '');
  const [currentView, setCurrentView] = useState('grid');
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState([]);
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const site = useActiveSiteId();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const guestBase = useSelection<string>((state) => state.env.guestBase);
  const legacyFormSrc = `${authoringBase}/legacy/form?`;
  const permissions = usePermissions();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });
  const [simpleMenu, setSimpleMenu] = useState<{ item: MediaItem; anchorEl: Element }>({
    item: null,
    anchorEl: null
  });

  refs.createQueryString = createQueryString;

  setRequestForgeryToken();

  useEffect(() => {
    search(site, searchParameters).subscribe(
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
  }, [searchParameters, site]);

  useEffect(() => {
    const subscription = onSearch$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((keywords: string) => {
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
        return currentView === 'grid' ? (
          <Grid key={i} item xs={12} sm={6} md={4} lg={3} xl={2}>
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
      return (
        <EmptyState
          title={formatMessage(messages.noResults)}
          subtitle={formatMessage(messages.changeQuery)}
        />
      );
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
      if (
        filter.name === 'sortBy' &&
        (queryParams['sortBy'] === '_score' || queryParams['sortBy'] === undefined) &&
        filter.value !== '_score'
      ) {
        newFilters = { ...queryParams, [filter.name]: filter.value, sortOrder: 'asc' };
      } else if (
        filter.name === 'sortBy' &&
        queryParams['sortBy'] !== '_score' &&
        filter.value === '_score'
      ) {
        newFilters = { ...queryParams, [filter.name]: filter.value, sortOrder: 'desc' };
      } else {
        newFilters = { ...queryParams, [filter.name]: filter.value };
      }
    }
    return queryString.stringify(newFilters);
  }

  function setSearchParameters(
    initialSearchParameters: ElasticParams,
    queryParams: Partial<ElasticParams>
  ) {
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

  function handleChangePage(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number
  ) {
    let offset = newPage * searchParameters.limit;
    let qs = refs.createQueryString({ name: 'offset', value: offset });
    history.push({
      pathname: '/',
      search: `?${qs}`
    });
  }

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    let qs = refs.createQueryString({ name: 'limit', value: parseInt(event.target.value, 10) });
    history.push({
      pathname: '/',
      search: `?${qs}`
    });
  }

  function refreshSearch() {
    search(site, searchParameters).subscribe(
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
    selected.forEach((path) => {
      onSelect(path, false);
    });
    setSelected([]);
  }

  function areAllSelected() {
    if (!searchResults || searchResults.items.length === 0) return false;
    return !searchResults.items.some((item: any) => !selected.includes(item.path));
  }

  const onHeaderButtonClick = (event: any, item: MediaItem) => {
    dispatch(fetchUserPermissions({ path: item.path }));
    setSimpleMenu({
      item,
      anchorEl: event.currentTarget
    });
  };

  const onNavigate = (item: MediaItem) => {
    if (item.path) {
      let previewBase = getStoredPreviewChoice(site) === '2' ? 'next/preview' : 'preview';
      window.location.href = `${authoringBase}/${previewBase}#/?page=${getPreviewURLFromPath(
        item.path
      )}&site=${site}`;
    }
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

  const onEdit = (item: MediaItem) => {
    if (item.type === 'Page' || item.type === 'Taxonomy' || item.type === 'Component') {
      const src = `${legacyFormSrc}site=${site}&path=${item.path}&type=form`;
      fetchWorkflowAffectedItems(site, item.path).subscribe((items) => {
        if (items?.length > 0) {
          dispatch(
            showWorkflowCancellationDialog({
              items,
              onContinue: showEditDialog({ src })
            })
          );
        } else {
          dispatch(showEditDialog({ src }));
        }
      });
    } else {
      let src = `${legacyFormSrc}site=${site}&path=${item.path}&type=asset`;
      dispatch(showCodeEditorDialog({ src }));
    }
  };

  const onDelete = (item: MediaItem) => {
    const idDialogSuccess = 'deleteDialogSuccess';
    const idDialogCancel = 'deleteDialogCancel';
    dispatch(
      showDeleteDialog({
        items: [item],
        onSuccess: batchActions([
          dispatchDOMEvent({
            id: idDialogSuccess
          }),
          closeDeleteDialog()
        ]),
        onClosed: batchActions([dispatchDOMEvent({ id: idDialogCancel }), deleteDialogClosed()])
      })
    );

    let unsubscribe, cancelUnsubscribe;

    unsubscribe = createCallbackListener(idDialogSuccess, function() {
      refreshSearch();
      cancelUnsubscribe();
    });

    cancelUnsubscribe = createCallbackListener(idDialogCancel, function() {
      refreshSearch();
      unsubscribe();
    });
  };

  const onMenuClose = () => {
    setSimpleMenu({
      item: null,
      anchorEl: null
    });
  };

  return (
    <section
      className={clsx(classes.wrapper, {
        hasContent: searchResults && searchResults.total,
        select: mode === 'select'
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
          {searchResults && searchResults.facets && (
            <FilterSearchDropdown
              mode={mode}
              text={'Filters'}
              className={classes.searchDropdown}
              facets={searchResults.facets}
              handleFilterChange={handleFilterChange}
              queryParams={queryParams}
            />
          )}
          <IconButton className={classes.avatarContent} onClick={handleChangeView}>
            <Avatar className={classes.avatar}>
              {currentView === 'grid' ? <ViewListIcon /> : <AppsIcon />}
            </Avatar>
          </IconButton>
        </div>
      </header>
      {searchResults && !!searchResults.total && (
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
              label={formatMessage(messages.selectAll)}
            />
          </FormGroup>
          {selected.length > 0 && (
            <Typography variant="body2" className={classes.resultsSelected} color={'textSecondary'}>
              {formatMessage(messages.resultsSelected, {
                count: selected.length,
                total: searchResults.total
              })}
              <HighlightOffIcon className={classes.clearSelected} onClick={handleClearSelected} />
            </Typography>
          )}
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
      )}
      <section className={classes.content}>
        {apiState.error ? (
          <ErrorState error={apiState.errorResponse} />
        ) : (
          <Grid
            container
            spacing={3}
            className={searchResults?.items.length === 0 ? classes.empty : ''}
          >
            {searchResults === null ? (
              <Spinner background="inherit" />
            ) : (
              renderMediaCards(searchResults.items, currentView)
            )}
          </Grid>
        )}
      </section>
      {simpleMenu.item?.path && (
        <SimpleMenu
          permissions={permissions?.[simpleMenu.item.path]}
          item={simpleMenu.item}
          anchorEl={simpleMenu.anchorEl}
          onClose={onMenuClose}
          onNavigate={onNavigate}
          onEdit={onEdit}
          onDelete={onDelete}
          messages={{
            edit: formatMessage(messages.edit),
            delete: formatMessage(messages.delete),
            preview: formatMessage(messages.preview),
            noPermissions: formatMessage(messages.noPermissions)
          }}
        />
      )}
    </section>
  );
}

interface SimpleMenuProps {
  permissions: LookupTable<boolean>;
  item: MediaItem;
  anchorEl: Element;
  messages: {
    delete: string;
    edit: string;
    preview: string;
    noPermissions: string;
  };
  onClose(): void;
  onNavigate(item: MediaItem): void;
  onEdit(item: MediaItem): void;
  onDelete(item: MediaItem): void;
}

interface SimpleMenuUIProps {
  resource: Resource<LookupTable<boolean>>;
  messages: {
    delete: string;
    edit: string;
    preview: string;
    noPermissions: string;
  };
  onClose(): void;
  onNavigate(): void;
  onEdit(): void;
  onDelete(): void;
}

function SimpleMenu(props: SimpleMenuProps) {
  const classes = loaderStyles({});
  const resource = useLogicResource<LookupTable<boolean>, LookupTable<boolean>>(props.permissions, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => ({
      ...source,
      editable: isEditableAsset(props.item.path),
      preview: props.item.type === 'Page'
    }),
    errorSelector: (source) => null
  });

  return (
    <Menu anchorEl={props.anchorEl} open={Boolean(props.anchorEl)} onClose={props.onClose}>
      <Suspense
        fallback={
          <div className={classes.loadingWrapper}>
            <Loader
              numOfItems={props.item.type === 'Image' ? 1 : props.item.type === 'Page' ? 3 : 2}
            />
          </div>
        }
      >
        <SimpleMenuUI
          resource={resource}
          messages={props.messages}
          onClose={props.onClose}
          onNavigate={() => props.onNavigate(props.item)}
          onEdit={() => props.onEdit(props.item)}
          onDelete={() => props.onDelete(props.item)}
        />
      </Suspense>
    </Menu>
  );
}

function SimpleMenuUI(props: SimpleMenuUIProps) {
  const { resource, onEdit, onClose, onDelete, messages, onNavigate } = props;
  const permissions = resource.read();
  const editable = permissions.editable;
  const preview = permissions.preview;
  const isWriteAllowed = permissions.write;
  const isDeleteAllowed = permissions.delete;
  return (
    <>
      {editable && isWriteAllowed && (
        <MenuItem
          onClick={() => {
            onClose();
            onEdit();
          }}
        >
          {messages.edit}
        </MenuItem>
      )}
      {isDeleteAllowed && (
        <MenuItem
          onClick={() => {
            onClose();
            onDelete();
          }}
        >
          {messages.delete}
        </MenuItem>
      )}
      {preview && (
        <MenuItem
          onClick={() => {
            onNavigate();
          }}
        >
          {messages.preview}
        </MenuItem>
      )}
      {!isWriteAllowed && !isDeleteAllowed && (
        <MenuItem onClick={onClose}>{messages.noPermissions}</MenuItem>
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
