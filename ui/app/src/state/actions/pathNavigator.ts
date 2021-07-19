/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import { PathNavigatorStateProps } from '../../components/PathNavigator/PathNavigator';
import { GetChildrenResponse } from '../../models/GetChildrenResponse';
import { AjaxError } from 'rxjs/ajax';

type PayloadWithId<P> = P & { id: string };

export const pathNavigatorInit = /*#__PURE__*/ createAction<
  PayloadWithId<{ path: string; locale: string; collapsed?: boolean; excludes?: string[]; limit: number }>
>('PATH_NAVIGATOR_INIT');

export const pathNavigatorSetLocaleCode = /*#__PURE__*/ createAction<PayloadWithId<{ locale: string }>>(
  'PATH_NAVIGATOR_SET_LOCALE_CODE'
);

export const pathNavigatorUpdate = /*#__PURE__*/ createAction<PayloadWithId<Partial<PathNavigatorStateProps>>>(
  'PATH_NAVIGATOR_UPDATE'
);

export const pathNavigatorSetCollapsed = /*#__PURE__*/ createAction<PayloadWithId<{ collapsed: boolean }>>(
  'PATH_NAVIGATOR_SET_COLLAPSED'
);

export const pathNavigatorSetCurrentPath = /*#__PURE__*/ createAction<PayloadWithId<{ path: string }>>(
  'PATH_NAVIGATOR_SET_CURRENT_PATH'
);

export const pathNavigatorConditionallySetPath = /*#__PURE__*/ createAction<PayloadWithId<{ path: string }>>(
  'PATH_NAVIGATOR_CONDITIONALLY_SET_PATH'
);

export const pathNavigatorConditionallySetPathComplete = /*#__PURE__*/ createAction<
  PayloadWithId<{ path: string; parent?: DetailedItem; children: GetChildrenResponse }>
>('PATH_NAVIGATOR_CONDITIONALLY_SET_PATH_COMPLETE');

export const pathNavigatorConditionallySetPathFailed = /*#__PURE__*/ createAction<{
  id: string;
  error: { status: number; message: string };
}>('PATH_NAVIGATOR_CONDITIONALLY_SET_PATH_FAILED');

export const pathNavigatorRefresh = /*#__PURE__*/ createAction<{ id: string }>('PATH_NAVIGATOR_REFRESH');

export const pathNavigatorBackgroundRefresh = /*#__PURE__*/ createAction<{ id: string }>(
  'PATH_NAVIGATOR_BACKGROUND_REFRESH'
);

export const pathNavigatorItemChecked = /*#__PURE__*/ createAction<PayloadWithId<{ item: DetailedItem }>>(
  'PATH_NAVIGATOR_ITEM_CHECKED'
);

export const pathNavigatorItemUnchecked = /*#__PURE__*/ createAction<PayloadWithId<{ item: DetailedItem }>>(
  'PATH_NAVIGATOR_ITEM_UNCHECKED'
);

export const pathNavigatorClearChecked = /*#__PURE__*/ createAction<{ id: string }>('PATH_NAVIGATOR_CLEAR_CHECKED');

export const pathNavigatorFetchParentItems = /*#__PURE__*/ createAction<
  PayloadWithId<{ path: string; excludes?: string[]; limit: number }>
>('PATH_NAVIGATOR_FETCH_PARENT_ITEMS');

export const pathNavigatorFetchPathComplete = /*#__PURE__*/ createAction<
  PayloadWithId<{ parent?: DetailedItem; children: GetChildrenResponse }>
>('PATH_NAVIGATOR_FETCH_PATH_COMPLETE');

export const pathNavigatorFetchParentItemsComplete = /*#__PURE__*/ createAction<
  PayloadWithId<{ items: DetailedItem[]; children: GetChildrenResponse }>
>('PATH_NAVIGATOR_FETCH_PARENT_ITEMS_COMPLETE');

export const pathNavigatorFetchPathFailed = /*#__PURE__*/ createAction<{
  id: string;
  error: Omit<AjaxError, 'request' | 'xhr'>;
}>('PATH_NAVIGATOR_FETCH_PATH_FAILED');

export const pathNavigatorSetKeyword = /*#__PURE__*/ createAction<PayloadWithId<{ keyword: string }>>(
  'PATH_NAVIGATOR_SET_KEYWORD'
);

export const pathNavigatorChangePage = /*#__PURE__*/ createAction<PayloadWithId<{ offset: number }>>(
  'PATH_NAVIGATOR_CHANGE_PAGE'
);
