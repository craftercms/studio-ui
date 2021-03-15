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

type PayloadWithId<P> = P & { id: string };

export const pathNavigatorTreeInit = /*#__PURE__*/ createAction<
  PayloadWithId<{ path: string; collapsed?: boolean; excludes?: string[]; limit: number }>
>('PATH_NAVIGATOR_TREE_INIT');

export const pathNavigatorTreeUpdate = /*#__PURE__*/ createAction<PayloadWithId<{ expanded: string[] }>>(
  'PATH_NAVIGATOR_TREE_UPDATE'
);

export const pathNavigatorTreeFetchItemComplete = /*#__PURE__*/ createAction<PayloadWithId<{ item: DetailedItem }>>(
  'PATH_NAVIGATOR_TREE_FETCH_ITEM_COMPLETE'
);

export const pathNavigatorTreeFetchItemFailed = /*#__PURE__*/ createAction<{
  id: string;
  error: Omit<AjaxError, 'request' | 'xhr'>;
}>('PATH_NAVIGATOR_TREE_FETCH_ITEM_FAILED');

export const pathNavigatorTreeFetchPathChildren = /*#__PURE__*/ createAction<PayloadWithId<{ path: string }>>(
  'PATH_NAVIGATOR_TREE_FETCH_PATH_CHILDREN'
);

export const pathNavigatorTreeFetchPathChildrenComplete = /*#__PURE__*/ createAction<
  PayloadWithId<{ children: GetChildrenResponse; parentPath: string }>
>('PATH_NAVIGATOR_TREE_FETCH_PATH_CHILDREN_COMPLETE');

export const pathNavigatorTreeFetchPathChildrenFailed = /*#__PURE__*/ createAction<{
  id: string;
  error: Omit<AjaxError, 'request' | 'xhr'>;
}>('PATH_NAVIGATOR_TREE_FETCH_PATH_CHILDREN_FAILED');
