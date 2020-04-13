import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import makeStyles from '@material-ui/styles/makeStyles';
import { Theme } from '@material-ui/core';
import List from '@material-ui/core/List';
import ToolPanel from './ToolPanel';
import {
  useActiveSiteId,
  useContentTypeList,
  useDebouncedInput,
  useOnMount,
  usePreviewState,
  useStateResource
} from '../../../utils/hooks';
import SearchBar from '../../../components/SearchBar';
import { APIError } from '../../../models/GlobalState';
import { search } from '../../../services/search';
import { ElasticParams, SearchItem, SearchResult } from '../../../models/Search';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { DraggablePanelListItem } from './DraggablePanelListItem';
import TablePagination from '@material-ui/core/TablePagination';
import { DRAWER_WIDTH } from '../previewContext';

const translations = defineMessages({
  title: {
    id: 'craftercms.ice.search.title',
    defaultMessage: 'Search Panel'
  },
  titleKeyword: {
    id: 'craftercms.ice.search.titleKeyword',
    defaultMessage: 'Search "{keyword}"'
  },
  previousPage: {
    id: 'pagination.previousPage',
    defaultMessage: 'Previous page'
  },
  nextPage: {
    id: 'pagination.nextPage',
    defaultMessage: 'Next page'
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  searchContainer: {
    padding: '16px'
  },
  searchResultsList: {
    padding: '0',
    '& li:first-child': {
      paddingTop: 0
    }
  },
  pagination: {
    'marginLeft': 'auto',
    'position': 'fixed',
    'zIndex': 1,
    'bottom': 0,
    'background': 'white',
    'color': 'black',
    'width': `calc(${DRAWER_WIDTH}px - 1px)`,
    'left': 0,
    'borderTop': '1px solid rgba(0, 0, 0, 0.12)',
    '& p': {
      padding: 0
    },
    '& svg': {
      top: 'inherit'
    },
    '& .hidden': {
      display: 'none'
    }
  },
  toolbar: {
    'padding': 0,
    'display': 'flex',
    'justifyContent': 'space-between',
    'paddingLeft': '20px',
    '& .MuiTablePagination-spacer': {
      display: 'none'
    },
    '& .MuiTablePagination-spacer + p': {
      display: 'none'
    }
  }
}));


function SearchResults(props) {
  const items = props.resource.read();
  const classes = useStyles({});
  return (
    <List className={classes.searchResultsList}>
      {items.map((item: SearchItem) => (
        <DraggablePanelListItem
          key={item.path}
          primaryText={item.name}
          avatarSrc={item.type === 'Image' ? item.path : null}
          onDragStart={() => {
          }}
          onDragEnd={() => {
          }}
        />
      ))}
    </List>
  )
}

const initialSearchParameters: ElasticParams = {
  query: '',
  keywords: '',
  offset: 0,
  limit: 10,
  sortBy: '_score',
  sortOrder: 'desc',
  filters: {}
};

const mimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'image/svg+xml'];

export default function SearchPanel(props: any) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { searchKeyword } = usePreviewState();
  const [keyword, setKeyword] = useState(searchKeyword || '');
  const [error, setError] = useState<APIError>(null);
  const site = useActiveSiteId();
  const [searchResults, setSearchResults] = useState<SearchResult>(null);
  const contentTypes = useContentTypeList();
  const [pageNumber, setPageNumber] = useState(0);

  const resource = useStateResource<Array<SearchItem>, SearchResult>(searchResults, {
    shouldResolve: (data) => Boolean(data),
    shouldReject: () => Boolean(error),
    shouldRenew: (data, resourceArg) => resourceArg.complete,
    resultSelector: (data) => data.items,
    errorSelector: () => error
  });

  useOnMount(() => {
    onSearch(searchKeyword);
  });

  const onSearch = useCallback((keywords: string, options?: Partial<ElasticParams>) => {
    search(site, {
      ...initialSearchParameters,
      keywords,
      ...options,
      //filters: { 'content-type': contentTypes?.map(item => item.id), 'mime-type': mimeTypes }
      filters: { 'content-type': contentTypes?.map(item => item.id) }
    }).subscribe(
      (result) => {
        setSearchResults(result);
      },
      ({ response }) => {
        setError(response);
      }
    );
  }, [contentTypes]);

  const onSearch$ = useDebouncedInput(onSearch, 400);

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  function onPageChanged(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, page: number) {
    setPageNumber(page);
    onSearch(keyword, { offset: page * initialSearchParameters.limit })
  }

  return (
    <ToolPanel
      title={keyword ? formatMessage(translations.titleKeyword, { keyword: keyword }) : formatMessage(translations.title)}
    >
      <div className={classes.searchContainer}>
        <SearchBar
          keyword={keyword}
          placeholder="Search everywhere..."
          onChange={(keyword) => handleSearchKeyword(keyword)}
          showActionButton={Boolean(keyword)}
        />
      </div>
      <SuspenseWithEmptyState
        resource={resource}
        withEmptyStateProps={{
          isEmpty: (items: Array<SearchItem>) => !Boolean(items.length)
        }}
      >
        <SearchResults resource={resource}/>
      </SuspenseWithEmptyState>
      {
        searchResults &&
        <TablePagination
          className={classes.pagination}
          classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
          component="div"
          labelRowsPerPage=""
          count={searchResults.total}
          rowsPerPage={initialSearchParameters.limit}
          page={pageNumber}
          backIconButtonProps={{
            'aria-label': formatMessage(translations.previousPage)
          }}
          nextIconButtonProps={{
            'aria-label': formatMessage(translations.nextPage)
          }}
          onChangePage={(e: React.MouseEvent<HTMLButtonElement>, page: number) =>
            onPageChanged(e, page)
          }
        />
      }
    </ToolPanel>
  )
}


