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

import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { PagedEntityState } from '../../models/GlobalState';
import { nnou, pluckProps } from '../../utils/object';
import { ErrorBoundary } from '../SystemStatus/ErrorBoundary';
import LoadingState from '../SystemStatus/LoadingState';
import ContentInstance from '../../models/ContentInstance';
import {
  componentInstanceDragEnded,
  componentInstanceDragStarted,
  fetchComponentsByContentType,
  setContentTypeFilter,
  setPreviewEditMode
} from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import SearchBar from '../Controls/SearchBar';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ContentType from '../../models/ContentType';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useSelectorResource } from '../../utils/hooks/useSelectorResource';
import { useDebouncedInput } from '../../utils/hooks/useDebouncedInput';
import translations from './translations';
import useStyles from './styles';
import PreviewBrowseComponentsPanelUI from './PreviewBrowseComponentsPanelUI';

interface ComponentResource {
  count: number;
  limit: number;
  pageNumber: number;
  contentTypeFilter: string;
  items: Array<ContentInstance>;
}

export default function PreviewBrowseComponentsPanel() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const initialKeyword = useSelection((state) => state.preview.components.query.keywords);
  const contentTypeFilter = useSelection((state) => state.preview.components.contentTypeFilter);
  const [keyword, setKeyword] = useState(initialKeyword);
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const editMode = useSelection((state) => state.preview.editMode);
  const contentTypes = contentTypesBranch.byId
    ? Object.values(contentTypesBranch.byId).filter(
        (contentType) => contentType.type === 'component' && !contentType.id.includes('/level-descriptor')
      )
    : null;
  const isFetching = useSelection((state) => state.preview.components.isFetching);

  useEffect(() => {
    if (site && isFetching === null) {
      dispatch(fetchComponentsByContentType({}));
    }
  }, [dispatch, site, isFetching]);

  const resource = useSelectorResource<ComponentResource, PagedEntityState<ContentInstance>>(
    (state) => state.preview.components,
    {
      shouldRenew: (source, resource) => resource.complete,
      shouldResolve: (source) =>
        (!source.isFetching && nnou(source.pageNumber) && nnou(source.page[source.pageNumber])) ||
        !source.contentTypeFilter,
      shouldReject: (source) => nnou(source.error),
      errorSelector: (source) => source.error,
      resultSelector: (source) => {
        let items = source.page[source.pageNumber]?.map((id: string) => source.byId[id]) ?? [];
        if (source.contentTypeFilter !== 'all') {
          items = items.filter((item: ContentInstance) => item.craftercms.contentTypeId === source.contentTypeFilter);
        }
        return {
          ...pluckProps(source, 'count', 'query.limit' as 'limit', 'pageNumber', 'contentTypeFilter'),
          items
        } as ComponentResource;
      }
    }
  );
  const { formatMessage } = useIntl();
  const hostToGuest$ = getHostToGuestBus();

  const onDragStart = (item: ContentInstance) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    hostToGuest$.next({
      type: componentInstanceDragStarted.type,
      payload: {
        instance: item,
        contentType: contentTypesBranch.byId[item.craftercms.contentTypeId]
      }
    });
  };

  const onDragEnd = () => hostToGuest$.next({ type: componentInstanceDragEnded.type });

  const onSearch = useCallback(
    (keywords: string) => dispatch(fetchComponentsByContentType({ keywords, offset: 0 })),
    [dispatch]
  );

  const onSearch$ = useDebouncedInput(onSearch, 600);

  function onPageChanged(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    dispatch(fetchComponentsByContentType({ offset: newPage }));
  }

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  function handleSelectChange(value: string) {
    dispatch(setContentTypeFilter(value));
  }

  return (
    <>
      <ErrorBoundary>
        <div className={classes.search}>
          <SearchBar
            placeholder={formatMessage(translations.filter)}
            showActionButton={Boolean(keyword)}
            onChange={handleSearchKeyword}
            keyword={keyword}
            autoFocus
          />
          {contentTypes && (
            <Select
              value={contentTypeFilter}
              displayEmpty
              className={classes.select}
              onChange={(event: any) => handleSelectChange(event.target.value)}
            >
              <MenuItem value="all">{formatMessage(translations.allContentTypes)}</MenuItem>
              {contentTypes.map((contentType: ContentType, i: number) => {
                return (
                  <MenuItem value={contentType.id} key={i}>
                    {contentType.name}
                  </MenuItem>
                );
              })}
            </Select>
          )}
        </div>
        <React.Suspense fallback={<LoadingState title={formatMessage(translations.loading)} />}>
          <PreviewBrowseComponentsPanelUI
            componentsResource={resource}
            onPageChanged={onPageChanged}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        </React.Suspense>
      </ErrorBoundary>
    </>
  );
}
