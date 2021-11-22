/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { FormattedMessage, useIntl } from 'react-intl';
import TablePagination from '@mui/material/TablePagination';
import translations from './translations';
import React from 'react';
import List from '@mui/material/List';
import ContentInstance from '../../models/ContentInstance';
import { DraggablePanelListItem } from '../DraggablePanelListItem/DraggablePanelListItem';
import EmptyState from '../EmptyState/EmptyState';
import { Resource } from '../../models/Resource';
import { useComponentsPanelUI } from './styles';
import FormHelperText from '@mui/material/FormHelperText';

export interface ComponentResource {
  count: number;
  limit: number;
  pageNumber: number;
  contentTypeFilter: string;
  items: Array<ContentInstance>;
}

export interface PreviewBrowseComponentsPanelUIProps {
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

export function PreviewBrowseComponentsPanelUI(props: PreviewBrowseComponentsPanelUIProps) {
  const { componentsResource, onPageChanged, onDragStart, onDragEnd } = props;
  const { formatMessage } = useIntl();
  const classes = useComponentsPanelUI();
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
      <FormHelperText className={classes.helperTextWrapper}>
        <FormattedMessage
          id="previewBrowseComponentsPanel.sharedComponentsHelperText"
          defaultMessage="Only shared components are shown here"
        />
      </FormHelperText>
    </div>
  );
}

export default PreviewBrowseComponentsPanelUI;
