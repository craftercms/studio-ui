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

import { ElasticParams, MediaItem, SearchItem } from '../../models/Search';
import StandardAction from '../../models/StandardAction';
import { EnhancedDialogProps } from '../EnhancedDialog';
import React from 'react';

export interface BrowseFilesDialogBaseProps {
  path: string;
  multiSelect?: boolean;
  contentTypes?: string[];
  mimeTypes?: string[];
  rowsPerPageOptions?: number[];
  numOfLoaderItems?: number;
}

export interface BrowseFilesDialogProps extends BrowseFilesDialogBaseProps, EnhancedDialogProps {
  onSuccess?(items: MediaItem | MediaItem[]): void;
}

export interface BrowseFilesDialogPropsStateProps extends BrowseFilesDialogBaseProps {
  onClose?: StandardAction;
  onSuccess?: StandardAction;
  onClosed?: StandardAction;
}

export interface BrowseFilesDialogContainerProps
  extends BrowseFilesDialogBaseProps,
    Pick<BrowseFilesDialogProps, 'onClose' | 'onSuccess'> {}

export interface BrowseFilesDialogUIProps {
  items: SearchItem[];
  guestBase: string;
  selectedCard: MediaItem;
  selectedArray: string[];
  multiSelect?: boolean;
  path: string;
  limit: number;
  offset: number;
  keyword: string;
  rowsPerPageOptions?: number[];
  total: number;
  numOfLoaderItems?: number;
  onCardSelected(item: MediaItem): void;
  onPreviewImage(item: MediaItem): void;
  onCheckboxChecked(path: string, selected: boolean): void;
  handleSearchKeyword(keyword: string): void;
  onPathSelected(path: string): void;
  onSelectButtonClick(): void;
  onChangePage(page: number): void;
  onChangeRowsPerPage(event): void;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const initialParameters: ElasticParams = {
  query: '',
  keywords: '',
  offset: 0,
  limit: 20,
  sortBy: '_score',
  sortOrder: 'desc',
  filters: {}
};
