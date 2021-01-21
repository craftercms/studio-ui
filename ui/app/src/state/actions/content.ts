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
import QuickCreateItem from '../../models/content/QuickCreateItem';
import { AjaxError } from 'rxjs/ajax';
import { DetailedItem } from '../../models/Item';
import StandardAction from '../../models/StandardAction';

// region Quick Create
export const fetchQuickCreateList = createAction('FETCH_QUICK_CREATE_LIST');
export const fetchQuickCreateListComplete = createAction<QuickCreateItem[]>('FETCH_QUICK_CREATE_LIST_COMPLETE');
export const fetchQuickCreateListFailed = createAction('FETCH_QUICK_CREATE_LIST_FAILED');
// endregion

// region Permissions
export const fetchUserPermissions = createAction<{ path: string }>('FETCH_USER_PERMISSIONS');
export const fetchUserPermissionsComplete = createAction<{ path: string; permissions: string[] }>(
  'FETCH_USER_PERMISSIONS_COMPLETE'
);
export const fetchUserPermissionsFailed = createAction<AjaxError>('FETCH_USER_PERMISSIONS_FAILED');
// endregion

// region Items
export const fetchDetailedItem = createAction<{ path: string }>('FETCH_DETAILED_ITEM');
export const reloadDetailedItem = createAction<{ path: string }>('RELOAD_DETAILED_ITEM');
export const completeDetailedItem = createAction<{ path: string }>('COMPLETE_DETAILED_ITEM');
export const fetchDetailedItemComplete = createAction<DetailedItem>('FETCH_DETAILED_ITEM_COMPLETE');
export const fetchDetailedItemFailed = createAction<AjaxError>('FETCH_DETAILED_ITEM_FAILED');
// endregion

// region clipboard
export const setClipBoard = createAction<{
  type: 'CUT' | 'COPY';
  paths?: string[];
  sourcePath: string;
}>('SET_CLIPBOARD');

export const restoreClipBoard = createAction<{
  type: 'CUT' | 'COPY';
  paths?: string[];
  sourcePath: string;
}>('SET_CLIPBOARD');

export const unSetClipBoard = createAction('UNSET_CLIPBOARD');
// endregion

// region item
export const duplicateItem = createAction<{ path: string; onSuccess: StandardAction }>('DUPLICATE_ITEM');
export const duplicateAsset = createAction<{ path: string; onSuccess: StandardAction }>('DUPLICATE_ASSET');
export const pasteItem = createAction<{ path: string }>('PASTE_ITEM');
export const pasteItemWithValidationPolicy = createAction<{ path: string }>('PASTE_ITEM_WITH_VALIDATION_POLICY');
export const unlockItem = createAction<{ path: string }>('UNLOCK_ITEM');
// endregion
