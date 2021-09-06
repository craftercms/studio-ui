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
import { DraggablePanelListItem } from '../../modules/Preview/Tools/DraggablePanelListItem';
import List from '@material-ui/core/List';
import {
  COMPONENT_INSTANCE_DRAG_ENDED,
  COMPONENT_INSTANCE_DRAG_STARTED,
  fetchComponentsByContentType,
  setContentTypeFilter,
  setPreviewEditMode
} from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import SearchBar from '../Controls/SearchBar';
import EmptyState from '../SystemStatus/EmptyState';
import TablePagination from '@material-ui/core/TablePagination';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ContentType from '../../models/ContentType';
import { Resource } from '../../models/Resource';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useSelectorResource } from '../../utils/hooks/useSelectorResource';
import { useDebouncedInput } from '../../utils/hooks/useDebouncedInput';
import translations from './translations';
import useStyles from './styles';

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
    ? Object.values(contentTypesBranch.byId).filter((contentType) => contentType.type === 'component')
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
        const items =
          source.page[source.pageNumber]
            ?.map((id: string) => source.byId[id])
            .filter(
              (item: ContentInstance) =>
                source.contentTypeFilter === 'all' || item.craftercms.contentTypeId === source.contentTypeFilter
            ) || [];
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
      type: COMPONENT_INSTANCE_DRAG_STARTED,
      payload: {
        instance: item,
        contentType: contentTypesBranch.byId[item.craftercms.contentTypeId]
      }
    });
  };

  const onDragEnd = () => hostToGuest$.next({ type: COMPONENT_INSTANCE_DRAG_ENDED });

  const onSearch = useCallback((keywords: string) => dispatch(fetchComponentsByContentType({ keywords, offset: 0 })), [
    dispatch
  ]);

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
              className={classes.Select}
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
          <BrowsePanelUI
            componentsResource={resource}
            classes={classes}
            onPageChanged={onPageChanged}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        </React.Suspense>
      </ErrorBoundary>
    </>
  );
}

interface BrowsePanelUIProps {
  componentsResource: Resource<ComponentResource>;
  classes?: Partial<
    Record<
      | 'browsePanelWrapper'
      | 'paginationContainer'
      | 'pagination'
      | 'toolbar'
      | 'list'
      | 'noResultsImage'
      | 'noResultsTitle'
      | 'emptyState'
      | 'emptyStateImage'
      | 'emptyStateTitle',
      string
    >
  >;
  onPageChanged(e: React.MouseEvent<HTMLButtonElement>, page: number): void;
  onDragStart(item: ContentInstance): void;
  onDragEnd(): void;
}

function BrowsePanelUI(props: BrowsePanelUIProps) {
  const { componentsResource, classes, onPageChanged, onDragStart, onDragEnd } = props;
  const { formatMessage } = useIntl();
  const components = componentsResource.read();
  const { count, pageNumber, items, limit } = components;
  return (
    <div className={classes.browsePanelWrapper}>
      <div className={classes.paginationContainer}>
        <TablePagination
          className={classes.pagination}
          classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
          component="div"
          labelRowsPerPage=""
          count={count}
          rowsPerPage={limit}
          page={pageNumber}
          backIconButtonProps={{
            'aria-label': formatMessage(translations.previousPage),
            size: 'small'
          }}
          nextIconButtonProps={{
            'aria-label': formatMessage(translations.nextPage),
            size: 'small'
          }}
          onPageChange={(e: React.MouseEvent<HTMLButtonElement>, page: number) => onPageChanged(e, page * limit)}
        />
      </div>
      <List className={classes.list}>
        {items.map((item: ContentInstance) => (
          <DraggablePanelListItem
            key={item.craftercms.id}
            primaryText={item.craftercms.label}
            onDragStart={() => onDragStart(item)}
            onDragEnd={onDragEnd}
          />
        ))}
      </List>
      {count === 0 && (
        <EmptyState
          title={formatMessage(translations.noResults)}
          classes={{ image: classes.noResultsImage, title: classes.noResultsTitle }}
        />
      )}
    </div>
  );
}
