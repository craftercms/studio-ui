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
import { GetChildrenResponse } from '../../models/GetChildrenResponse';
import { DetailedItem } from '../../models/Item';
import { PathNavigatorStateProps } from '../../components/Navigation/PathNavigator/PathNavigator';

type PayloadWithId<P> = P & { id: string };

export const pathNavigatorInit = createAction<
  PayloadWithId<{ path: string; locale: string; collapsed?: boolean; excludes?: string[] }>
>('PATH_NAVIGATOR_INIT');

export const pathNavigatorSetLocaleCode = createAction<PayloadWithId<{ locale: string }>>(
  'PATH_NAVIGATOR_SET_LOCALE_CODE'
);

export const pathNavigatorUpdate = createAction<PayloadWithId<Partial<PathNavigatorStateProps>>>(
  'PATH_NAVIGATOR_UPDATE'
);

export const pathNavigatorSetCollapsed = createAction<PayloadWithId<{ collapsed: boolean }>>(
  'PATH_NAVIGATOR_SET_COLLAPSED'
);

export const pathNavigatorSetCurrentPath = createAction<PayloadWithId<{ path: string }>>(
  'PATH_NAVIGATOR_SET_CURRENT_PATH'
);

export const pathNavigatorConditionallySetPath = createAction<PayloadWithId<{ path: string }>>(
  'PATH_NAVIGATOR_CONDITIONALLY_SET_PATH'
);

export const pathNavigatorConditionallySetPathComplete = createAction<
  PayloadWithId<{ path: string; response: GetChildrenResponse }>
>('PATH_NAVIGATOR_CONDITIONALLY_SET_PATH_COMPLETE');

export const pathNavigatorConditionallySetPathFailed = createAction('PATH_NAVIGATOR_CONDITIONALLY_SET_PATH_FAILED');

export const pathNavigatorRefresh = createAction<{ id: string }>('PATH_NAVIGATOR_REFRESH');

export const pathNavigatorItemChecked = createAction<PayloadWithId<{ item: DetailedItem }>>(
  'PATH_NAVIGATOR_ITEM_CHECKED'
);

export const pathNavigatorItemUnchecked = createAction<PayloadWithId<{ item: DetailedItem }>>(
  'PATH_NAVIGATOR_ITEM_UNCHECKED'
);

export const pathNavigatorClearChecked = createAction<{ id: string }>('PATH_NAVIGATOR_CLEAR_CHECKED');

export const pathNavigatorFetchParentItems = createAction<PayloadWithId<{ path: string; excludes?: string[] }>>(
  'PATH_NAVIGATOR_FETCH_PARENT_ITEMS'
);

export const pathNavigatorFetchPathComplete = createAction<PayloadWithId<{ response: GetChildrenResponse }>>(
  'PATH_NAVIGATOR_FETCH_PATH_COMPLETE'
);

export const pathNavigatorFetchParentItemsComplete = createAction<PayloadWithId<{ response: GetChildrenResponse[] }>>(
  'PATH_NAVIGATOR_FETCH_PARENT_ITEMS_COMPLETE'
);

export const pathNavigatorFetchPathFailed = createAction('PATH_NAVIGATOR_FETCH_PATH_FAILED');

export const pathNavigatorSetKeyword = createAction<PayloadWithId<{ keyword: string }>>('PATH_NAVIGATOR_SET_KEYWORD');
