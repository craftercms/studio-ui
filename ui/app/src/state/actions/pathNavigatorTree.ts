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

import { createAction } from '@reduxjs/toolkit';
import { DetailedItem } from '../../models/Item';
import { AjaxError } from 'rxjs/ajax';
import { GetChildrenResponse } from '../../models/GetChildrenResponse';
import { GetChildrenOptions } from '../../models/GetChildrenOptions';
import LookupTable from '../../models/LookupTable';

type PayloadWithId<P> = P & { id: string };

export const pathNavigatorTreeInit = /*#__PURE__*/ createAction<
  PayloadWithId<{
    path: string;
    collapsed?: boolean;
    excludes?: string[];
    limit: number;
    expanded?: string[];
  }>
>('PATH_NAVIGATOR_TREE_INIT');

export const pathNavigatorTreeRefresh = /*#__PURE__*/ createAction<{ id: string; excludes?: string[] }>(
  'PATH_NAVIGATOR_TREE_REFRESH'
);

export const pathNavigatorTreeBackgroundRefresh = /*#__PURE__*/ createAction<{ id: string }>(
  'PATH_NAVIGATOR_TREE_BACKGROUND_REFRESH'
);

export const pathNavigatorTreeRestoreComplete = /*#__PURE__*/ createAction<
  PayloadWithId<{
    expanded: string[];
    collapsed: boolean;
    items: DetailedItem[];
    data: LookupTable<GetChildrenResponse>;
  }>
>('PATH_NAVIGATOR_TREE_RESTORE_COMPLETE');

export const pathNavigatorTreeRestoreFailed = /*#__PURE__*/ createAction<{
  id: string;
  error: Omit<AjaxError, 'request' | 'xhr'>;
}>('PATH_NAVIGATOR_TREE_RESTORE_FAILED');

export const pathNavigatorTreeExpandPath = /*#__PURE__*/ createAction<PayloadWithId<{ path: string }>>(
  'PATH_NAVIGATOR_TREE_EXPAND_PATH'
);

export const pathNavigatorTreeCollapsePath = /*#__PURE__*/ createAction<PayloadWithId<{ path: string }>>(
  'PATH_NAVIGATOR_TREE_COLLAPSE_PATH'
);

export const pathNavigatorTreeSetKeyword = /*#__PURE__*/ createAction<PayloadWithId<{ keyword: string; path: string }>>(
  'PATH_NAVIGATOR_TREE_SET_KEYWORD'
);

export const pathNavigatorTreeToggleExpanded = /*#__PURE__*/ createAction<PayloadWithId<{ collapsed: boolean }>>(
  'PATH_NAVIGATOR_TREE_TOGGLE_EXPANDED'
);

export const pathNavigatorTreeFetchPathPage = /*#__PURE__*/ createAction<
  PayloadWithId<{ path: string; options?: Partial<GetChildrenOptions> }>
>('PATH_NAVIGATOR_TREE_FETCH_PATH_PAGE');

export const pathNavigatorTreeFetchPathPageComplete = /*#__PURE__*/ createAction<
  PayloadWithId<{ children: GetChildrenResponse; parentPath: string; options?: Partial<GetChildrenOptions> }>
>('PATH_NAVIGATOR_TREE_FETCH_PATH_PAGE_COMPLETE');

export const pathNavigatorTreeFetchPathPageFailed = /*#__PURE__*/ createAction<{
  id: string;
  error: Omit<AjaxError, 'request' | 'xhr'>;
}>('PATH_NAVIGATOR_TREE_FETCH_PATH_PAGE_FAILED');

export const pathNavigatorTreeFetchPathChildren = /*#__PURE__*/ createAction<
  PayloadWithId<{ path: string; options?: Partial<GetChildrenOptions> }>
>('PATH_NAVIGATOR_TREE_FETCH_PATH_CHILDREN');

export const pathNavigatorTreeFetchPathChildrenComplete = /*#__PURE__*/ createAction<
  PayloadWithId<{ children: GetChildrenResponse; parentPath: string; options?: Partial<GetChildrenOptions> }>
>('PATH_NAVIGATOR_TREE_FETCH_PATH_CHILDREN_COMPLETE');

export const pathNavigatorTreeFetchPathChildrenFailed = /*#__PURE__*/ createAction<{
  id: string;
  error: Omit<AjaxError, 'request' | 'xhr'>;
}>('PATH_NAVIGATOR_TREE_FETCH_PATH_CHILDREN_FAILED');

export const pathNavigatorTreeFetchPathsChildren = /*#__PURE__*/ createAction<
  PayloadWithId<{ paths: LookupTable<Partial<GetChildrenOptions>>; options?: Partial<GetChildrenOptions> }>
>('PATH_NAVIGATOR_TREE_FETCH_PATHS_CHILDREN');

export const pathNavigatorTreeFetchPathsChildrenComplete = /*#__PURE__*/ createAction<
  PayloadWithId<{ data: LookupTable<GetChildrenResponse>; options?: Partial<GetChildrenOptions> }>
>('PATH_NAVIGATOR_TREE_FETCH_PATHS_CHILDREN_COMPLETE');

export const pathNavigatorTreeFetchPathsChildrenFailed = /*#__PURE__*/ createAction<{
  id: string;
  error: Omit<AjaxError, 'request' | 'xhr'>;
}>('PATH_NAVIGATOR_TREE_FETCH_PATHS_CHILDREN_FAILED');
