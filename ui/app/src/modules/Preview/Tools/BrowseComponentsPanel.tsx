/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import ToolPanel from './ToolPanel';
import { defineMessages, useIntl } from 'react-intl';
import { useDebouncedInput, useSelection, useStateResourceSelection } from "../../../utils/hooks";
import { PagedEntityState } from "../../../models/GlobalState";
import { nnou, pluckProps } from "../../../utils/object";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import LoadingState from "../../../components/SystemStatus/LoadingState";
import { createStyles, makeStyles } from "@material-ui/core";
import ContentInstance from '../../../models/ContentInstance';
import { DraggablePanelListItem } from "./DraggablePanelListItem";
import List from "@material-ui/core/List";
import {
  COMPONENT_INSTANCE_DRAG_ENDED,
  COMPONENT_INSTANCE_DRAG_STARTED,
  fetchComponentsByContentType
} from "../../../state/actions/preview";
import { useDispatch } from "react-redux";
import SearchBar from "../../../components/SearchBar";
import EmptyState from "../../../components/SystemStatus/EmptyState";
import TablePagination from "@material-ui/core/TablePagination";
import { DRAWER_WIDTH, getHostToGuestBus } from "../previewContext";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import ContentType from "../../../models/ContentType";

const translations = defineMessages({
  browse: {
    id: 'craftercms.ice.browseComponents.title',
    defaultMessage: 'Browse components'
  },
  noResults: {
    id: 'craftercms.ice.browseComponents.noResults',
    defaultMessage: ' No results found.'
  },
  previousPage: {
    id: 'craftercms.ice.browseComponents.previousPage',
    defaultMessage: 'previous page'
  },
  nextPage: {
    id: 'craftercms.ice.browseComponents.nextPage',
    defaultMessage: 'next page'
  },
  loading: {
    id: 'craftercms.ice.browseComponents.loading',
    defaultMessage: 'Loading'
  },
  selectContentType: {
    id: 'craftercms.ice.browseComponents.selectContentType',
    defaultMessage: 'Select content type'
  },
  chooseContentType: {
    id: 'craftercms.ice.browseComponents.chooseContentType',
    defaultMessage: 'Please choose a content type.'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  browsePanelWrapper: {
    padding: '15px 0 55px 0'
  },
  list: {
    padding: 0
  },
  search: {
    padding: '15px 15px 0px 15px',
  },
  pagination: {
    marginLeft: 'auto',
    position: 'fixed',
    zIndex: 1,
    bottom: 0,
    background: 'white',
    color: 'black',
    width: `calc(${DRAWER_WIDTH}px - 1px)`,
    left: 0,
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
    paddingLeft: '20px',
    '& .MuiTablePagination-spacer': {
      display: 'none'
    },
    '& .MuiTablePagination-spacer + p': {
      display: 'none'
    }
  },
  noResultsImage: {
    width: '150px'
  },
  noResultsTitle: {
    fontSize: 'inherit',
    marginTop: '10px'
  },
  Select: {
    width: '100%',
    marginTop: '15px'
  },
  emptyState: {
    margin: `${theme.spacing(4)}px ${theme.spacing(1)}px`
  },
  emptyStateImage: {
    width: '50%',
    marginBottom: theme.spacing(1)
  },
  emptyStateTitle: {
    fontSize: '1em'
  }
}));


interface ComponentResource {
  count: number;
  limit: number;
  pageNumber: number;
  contentTypeFilter: string;
  items: Array<ContentInstance>;
}

export default function BrowseComponentsPanel() {

  const classes = useStyles({});
  //const onSearch$ = useMemo(() => new Subject<string>(), []);
  const dispatch = useDispatch();
  const initialKeyword = useSelection(state => state.preview.components.query.keywords);
  const initialContentTypeFilter = useSelection(state => state.preview.components.contentTypeFilter);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [contentTypeFilter, setContentTypeFilter] = useState(initialContentTypeFilter);
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId).filter((contentType) => contentType.type === 'component') : null;
  const isFetching = useSelection(state => state.preview.components.isFetching);
  const resource = useStateResourceSelection<ComponentResource, PagedEntityState<ContentInstance>>(state => state.preview.components, {
    shouldRenew: (source, resource) => resource.complete,
    shouldResolve: source => ((!source.isFetching) && nnou(source.pageNumber) && nnou(source.page[source.pageNumber])) || !source.contentTypeFilter,
    shouldReject: source => nnou(source.error),
    errorSelector: source => source.error,
    resultSelector: source => {
      const items = source.page[source.pageNumber]?.map((id: string) => source.byId[id]).filter((item: ContentInstance) => item.craftercms.contentType === source.contentTypeFilter) || [];
      return {
        ...pluckProps(source, 'count', 'query.limit', 'pageNumber', 'contentTypeFilter'),
        items
      } as ComponentResource
    }
  });
  const { formatMessage } = useIntl();
  const authoringBase = useSelection<string>(state => state.env.AUTHORING_BASE);
  const hostToGuest$ = getHostToGuestBus();

  const onDragStart = (item: ContentInstance) => hostToGuest$.next({
    type: COMPONENT_INSTANCE_DRAG_STARTED,
    payload: item
  });

  const onDragEnd = () => hostToGuest$.next({ type: COMPONENT_INSTANCE_DRAG_ENDED });

  useEffect(() => {
    dispatch(fetchComponentsByContentType(contentTypeFilter));
  }, [contentTypeFilter, dispatch]);

  const onSearch = useCallback(() => (
    (keywords: string) => dispatch(fetchComponentsByContentType(null, { keywords }))
  ), [dispatch]);

  const onSearch$ = useDebouncedInput(onSearch, 400);

  function onPageChanged(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    dispatch(fetchComponentsByContentType(null, { offset: newPage }));
  }

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  function handleSelectChange(value: string) {
    setContentTypeFilter(value);
  }

  return (
    <ToolPanel title={translations.browse}>
      <ErrorBoundary>
        <div className={classes.search}>
          <SearchBar
            onChange={handleSearchKeyword}
            keyword={keyword}
            disabled={isFetching}
          />
          {
            contentTypes &&
            <Select
              value={contentTypeFilter}
              displayEmpty
              className={classes.Select}
              onChange={(event: any) => handleSelectChange(event.target.value)}
              disabled={isFetching}
            >
              <MenuItem value="" disabled>{formatMessage(translations.selectContentType)}</MenuItem>
              {
                contentTypes.map((contentType: ContentType, i: number) => {
                  return <MenuItem value={contentType.id} key={i}>{contentType.name}</MenuItem>
                })
              }
            </Select>
          }
        </div>
        <React.Suspense
          fallback={
            <LoadingState
              title={formatMessage(translations.loading)}
              graphicProps={{ width: 150 }}
            />
          }
        >
          <BrowsePanelUI
            componentsResource={resource}
            classes={classes}
            onPageChanged={onPageChanged}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            chooseContentTypeImageUrl={`${authoringBase}/static-assets/images/choose_option.svg`}
          />
        </React.Suspense>
      </ErrorBoundary>
    </ToolPanel>
  );

}

function BrowsePanelUI(props) {
  const {
    componentsResource,
    classes,
    onPageChanged,
    onDragStart,
    onDragEnd,
    chooseContentTypeImageUrl,
  } = props;
  const { formatMessage } = useIntl();
  const components: ComponentResource = componentsResource.read();
  const { count, pageNumber, items, limit, contentTypeFilter } = components;
  return (
    <div className={classes.browsePanelWrapper}>
      {
        contentTypeFilter ? (
          <>
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
              }}
              nextIconButtonProps={{
                'aria-label': formatMessage(translations.nextPage),
              }}
              onChangePage={(e: React.MouseEvent<HTMLButtonElement>, page: number) => onPageChanged(e, page * limit)}
            />
            <List className={classes.list}>
              {
                items.map((item: ContentInstance) =>
                  <DraggablePanelListItem
                    key={item.craftercms.id}
                    primaryText={item.craftercms.label}
                    onDragStart={() => onDragStart(item)}
                    onDragEnd={onDragEnd}
                  />
                )
              }
            </List>
            {
              count === 0 &&
              <EmptyState
                title={formatMessage(translations.noResults)}
                classes={{ image: classes.noResultsImage, title: classes.noResultsTitle }}
              />
            }
          </>
        ) : (
          <EmptyState
            title={formatMessage(translations.chooseContentType)}
            image={chooseContentTypeImageUrl}
            classes={{ root: classes.emptyState, image: classes.emptyStateImage, title: classes.emptyStateTitle }}
          />
        )
      }
    </div>
  )
}
