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

import React, { useEffect, useMemo, useState } from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages, useIntl } from 'react-intl';
import { useSelection, useStateResourceSelection } from "../../../utils/hooks";
import { PagedEntityState } from "../../../models/GlobalState";
import { nnou, pluckProps } from "../../../utils/object";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import LoadingState from "../../../components/SystemStatus/LoadingState";
import { createStyles, makeStyles } from "@material-ui/core";
import ContentInstance from '../../../models/ContentInstance';
import { PanelListItem } from "./PanelListItem";
import List from "@material-ui/core/List";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { fetchComponentsByContentType } from "../../../state/actions/preview";
import { Subject } from "rxjs";
import { useDispatch } from "react-redux";
import SearchBar from "../../../components/SearchBar";
import EmptyState from "../../../components/SystemStatus/EmptyState";
import TablePagination from "@material-ui/core/TablePagination";
import { DRAWER_WIDTH } from "../previewContext";

const translations = defineMessages({
  browse: {
    id: 'craftercms.ice.browse.title',
    defaultMessage: 'Browse components'
  },
  noResults: {
    id: 'craftercms.ice.browse.noResults',
    defaultMessage: ' No results found.'
  },
  previousPage: {
    id: 'craftercms.ice.browse.previousPage',
    defaultMessage: 'previous page'
  },
  nextPage: {
    id: 'craftercms.ice.browse.nextPage',
    defaultMessage: 'next page'
  },
  loading: {
    id: 'craftercms.ice.browse.loading',
    defaultMessage: 'Loading'
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
}));


interface ComponentResource {
  count: number;
  limit: number;
  pageNumber: number;
  items: Array<ContentInstance>;
}

export default function BrowseComponentsPanel() {

  const classes = useStyles({});
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const dispatch = useDispatch();
  const initialKeyword = useSelection(state => state.preview.components.query.keywords);
  const [keyword, setKeyword] = useState(initialKeyword);
  const resource = useStateResourceSelection<ComponentResource, PagedEntityState<ContentInstance>>(state => state.preview.components, {
    shouldRenew: (source, resource) => resource.complete,
    shouldResolve: source => (!source.isFetching) && nnou(source.byId),
    shouldReject: source => nnou(source.error),
    errorSelector: source => source.error,
    resultSelector: source => {
      const items = source.page[source.pageNumber].map((id) => source.byId[id]);
      return {
        ...pluckProps(source, 'count', 'query.limit', 'pageNumber'),
        items
      } as ComponentResource
    }
  });
  const { formatMessage } = useIntl();

  const onDragStart = () => {
  };

  const onDragEnd = () => {
  };

  useEffect(() => {
    const subscription = onSearch$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((keywords: string) => {
      dispatch(fetchComponentsByContentType('/component/feature', { keywords }));
    });
    return () => subscription.unsubscribe();
  }, [dispatch, onSearch$]);

  function onPageChanged(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    dispatch(fetchComponentsByContentType('/component/feature', { offset: newPage }));
  }

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  return (
    <ToolPanel title={translations.browse}>
      <ErrorBoundary>
        <div className={classes.search}>
          <SearchBar
            onChange={handleSearchKeyword}
            keyword={keyword}
          />
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
  } = props;
  const { formatMessage } = useIntl();
  const components: ComponentResource = componentsResource.read();
  const { count, pageNumber, items, limit } = components;
  return (
    <div className={classes.browsePanelWrapper}>
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
            <PanelListItem
              key={item.craftercms.id}
              primaryText={item.craftercms.label}
              onDragStart={(e) => onDragStart(e)}
              onDragEnd={(e) => onDragEnd(e)}
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
    </div>
  )
}
