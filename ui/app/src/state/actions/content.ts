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

import { createAction } from '@reduxjs/toolkit';
import QuickCreateItem from '../../models/content/QuickCreateItem';
import { AjaxError } from 'rxjs/ajax';
import { DetailedItem, SandboxItem } from '../../models/Item';
import StandardAction from '../../models/StandardAction';

// region Quick Create
export const fetchQuickCreateList = /*#__PURE__*/ createAction('FETCH_QUICK_CREATE_LIST');
export const fetchQuickCreateListComplete = /*#__PURE__*/ createAction<QuickCreateItem[]>(
  'FETCH_QUICK_CREATE_LIST_COMPLETE'
);
export const fetchQuickCreateListFailed = /*#__PURE__*/ createAction('FETCH_QUICK_CREATE_LIST_FAILED');
// endregion

// region Detailed Item
export const fetchDetailedItem = /*#__PURE__*/ createAction<{ path: string }>('FETCH_DETAILED_ITEM');
export const reloadDetailedItem = /*#__PURE__*/ createAction<{ path: string }>('RELOAD_DETAILED_ITEM');
export const completeDetailedItem =
  /*#__PURE__*/ createAction<{ path: string; force?: boolean }>('COMPLETE_DETAILED_ITEM');
export const fetchDetailedItemComplete = /*#__PURE__*/ createAction<DetailedItem>('FETCH_DETAILED_ITEM_COMPLETE');
export const fetchDetailedItemFailed = /*#__PURE__*/ createAction<AjaxError>('FETCH_DETAILED_ITEM_FAILED');
export const fetchDetailedItems = /*#__PURE__*/ createAction<{ paths: string[] }>('COMPLETE_DETAILED_ITEMS');
export const fetchDetailedItemsComplete = /*#__PURE__*/ createAction<DetailedItem[]>('FETCH_DETAILED_ITEMS_COMPLETE'); // TODO: update type
export const fetchDetailedItemsFailed = /*#__PURE__*/ createAction<AjaxError>('FETCH_DETAILED_ITEMS_FAILED');
// endregion

// region Sandbox Item
export type FetchSandboxItemPayload = { path: string; force?: boolean };
export const fetchSandboxItem = /*#__PURE__*/ createAction<FetchSandboxItemPayload>('FETCH_SANDBOX_ITEM');
export const fetchSandboxItemComplete =
  /*#__PURE__*/ createAction<{ item: SandboxItem }>('FETCH_SANDBOX_ITEM_COMPLETE');
export const fetchSandboxItemFailed = /*#__PURE__*/ createAction<AjaxError>('FETCH_SANDBOX_ITEM_FAILED');
// endregion

export const updateItemsByPath = /*#__PURE__*/ createAction<{ items: SandboxItem[] }>('UPDATE_ITEMS_BY_PATH');

// region Clipboard

export const setClipboard = /*#__PURE__*/ createAction<{
  type: 'CUT' | 'COPY';
  paths?: string[];
  sourcePath: string;
}>('SET_CLIPBOARD');

export const restoreClipboard = /*#__PURE__*/ createAction<{
  type: 'CUT' | 'COPY';
  paths?: string[];
  sourcePath: string;
}>('RESTORE_CLIPBOARD');

export const clearClipboard = /*#__PURE__*/ createAction('CLEAR_CLIPBOARD');

// endregion

// region itemsActions

export const duplicateItem = /*#__PURE__*/ createAction<{ path: string; onSuccess: StandardAction }>('DUPLICATE_ITEM');

export const duplicateAsset =
  /*#__PURE__*/ createAction<{ path: string; onSuccess: StandardAction }>('DUPLICATE_ASSET');

export const duplicateWithPolicyValidation = /*#__PURE__*/ createAction<{ path: string; type: 'item' | 'asset' }>(
  'DUPLICATE_WITH_POLICY_VALIDATION'
);

export const pasteItem = /*#__PURE__*/ createAction<{ path: string }>('PASTE_ITEM');

export const pasteItemWithPolicyValidation = /*#__PURE__*/ createAction<{ path: string }>(
  'PASTE_ITEM_WITH_POLICY_VALIDATION'
);

export const unlockItem = /*#__PURE__*/ createAction<{ path: string; notify?: boolean }>('UNLOCK_ITEM');
export const unlockItemCompleted = /*#__PURE__*/ createAction<{ path: string }>('UNLOCK_ITEM_COMPLETED');
export const unlockItemFailed = /*#__PURE__*/ createAction('LOCK_ITEM_FAILED');

export const lockItem = /*#__PURE__*/ createAction<{ path: string }>('LOCK_ITEM');
export const lockItemCompleted = /*#__PURE__*/ createAction<{ path: string; username: string }>('LOCK_ITEM_COMPLETED');
export const lockItemFailed = /*#__PURE__*/ createAction('LOCK_ITEM_FAILED');

// This action's semantic is to unlock the item only if the lock owner is the current user.
export const conditionallyUnlockItem =
  /*#__PURE__*/ createAction<{ path: string; notify?: boolean }>('CONDITIONALLY_UNLOCK_ITEM');

export const deleteController =
  /*#__PURE__*/ createAction<{ item: DetailedItem; onSuccess?: StandardAction }>('DELETE_CONTROLLER');

export const deleteTemplate =
  /*#__PURE__*/ createAction<{ item: DetailedItem; onSuccess?: StandardAction }>('DELETE_TEMPLATE');

// endregion
