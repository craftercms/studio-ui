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

import { ElasticParams, MediaItem, SearchItem } from '../../models/Search';
import StandardAction from '../../models/StandardAction';
import { EnhancedDialogProps } from '../EnhancedDialog';
import React from 'react';
import { MediaCardViewModes } from '../MediaCard';

export interface BrowseFilesDialogBaseProps {
  path: string;
  multiSelect?: boolean;
  contentTypes?: string[];
  mimeTypes?: string[];
  numOfLoaderItems?: number;
  allowUpload?: boolean;
  initialParameters?: Partial<ElasticParams>;
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
  viewMode?: MediaCardViewModes;
  path: string;
  currentPath: string;
  searchParameters: ElasticParams;
  setSearchParameters(params: Partial<ElasticParams>): void;
  limit: number;
  offset: number;
  keyword: string;
  total: number;
  numOfLoaderItems?: number;
  allowUpload?: boolean;
  sortKeys: Array<string>;
  onCardSelected(item: MediaItem): void;
  onPreviewImage?(item: MediaItem): void;
  onCheckboxChecked(path: string, selected: boolean): void;
  handleSearchKeyword(keyword: string): void;
  onPathSelected(path: string): void;
  onSelectButtonClick(): void;
  onChangePage(page: number): void;
  onChangeRowsPerPage(event): void;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onRefresh(): void;
  onUpload(): void;
  onToggleViewMode?(): void;
}

export const initialParameters: ElasticParams = {
  query: '',
  keywords: '',
  offset: 0,
  limit: 25,
  sortBy: '_score',
  sortOrder: 'desc',
  filters: {}
};
