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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import List from '@mui/material/List';
import SearchBar from '../Controls/SearchBar';
import { ComponentsContentTypeParams, ElasticParams, SearchItem } from '../../models/Search';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { DraggablePanelListItem } from '../../modules/Preview/Tools/DraggablePanelListItem';
import TablePagination from '@mui/material/TablePagination';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import {
  assetDragEnded,
  assetDragStarted,
  componentInstanceDragEnded,
  componentInstanceDragStarted,
  setPreviewEditMode
} from '../../state/actions/preview';
import ContentInstance from '../../models/ContentInstance';
import { search } from '../../services/search';
import { ApiResponse } from '../../models/ApiResponse';
import { Resource } from '../../models/Resource';
import { createLookupTable } from '../../utils/object';
import { fetchContentInstance } from '../../services/content';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { useDispatch } from 'react-redux';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useContentTypeList } from '../../utils/hooks/useContentTypeList';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useMount } from '../../utils/hooks/useMount';
import { useDebouncedInput } from '../../utils/hooks/useDebouncedInput';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { useSubject } from '../../utils/hooks/useSubject';

const translations = defineMessages({
  previewSearchPanelTitle: {
    id: 'previewSearchPanel.title',
    defaultMessage: 'Search'
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

interface SearchResultsProps {
  resource: Resource<SearchItem[]>;
  onDragStart(item: SearchItem): void;
  onDragEnd(item: SearchItem): void;
}

function SearchResults(props: SearchResultsProps) {
  const { resource, onDragStart, onDragEnd } = props;
  const items = resource.read();
  const classes = useStyles({});

  return (
    <List className={classes.searchResultsList}>
      {items.map((item: SearchItem) => (
        <DraggablePanelListItem
          key={item.path}
          primaryText={item.name}
          avatarSrc={item.type === 'Image' ? item.path : null}
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
  limit: 10,
  orOperator: true
};

const mimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'image/svg+xml'];

export default function PreviewSearchPanel() {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState<ApiResponse>(null);
  const site = useActiveSiteId();
  const hostToGuest$ = getHostToGuestBus();
  const [state, setState] = useSpreadState({
    isFetching: null,
    contentInstanceLookup: null,
    items: null,
    count: null
  });
  const dispatch = useDispatch();
  const editMode = useSelection((state) => state.preview.editMode);
  const contentTypes = useContentTypeList(
    (contentType) => contentType.id !== '/component/level-descriptor' && contentType.type === 'component'
  );
  const contentTypesLookup = useMemo(
    () => (contentTypes ? createLookupTable(contentTypes, 'id') : null),
    [contentTypes]
  );

  const unMount$ = useSubject<void>();
  const [pageNumber, setPageNumber] = useState(0);

  const resource = useLogicResource<SearchItem[], { isFetching: Boolean; items: Array<SearchItem> }>(state, {
    shouldResolve: (data) => Boolean(data) && data.isFetching === false,
    shouldReject: () => Boolean(error),
    shouldRenew: (data, resourceArg) => data.isFetching && resourceArg.complete,
    resultSelector: (data) => data.items,
    errorSelector: () => error
  });

  const onSearch = useCallback(
    (keywords: string = '', options?: ComponentsContentTypeParams) => {
      setState({ isFetching: true });
      search(site, {
        ...initialSearchParameters,
        keywords,
        ...options,
        filters: { 'content-type': contentTypes?.map((item) => item.id), 'mime-type': mimeTypes }
      })
        .pipe(
          takeUntil(unMount$),
          switchMap((result) => {
            const requests: Array<Observable<ContentInstance>> = [];
            result.items.forEach((item) => {
              if (item.type === 'Component') {
                requests.push(fetchContentInstance(site, item.path, contentTypesLookup));
              }
            });
            return requests.length
              ? forkJoin(requests).pipe(map((contentInstances) => ({ contentInstances, result })))
              : of({ result, contentInstances: null });
          })
        )
        .subscribe({
          next: (response) => {
            setPageNumber(options ? options.offset / options.limit : 0);
            if (response.contentInstances) {
              setState({
                isFetching: false,
                items: response.result.items,
                contentInstanceLookup: createLookupTable(response.contentInstances, 'craftercms.path'),
                count: response.result.total
              });
            } else {
              setState({ isFetching: false, items: response.result.items, count: response.result.total });
            }
          },
          error: ({ response }) => {
            setError(response);
          }
        });
    },
    [setState, site, contentTypes, unMount$, contentTypesLookup]
  );

  useMount(() => {
    return () => {
      unMount$.next();
      unMount$.complete();
    };
  });

  useEffect(() => {
    if (contentTypes && contentTypesLookup) {
      onSearch();
    }
  }, [contentTypes, contentTypesLookup, onSearch]);

  const onSearch$ = useDebouncedInput(onSearch, 400);

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  function onPageChanged(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, page: number) {
    onSearch(keyword, {
      offset: page * initialSearchParameters.limit,
      limit: initialSearchParameters.limit
    });
  }

  const onDragStart = (item: SearchItem) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    if (item.type === 'Component') {
      const instance: ContentInstance = state.contentInstanceLookup[item.path];
      hostToGuest$.next({
        type: componentInstanceDragStarted.type,
        payload: { instance, contentType: contentTypesLookup[instance.craftercms.contentTypeId] }
      });
    } else {
      hostToGuest$.next({
        type: assetDragStarted.type,
        payload: item
      });
    }
  };

  const onDragEnd = (item: SearchItem) => {
    hostToGuest$.next({
      type: item.type === 'Component' ? componentInstanceDragEnded.type : assetDragEnded.type
    });
  };

  return (
    <>
      <div className={classes.searchContainer}>
        <SearchBar
          keyword={keyword}
          placeholder={formatMessage(translations.previewSearchPanelTitle)}
          onChange={(keyword) => handleSearchKeyword(keyword)}
          showDecoratorIcon={true}
          showActionButton={Boolean(keyword)}
        />
      </div>
      {state.items && (
        <div className={classes.paginationContainer}>
          <TablePagination
            className={classes.pagination}
            classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
            component="div"
            labelRowsPerPage=""
            count={state.count}
            rowsPerPage={initialSearchParameters.limit}
            page={pageNumber}
            backIconButtonProps={{
              'aria-label': formatMessage(translations.previousPage),
              size: 'small'
            }}
            nextIconButtonProps={{
              'aria-label': formatMessage(translations.nextPage),
              size: 'small'
            }}
            onPageChange={(e: React.MouseEvent<HTMLButtonElement>, page: number) => onPageChanged(e, page)}
          />
        </div>
      )}
      <SuspenseWithEmptyState resource={resource}>
        <SearchResults resource={resource} onDragStart={onDragStart} onDragEnd={onDragEnd} />
      </SuspenseWithEmptyState>
    </>
  );
}
