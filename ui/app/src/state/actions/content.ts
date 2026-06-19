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
import { ContentItem } from '../../models/Item';
import StandardAction from '../../models/StandardAction';

// region Quick Create
export const fetchQuickCreateList = /*#__PURE__*/ createAction('FETCH_QUICK_CREATE_LIST');
export const fetchQuickCreateListComplete = /*#__PURE__*/ createAction<QuickCreateItem[]>(
	'FETCH_QUICK_CREATE_LIST_COMPLETE'
);
export const fetchQuickCreateListFailed = /*#__PURE__*/ createAction('FETCH_QUICK_CREATE_LIST_FAILED');
// endregion

// region Content Item

export const fetchContentItem = /*#__PURE__*/ createAction<{ path: string }>('FETCH_CONTENT_ITEM');

export const reloadContentItem = /*#__PURE__*/ createAction<{ path: string }>('RELOAD_CONTENT_ITEM');

export const fetchContentItemComplete = /*#__PURE__*/ createAction<{ item: ContentItem }>(
	'FETCH_CONTENT_ITEM_COMPLETE'
);

export const fetchContentItemFailed = /*#__PURE__*/ createAction<AjaxError>('FETCH_CONTENT_ITEM_FAILED');

// endregion

// region Content Items

export type FetchContentItemsPayload = { paths: string[] };

export const fetchContentItems = /*#__PURE__*/ createAction<FetchContentItemsPayload>('FETCH_CONTENT_ITEMS');

export type FetchContentItemsCompletePayload = { items: ContentItem[] };

export const fetchContentItemsComplete =
	/*#__PURE__*/ createAction<FetchContentItemsCompletePayload>('FETCH_CONTENT_ITEMS_COMPLETE');

export const fetchContentItemsFailed = /*#__PURE__*/ createAction<AjaxError>('FETCH_CONTENT_ITEMS_FAILED');

export const contentItemsMissing = /*#__PURE__*/ createAction<{ paths: string[] }>('CONTENT_ITEMS_MISSING');

// endregion

export const updateItemsByPath = /*#__PURE__*/ createAction<{ items: ContentItem[] }>('UPDATE_ITEMS_BY_PATH');

// region Clipboard

export const setClipboard = /*#__PURE__*/ createAction<{
	type: 'CUT' | 'COPY';
	includeChildren?: boolean;
	sourcePath: string;
}>('SET_CLIPBOARD');

export const restoreClipboard = /*#__PURE__*/ createAction<{
	type: 'CUT' | 'COPY';
	includeChildren?: boolean;
	sourcePath: string;
}>('RESTORE_CLIPBOARD');

export const clearClipboard = /*#__PURE__*/ createAction('CLEAR_CLIPBOARD');

// endregion

// region itemsActions

export const duplicateItem = /*#__PURE__*/ createAction<{ path: string; onSuccess: StandardAction }>('DUPLICATE_ITEM');

export const duplicateAsset = /*#__PURE__*/ createAction<{ path: string; onSuccess: StandardAction }>(
	'DUPLICATE_ASSET'
);

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
export const conditionallyUnlockItem = /*#__PURE__*/ createAction<{ path: string; notify?: boolean }>(
	'CONDITIONALLY_UNLOCK_ITEM'
);

export const deleteController = /*#__PURE__*/ createAction<{ item: ContentItem; onSuccess?: StandardAction }>(
	'DELETE_CONTROLLER'
);

export const deleteTemplate = /*#__PURE__*/ createAction<{ item: ContentItem; onSuccess?: StandardAction }>(
	'DELETE_TEMPLATE'
);

// endregion
