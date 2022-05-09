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

import { isFolder } from '../PathNavigator/utils';
import { NavLoader } from '../PathNavigator';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { DetailedItem } from '../../models';
import { getIndividualPaths, withoutIndex } from '../../utils/path';
import PathNavigatorBreadcrumbs from '../PathNavigator/PathNavigatorBreadcrumbs';
import useItemsByPath from '../../hooks/useItemsByPath';
import { lookupItemByPath } from '../../utils/content';
import PathNavigatorItem from '../PathNavigator/PathNavigatorItem';
import useSiteLocales from '../../hooks/useSiteLocales';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { forkJoin } from 'rxjs';
import { fetchChildrenByPath, fetchItemsByPath } from '../../services/content';
import { useDispatch } from 'react-redux';
import { folderBrowserPathNavigatorFetchParentItemsComplete } from '../../state/actions/pathNavigator';
import LookupTable from '../../models/LookupTable';
import useLogicResource from '../../hooks/useLogicResource';
import { SuspenseWithEmptyState } from '../Suspencified';
import { FormattedMessage, useIntl } from 'react-intl';
import PathNavigatorList from '../PathNavigator/PathNavigatorList';
import { createFakeResource } from '../../utils/resource';
import TablePagination from '@mui/material/TablePagination';
import { translations } from '../PathNavigator/translations';
import { useStyles } from '../PathNavigator/styles';
import clsx from 'clsx';

export interface FolderBrowserPathNavigatorProps {
  rootPath: string;
  onPathSelected?(path: string): void;
}

export function FolderBrowserPathNavigator(props: FolderBrowserPathNavigatorProps) {
  const { rootPath, onPathSelected } = props;
  const [keyword, setKeyword] = useState('');
  const [currentPath, setCurrentPath] = useState(rootPath);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [itemsInPath, setItemsInPath] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState();
  const itemsByPath = useItemsByPath();
  const siteLocales = useSiteLocales();
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();
  const classes = useStyles();
  const { formatMessage } = useIntl();

  // region useEffects
  useEffect(() => {
    const parentsPath = getIndividualPaths(currentPath, rootPath);
    setIsFetching(true);
    forkJoin([
      fetchItemsByPath(siteId, parentsPath, { castAsDetailedItem: true }),
      fetchChildrenByPath(siteId, currentPath, {
        limit,
        offset,
        keyword
      })
    ]).subscribe({
      next: ([items, children]) => {
        setIsFetching(false);
        dispatch(folderBrowserPathNavigatorFetchParentItemsComplete({ items, children }));
        setItemsInPath(children.length === 0 ? [] : children.map((item) => item.path));
        setTotal(children.total);
      },
      error: (e) => {
        setIsFetching(false);
        setError(e);
      }
    });
  }, [currentPath, dispatch, keyword, limit, offset, rootPath, siteId]);

  // endregion

  const onSearch = (keyword: string) => {
    setKeyword(keyword);
  };

  const onBreadcrumbSelected = (item: DetailedItem) => {
    if (withoutIndex(item.path) !== withoutIndex(currentPath)) {
      setCurrentPath(item.path);
    }
  };

  const onItemClicked = (item) => {
    if (isFolder(item)) {
      onPathSelected?.(item.path);
    }
  };

  const onRowsPerPageChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const limit = Number(e.target.value);
    setLimit(limit);
  };

  const onPageChanged = (page: number) => {
    const offset = page * limit;
    setOffset(offset);
  };

  const resource = useLogicResource<
    DetailedItem[],
    { itemsInPath: string[]; itemsByPath: LookupTable<DetailedItem>; isFetching: boolean; error: any }
  >(
    useMemo(
      () => ({
        itemsByPath,
        itemsInPath: itemsInPath,
        isFetching: isFetching,
        error: error
      }),
      // We only want to renew the state when itemsInPath changes.
      // Note: This only works whilst `itemsByPath` updates prior to `itemsInPath`.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [itemsInPath, isFetching, error]
    ),
    {
      shouldResolve: ({ itemsInPath, itemsByPath, isFetching, error }) => {
        return !isFetching && Boolean(itemsInPath) && !itemsInPath.some((path) => !lookupItemByPath(path, itemsByPath));
      },
      shouldRenew: ({ isFetching }, resource) => isFetching && resource.complete,
      shouldReject: ({ error }) => Boolean(error),
      resultSelector: ({ itemsInPath, itemsByPath }) => itemsInPath.map((path) => itemsByPath[path]),
      errorSelector: ({ error }) => error.response
    }
  );

  const itemsResource = useMemo(
    () => createFakeResource(itemsInPath ? itemsInPath.map((path) => itemsByPath[path]) : []),
    [itemsByPath, itemsInPath]
  );

  return (
    <>
      <PathNavigatorBreadcrumbs
        keyword={keyword}
        breadcrumb={getIndividualPaths(withoutIndex(currentPath), withoutIndex(rootPath))
          .map((path) => lookupItemByPath(path, itemsByPath))
          .filter(Boolean)}
        onSearch={onSearch}
        onCrumbSelected={onBreadcrumbSelected}
      />
      {lookupItemByPath(currentPath, itemsByPath) && (
        <PathNavigatorItem
          item={lookupItemByPath(currentPath, itemsByPath)}
          locale={siteLocales.defaultLocaleCode}
          isLevelDescriptor={false}
          onItemClicked={onItemClicked}
          showItemNavigateToButton={false}
          isCurrentPath
        />
      )}
      <SuspenseWithEmptyState
        resource={resource}
        errorBoundaryProps={{
          errorStateProps: { imageUrl: null }
        }}
        withEmptyStateProps={{
          /* If there are no children and no level descriptor => empty */
          isEmpty: (children) => children.length === 0,
          emptyStateProps: {
            title: <FormattedMessage id="pathNavigator.noItemsAtLocation" defaultMessage="No items at this location" />,
            image: null
          }
        }}
        suspenseProps={{
          fallback: <NavLoader numOfItems={itemsInPath?.length > 0 ? itemsInPath.length : limit} />
        }}
      >
        <PathNavigatorList
          isSelectMode={false}
          locale={siteLocales.defaultLocaleCode}
          resource={itemsResource}
          onItemClicked={onItemClicked}
          onPathSelected={(item) => {
            setCurrentPath(item.path);
          }}
        />
      </SuspenseWithEmptyState>
      {total !== null && total > 0 && (
        <TablePagination
          classes={{
            root: classes.pagination,
            toolbar: clsx(classes.paginationToolbar, classes.widgetSection)
          }}
          component="div"
          labelRowsPerPage=""
          count={total}
          rowsPerPage={limit}
          page={Math.ceil(offset / limit)}
          backIconButtonProps={{ 'aria-label': formatMessage(translations.previousPage) }}
          nextIconButtonProps={{ 'aria-label': formatMessage(translations.nextPage) }}
          onRowsPerPageChange={onRowsPerPageChange}
          onPageChange={(e, page: number) => onPageChanged(page)}
        />
      )}
    </>
  );
}

export default FolderBrowserPathNavigator;
