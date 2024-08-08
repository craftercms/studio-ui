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
import { useIntl } from 'react-intl';
import { nnou } from '../../utils/object';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import LoadingState from '../LoadingState/LoadingState';
import ContentInstance from '../../models/ContentInstance';
import {
  componentInstanceDragEnded,
  componentInstanceDragStarted,
  fetchComponentsByContentType,
  setContentTypeFilter,
  setPreviewEditMode
} from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import SearchBar from '../SearchBar/SearchBar';
import { getHostToGuestBus } from '../../utils/subjects';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ContentType from '../../models/ContentType';
import { useSelection } from '../../hooks/useSelection';
import { useDebouncedInput } from '../../hooks/useDebouncedInput';
import translations from './translations';
import useStyles from './styles';
import PreviewBrowseComponentsPanelUI from './PreviewBrowseComponentsPanelUI';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { ApiResponseErrorState } from '../ApiResponseErrorState';

export function PreviewBrowseComponentsPanel() {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const siteId = useActiveSiteId();
  const componentsState = useSelection((state) => state.preview.components);
  const [keyword, setKeyword] = useState(componentsState.query.keywords);
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const editMode = useSelection((state) => state.preview.editMode);
  const contentTypes = contentTypesBranch.byId
    ? Object.values(contentTypesBranch.byId)
        .filter((contentType) => contentType.type === 'component' && !contentType.id.includes('/level-descriptor'))
        .sort((a: ContentType, b: ContentType) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    : null;
  const items = useMemo(() => {
    let items = componentsState.page[componentsState.pageNumber]?.map((id: string) => componentsState.byId[id]) ?? [];
    if (componentsState.contentTypeFilter !== 'all') {
      items = items.filter(
        (item: ContentInstance) => item.craftercms.contentTypeId === componentsState.contentTypeFilter
      );
    }
    return items;
  }, [componentsState]);

  useEffect(() => {
    if (siteId && contentTypesBranch.isFetching === false) {
      dispatch(fetchComponentsByContentType({ sortBy: 'internalName', sortOrder: 'asc' }));
    }
  }, [siteId, contentTypesBranch, dispatch]);

  const { formatMessage } = useIntl();
  const hostToGuest$ = getHostToGuestBus();

  const onDragStart = (item: ContentInstance) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    hostToGuest$.next(
      componentInstanceDragStarted({
        instance: item,
        contentType: contentTypesBranch.byId[item.craftercms.contentTypeId]
      })
    );
  };

  const onDragEnd = () => hostToGuest$.next({ type: componentInstanceDragEnded.type });

  const onSearch = useCallback(
    (keywords: string) =>
      dispatch(fetchComponentsByContentType({ keywords, offset: 0, sortBy: 'internalName', sortOrder: 'asc' })),
    [dispatch]
  );

  const onSearch$ = useDebouncedInput(onSearch, 600);

  function onPageChanged(newPage: number) {
    dispatch(fetchComponentsByContentType({ offset: newPage, sortBy: 'internalName', sortOrder: 'asc' }));
  }

  function onRowsPerPageChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    dispatch(
      fetchComponentsByContentType({ offset: 0, limit: e.target.value, sortBy: 'internalName', sortOrder: 'asc' })
    );
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
              size="small"
              value={componentsState.contentTypeFilter}
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
        {componentsState.error ? (
          <ApiResponseErrorState error={componentsState.error} />
        ) : componentsState.isFetching ? (
          <LoadingState title={formatMessage(translations.loading)} />
        ) : (
          ((nnou(componentsState.pageNumber) && nnou(componentsState.page[componentsState.pageNumber])) ||
            !componentsState.contentTypeFilter) && (
            <PreviewBrowseComponentsPanelUI
              items={items}
              count={componentsState.count}
              pageNumber={componentsState.pageNumber}
              limit={componentsState.query.limit}
              onPageChanged={onPageChanged}
              onRowsPerPageChange={onRowsPerPageChange}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          )
        )}
      </ErrorBoundary>
    </>
  );
}

export default PreviewBrowseComponentsPanel;
