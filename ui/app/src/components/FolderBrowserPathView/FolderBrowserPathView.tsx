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
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { DetailedItem } from '../../models';
import { getIndividualPaths, withoutIndex } from '../../utils/path';
import { lookupItemByPath, parseSandBoxItemToDetailedItem } from '../../utils/content';
import useSiteLocales from '../../hooks/useSiteLocales';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { forkJoin } from 'rxjs';
import { fetchChildrenByPath, fetchItemsByPath } from '../../services/content';
import { useDispatch } from 'react-redux';
import LookupTable from '../../models/LookupTable';
import useLogicResource from '../../hooks/useLogicResource';
import FolderBrowserPathViewUI from './FolderBrowserPathViewUI';
import { getStoredFolderBrowserPathView, setStoredFolderBrowserPathView } from '../../utils/state';
import useActiveUser from '../../hooks/useActiveUser';
import { createLookupTable } from '../../utils/object';

export interface FolderBrowserPathViewProps {
  rootPath: string;
  selectedPath?: string;
  onPathSelected?(path: string): void;
}

export function FolderBrowserPathView(props: FolderBrowserPathViewProps) {
  const { rootPath, selectedPath, onPathSelected } = props;
  const [keyword, setKeyword] = useState('');
  const [currentPath, setCurrentPath] = useState(rootPath);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [itemsInPath, setItemsInPath] = useState(null);
  const [total, setTotal] = useState(0);
  const [itemsByPath, setItemsByPath] = useState({});
  const [error, setError] = useState();
  const siteLocales = useSiteLocales();
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();
  const user = useActiveUser();

  // region useEffects
  useEffect(() => {
    if (siteId && user?.username) {
      const stored = getStoredFolderBrowserPathView(siteId, user.username);
      if (stored?.limit) {
        setLimit(stored.limit);
      }
    }
  }, [siteId, user?.username]);

  useEffect(() => {
    const parentsPath = getIndividualPaths(currentPath, rootPath);
    setIsFetching(true);
    forkJoin([
      fetchItemsByPath(siteId, parentsPath, { castAsDetailedItem: true }),
      fetchChildrenByPath(siteId, currentPath, {
        limit,
        offset,
        keyword,
        systemTypes: ['folder']
      })
    ]).subscribe({
      next: ([items, children]) => {
        setItemsByPath({
          ...createLookupTable(parseSandBoxItemToDetailedItem(children), 'path'),
          ...createLookupTable(items, 'path')
        });
        setItemsInPath(children.length === 0 ? [] : children.map((item) => item.path));
        setTotal(children.total);
        setIsFetching(false);
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
    setStoredFolderBrowserPathView(siteId, user.username, { limit });
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
        itemsInPath,
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

  return (
    <FolderBrowserPathViewUI
      resource={resource}
      keyword={keyword}
      currentPath={currentPath}
      rootPath={rootPath}
      selectedPath={selectedPath}
      itemsByPath={itemsByPath}
      itemsInPath={itemsInPath}
      locale={siteLocales.defaultLocaleCode}
      limit={limit}
      offset={offset}
      total={total}
      onSearch={onSearch}
      onBreadcrumbSelected={onBreadcrumbSelected}
      onItemClicked={onItemClicked}
      onPathSelected={setCurrentPath}
      onRowsPerPageChange={onRowsPerPageChange}
      onPageChanged={onPageChanged}
    />
  );
}

export default FolderBrowserPathView;