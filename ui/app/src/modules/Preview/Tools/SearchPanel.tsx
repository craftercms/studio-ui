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

import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import makeStyles from '@material-ui/styles/makeStyles';
import List from '@material-ui/core/List';
import ToolPanel from './ToolPanel';
import {
  useActiveSiteId,
  useDebouncedInput,
  useLogicResource,
  useMount
} from '../../../utils/hooks';
import SearchBar from '../../../components/Controls/SearchBar';
import {
  ComponentsContentTypeParams,
  ContentInstancePage,
  ElasticParams,
  MediaItem,
  SearchItem,
  SearchResult
} from '../../../models/Search';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { DraggablePanelListItem } from './DraggablePanelListItem';
import TablePagination from '@material-ui/core/TablePagination';
import { getHostToGuestBus } from '../previewContext';
import {
  ASSET_DRAG_ENDED,
  ASSET_DRAG_STARTED,
  COMPONENT_INSTANCE_DRAG_ENDED,
  COMPONENT_INSTANCE_DRAG_STARTED
} from '../../../state/actions/preview';
// import { createLookupTable } from '../../../utils/object';
import ContentInstance from '../../../models/ContentInstance';
import { search } from '../../../services/search';
import { ApiResponse } from '../../../models/ApiResponse';

const translations = defineMessages({
  title: {
    id: 'previewSearchTool.title',
    defaultMessage: 'Search Everywhere'
  },
  titleKeyword: {
    id: 'previewSearchTool.titleKeyword',
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

const useStyles = makeStyles(() => ({
  searchContainer: {
    padding: '16px'
  },
  paginationContainer: {
    padding: '0 16px'
  },
  searchResultsList: {
    padding: '0',
    '& li:first-child': {
      paddingTop: 0
    }
  },
  pagination: {
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
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
    padding: 0,
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '12px',
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
  const hostToGuest$ = getHostToGuestBus();

  const onDragStart = (item: ContentInstance | MediaItem) => {
    hostToGuest$.next({
      type: item['craftercms'] ? COMPONENT_INSTANCE_DRAG_STARTED : ASSET_DRAG_STARTED,
      payload: item
    });
  };

  const onDragEnd = (item: ContentInstance | MediaItem) => {
    hostToGuest$.next({
      type: item['craftercms'] ? COMPONENT_INSTANCE_DRAG_ENDED : ASSET_DRAG_ENDED
    });
  };

  return (
    <List className={classes.searchResultsList}>
      {items.map((item: ContentInstance | MediaItem) => (
        <DraggablePanelListItem
          key={item['craftercms']?.id || item.path}
          primaryText={item['craftercms']?.label || item.name}
          avatarSrc={item.path}
          onDragStart={() => onDragStart(item)}
          onDragEnd={() => onDragEnd(item)}
        />
      ))}
    </List>
  );
}

const initialSearchParameters: Partial<ElasticParams> = {
  keywords: '',
  offset: 0,
  limit: 10
  // sortBy: '_score',
  // sortOrder: 'desc',
  //filters: {}
};

const mimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'image/svg+xml'];

export default function SearchPanel() {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState<ApiResponse>(null);
  const site = useActiveSiteId();
  const [searchResults, setSearchResults] = useState<ContentInstancePage | SearchResult>(null);
  // TODO: Components
  //const contentTypes = useContentTypeList((contentType) => contentType.type === 'component');
  // const contentTypesIds = contentTypes?.map(item => item.id);
  // const contentTypesLookup = createLookupTable(contentTypes, 'id');
  const [pageNumber, setPageNumber] = useState(0);

  const resource = useLogicResource<
    Array<ContentInstance | SearchItem>,
    ContentInstancePage | SearchResult
  >(searchResults, {
    shouldResolve: (data) => Boolean(data),
    shouldReject: () => Boolean(error),
    shouldRenew: (data, resourceArg) => resourceArg.complete,
    // TODO: Components
    // resultSelector: (data) => Object.values(data.lookup).filter(item => contentTypesIds.includes(item.craftercms.contentType)),
    // @ts-ignore TODO: Remove ts-ignore
    resultSelector: (data) => data.items,
    errorSelector: () => error
  });

  useMount(() => {
    onSearch();
  });

  const onSearch = useCallback(
    (keywords: string = '', options?: ComponentsContentTypeParams) => {
      // TODO: Components
      // getContentByContentType(site, contentTypesIds, contentTypesLookup, {
      //   ...initialSearchParameters,
      //   keywords,
      //   ...options,
      //   type: 'Component'
      // }).subscribe(
      //   (result) => {
      //     setSearchResults(result);
      //   },
      //   ({ response }) => {
      //     setError(response);
      //   }
      // )
      search(site, {
        ...initialSearchParameters,
        keywords,
        ...options,
        // TODO: Use this when api support OR operator
        //filters: { 'content-type': contentTypes?.map(item => item.id), 'mime-type': mimeTypes }
        filters: { 'mime-type': mimeTypes }
      }).subscribe(
        (result) => {
          setSearchResults(result);
        },
        ({ response }) => {
          setError(response);
        }
      );
    },
    [site]
  );

  const onSearch$ = useDebouncedInput(onSearch, 400);

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  function onPageChanged(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, page: number) {
    setPageNumber(page);
    onSearch(keyword, {
      offset: page * initialSearchParameters.limit,
      limit: initialSearchParameters.limit
    });
  }

  return (
    <ToolPanel
      title={
        keyword
          ? formatMessage(translations.titleKeyword, { keyword: keyword })
          : formatMessage(translations.title)
      }
    >
      <div className={classes.searchContainer}>
        <SearchBar
          keyword={keyword}
          placeholder="Search everywhere..."
          onChange={(keyword) => handleSearchKeyword(keyword)}
          showDecoratorIcon={true}
          showActionButton={Boolean(keyword)}
        />
      </div>
      {searchResults && (
        <div className={classes.paginationContainer}>
          <TablePagination
            className={classes.pagination}
            classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
            component="div"
            labelRowsPerPage=""
            count={searchResults['count'] || searchResults['total']}
            rowsPerPage={initialSearchParameters.limit}
            page={pageNumber}
            backIconButtonProps={{
              'aria-label': formatMessage(translations.previousPage),
              'size': 'small'
            }}
            nextIconButtonProps={{
              'aria-label': formatMessage(translations.nextPage),
              'size': 'small'
            }}
            onChangePage={(e: React.MouseEvent<HTMLButtonElement>, page: number) =>
              onPageChanged(e, page)
            }
          />
        </div>
      )}
      <SuspenseWithEmptyState
        resource={resource}
        withEmptyStateProps={{
          isEmpty: (items: Array<ContentInstance>) => !Boolean(items.length)
        }}
      >
        <SearchResults resource={resource} />
      </SuspenseWithEmptyState>
    </ToolPanel>
  );
}
