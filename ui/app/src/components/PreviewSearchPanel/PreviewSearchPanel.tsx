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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import List from '@mui/material/List';
import SearchBar from '../SearchBar/SearchBar';
import { ComponentsContentTypeParams, ElasticParams, SearchItem } from '../../models/Search';
import { DraggablePanelListItem } from '../DraggablePanelListItem/DraggablePanelListItem';
import { getHostToGuestBus } from '../../utils/subjects';
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
import { createLookupTable, nou } from '../../utils/object';
import { fetchContentInstance } from '../../services/content';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { useDispatch } from 'react-redux';
import { useSelection } from '../../hooks/useSelection';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useContentTypeList } from '../../hooks/useContentTypeList';
import { useMount } from '../../hooks/useMount';
import { useDebouncedInput } from '../../hooks/useDebouncedInput';
import { useSpreadState } from '../../hooks/useSpreadState';
import { useSubject } from '../../hooks/useSubject';
import Pagination from '../Pagination';
import { getFileNameFromPath } from '../../utils/path';
import { makeStyles } from 'tss-react/mui';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { ErrorBoundary } from '../ErrorBoundary';
import FormHelperText from '@mui/material/FormHelperText';
import LookupTable from '../../models/LookupTable';
import HourglassEmptyRounded from '@mui/icons-material/HourglassEmptyRounded';
import Alert from '@mui/material/Alert';

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
  },
  noResults: {
    id: 'previewSearchPanel.noResults',
    defaultMessage: 'No results found'
  }
});

const useStyles = makeStyles()((theme) => ({
  searchContainer: {
    padding: `${theme.spacing(1)} ${theme.spacing(1)} 0`
  }
}));

interface SearchResultsProps {
  items: SearchItem[];
  contentInstanceLookup: LookupTable<ContentInstance>;
  onDragStart(item: SearchItem): void;
  onDragEnd(item: SearchItem): void;
}

function SearchResults(props: SearchResultsProps) {
  const { items, contentInstanceLookup, onDragStart, onDragEnd } = props;
  return (
    <List>
      {items.map((item: SearchItem) => (
        <DraggablePanelListItem
          key={item.path}
          primaryText={item.name ?? getFileNameFromPath(item.path)}
          avatarSrc={item.type === 'Image' ? item.path : null}
          avatarColorBase={contentInstanceLookup[item.path]?.craftercms.contentTypeId}
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

export function PreviewSearchPanel() {
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState<ApiResponse>(null);
  const site = useActiveSiteId();
  const hostToGuest$ = getHostToGuestBus();
  const [state, setState] = useSpreadState({
    isFetching: null,
    contentInstanceLookup: null,
    limit: 10,
    items: null,
    count: null
  });
  const dispatch = useDispatch();
  const editMode = useSelection((state) => state.preview.editMode);
  const allowedTypesData = useSelection((state) => state.preview.guest?.allowedContentTypes);
  const awaitingGuestCheckIn = nou(allowedTypesData);
  const contentTypes = useContentTypeList(
    (contentType) => contentType.id !== '/component/level-descriptor' && contentType.type === 'component'
  );
  const contentTypesLookup = useMemo(
    () => (contentTypes ? createLookupTable(contentTypes, 'id') : null),
    [contentTypes]
  );

  const unMount$ = useSubject<void>();
  const [pageNumber, setPageNumber] = useState(0);

  const onSearch = useCallback(
    (keywords: string = '', options?: ComponentsContentTypeParams) => {
      setState({ isFetching: true });
      setError(null);
      if (allowedTypesData) {
        // If there are no allowed types, an empty array causes the request to return everything. So we send an array
        // with an empty string to filter out all content-types.
        const allowedTypes = Object.keys(allowedTypesData).length
          ? Object.entries(allowedTypesData)
              .filter(([, type]) => type.shared)
              .map(([key]) => key)
          : [''];

        search(site, {
          ...initialSearchParameters,
          keywords,
          ...options,
          filters: { 'content-type': allowedTypes, 'mime-type': mimeTypes }
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
                  count: response.result.total,
                  limit: options?.limit ?? initialSearchParameters.limit
                });
              } else {
                setState({
                  isFetching: false,
                  items: response.result.items,
                  count: response.result.total,
                  limit: options?.limit ?? initialSearchParameters.limit
                });
              }
            },
            error: ({ response }) => {
              setError(response.response);
            }
          });
      }
    },
    [setState, site, unMount$, contentTypesLookup, allowedTypesData]
  );

  useMount(() => {
    return () => {
      unMount$.next();
      unMount$.complete();
    };
  });

  useEffect(() => {
    if (contentTypes && contentTypesLookup && !awaitingGuestCheckIn) {
      onSearch();
    }
  }, [contentTypes, contentTypesLookup, onSearch, awaitingGuestCheckIn]);

  const onSearch$ = useDebouncedInput(onSearch, 400);

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  function onPageChanged(page: number) {
    onSearch(keyword, {
      offset: page * state.limit,
      limit: state.limit
    });
  }

  function onRowsPerPageChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    onSearch(keyword, {
      offset: 0,
      limit: Number(e.target.value)
    });
  }

  const onDragStart = (item: SearchItem) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    if (item.type === 'Component') {
      const instance: ContentInstance = state.contentInstanceLookup[item.path];
      hostToGuest$.next(
        componentInstanceDragStarted({
          instance,
          contentType: contentTypesLookup[instance.craftercms.contentTypeId]
        })
      );
    } else {
      hostToGuest$.next(assetDragStarted({ asset: item }));
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
      {state.items && !error && (
        <Pagination
          count={state.count}
          rowsPerPage={state.limit}
          page={pageNumber}
          onPageChange={(e, page: number) => onPageChanged(page)}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
      {awaitingGuestCheckIn ? (
        <Alert severity="info" variant="outlined" icon={<HourglassEmptyRounded />} sx={{ border: 0 }}>
          <FormattedMessage defaultMessage="Waiting for the preview application to load." />
        </Alert>
      ) : (
        <ErrorBoundary>
          {error ? (
            <ApiResponseErrorState error={error} />
          ) : state.isFetching ? (
            <LoadingState />
          ) : state.items && state.items.length ? (
            <SearchResults
              items={state.items}
              contentInstanceLookup={state.contentInstanceLookup ?? {}}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ) : state.items && state.items.length === 0 ? (
            <EmptyState title={formatMessage(translations.noResults)} />
          ) : (
            <></>
          )}
        </ErrorBoundary>
      )}
      <FormHelperText
        sx={{
          margin: '10px 16px',
          pt: 1,
          textAlign: 'center',
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <FormattedMessage defaultMessage="Only shared instances and assets are shown here" />
      </FormHelperText>
    </>
  );
}

export default PreviewSearchPanel;
