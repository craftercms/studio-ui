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

import PathNavigatorBreadcrumbs from '../PathNavigator/PathNavigatorBreadcrumbs';
import { getIndividualPaths, withoutIndex } from '../../utils/path';
import { lookupItemByPath } from '../../utils/content';
import PathNavigatorItem from '../PathNavigator/PathNavigatorItem';
import { SuspenseWithEmptyState } from '../Suspencified';
import { FormattedMessage, useIntl } from 'react-intl';
import PathNavigatorList from '../PathNavigator/PathNavigatorList';
import TablePagination from '@mui/material/TablePagination';
import { translations } from '../PathNavigator/translations';
import React, { ChangeEvent, useMemo } from 'react';
import { createFakeResource } from '../../utils/resource';
import { useStyles } from '../PathNavigator/styles';
import LookupTable from '../../models/LookupTable';
import { DetailedItem, Resource } from '../../models';
import NavLoader from '../PathNavigator/NavLoader';

export interface FolderBrowserPathViewUIProps {
  resource: Resource<DetailedItem[]>;
  keyword: string;
  currentPath: string;
  rootPath: string;
  selectedPath: string;
  itemsByPath: LookupTable<DetailedItem>;
  onSearch?: (keyword: string) => void;
  onBreadcrumbSelected: (item: DetailedItem, event: React.SyntheticEvent) => void;
  locale: string;
  limit: number;
  offset: number;
  onItemClicked?(item: DetailedItem, event?: React.MouseEvent): void;
  itemsInPath: string[];
  onPathSelected: (path: string) => void;
  total: number;
  onRowsPerPageChange?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onPageChanged?: (page: number) => void;
}

export function FolderBrowserPathViewUI(props: FolderBrowserPathViewUIProps) {
  const {
    resource,
    keyword,
    currentPath,
    rootPath,
    selectedPath,
    itemsByPath,
    onSearch,
    onBreadcrumbSelected,
    locale,
    limit,
    offset,
    onItemClicked,
    itemsInPath,
    onPathSelected,
    total,
    onRowsPerPageChange,
    onPageChanged
  } = props;
  const { formatMessage } = useIntl();
  const { classes, cx } = useStyles();

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
          locale={locale}
          isLevelDescriptor={false}
          onItemClicked={onItemClicked}
          showItemNavigateToButton={false}
          isCurrentPath
          isActive={lookupItemByPath(currentPath, itemsByPath).path === selectedPath}
        />
      )}
      <SuspenseWithEmptyState
        resource={resource}
        errorBoundaryProps={{
          errorStateProps: { imageUrl: null }
        }}
        withEmptyStateProps={{
          /* If there are no children and no level descriptor => empty */
          isEmpty: (children: DetailedItem[]) => children.length === 0,
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
          locale={locale}
          resource={itemsResource}
          computeActiveItems={(items) => {
            return items.filter((item) => item.path === selectedPath).map((item) => item.path);
          }}
          onItemClicked={onItemClicked}
          onPathSelected={(item) => {
            onPathSelected(item.path);
          }}
        />
      </SuspenseWithEmptyState>
      {total !== null && total > 0 && (
        <TablePagination
          classes={{
            root: classes.pagination,
            toolbar: cx(classes.paginationToolbar, classes.widgetSection)
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

export default FolderBrowserPathViewUI;
