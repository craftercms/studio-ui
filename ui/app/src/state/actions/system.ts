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
import StandardAction from '../../models/StandardAction';
import { OptionsObject } from 'notistack';
import GlobalState, { Clipboard } from '../../models/GlobalState';
import { ObtainAuthTokenResponse } from '../../services/auth';
import User from '../../models/User';
import { Site } from '../../models/Site';
import LookupTable from '../../models/LookupTable';

// region Item Events

export const itemUpdated = /*#__PURE__*/ createAction<{ target: string }>('ITEM_UPDATED');

export const itemReverted = /*#__PURE__*/ createAction<{ target: string }>('ITEM_REVERTED');

export const itemCreated = /*#__PURE__*/ createAction<{ target: string }>('ITEM_CREATED');

export const itemCut = /*#__PURE__*/ createAction<{ target: string }>('ITEM_CUT');

export const folderCreated = /*#__PURE__*/ createAction<{ target: string; name: string }>('FOLDER_CREATED');

export const folderRenamed = /*#__PURE__*/ createAction<{ target: string; oldName: string; newName: string }>(
  'FOLDER_RENAMED'
);

export const itemsPasted = /*#__PURE__*/ createAction<{ target: string; clipboard: Clipboard }>('ITEMS_PASTED');

export const itemsDeleted = /*#__PURE__*/ createAction<{ targets: string[] }>('ITEMS_DELETED');

export const itemDuplicated = /*#__PURE__*/ createAction<{ target: string; resultPath: string }>('ITEM_DUPLICATED');

export const itemUnlocked = /*#__PURE__*/ createAction<{ target: string }>('ITEM_UNLOCKED');

// endregion

// region Notifications

export const showDeleteItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_DELETE_ITEM_SUCCESS_NOTIFICATION');

export const showPublishItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_PUBLISH_ITEM_SUCCESS_NOTIFICATION');

export const showCreateItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_CREATE_ITEM_SUCCESS_NOTIFICATION');

export const showCreateFolderSuccessNotification = /*#__PURE__*/ createAction(
  'SHOW_CREATE_FOLDER_SUCCESS_NOTIFICATION'
);

export const showEditItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_EDIT_ITEM_SUCCESS_NOTIFICATION');

export const showCopyItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_COPY_ITEM_SUCCESS_NOTIFICATION');

export const showCutItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_CUT_ITEM_SUCCESS_NOTIFICATION');

export const showPasteItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_PASTE_ITEM_SUCCESS_NOTIFICATION');

export const showUnlockItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_UNLOCK_ITEM_SUCCESS_NOTIFICATION');

export const showDuplicatedItemSuccessNotification = /*#__PURE__*/ createAction(
  'SHOW_DUPLICATED_ITEM_SUCCESS_NOTIFICATION'
);

export const showRevertItemSuccessNotification = /*#__PURE__*/ createAction('SHOW_REVERT_ITEM_SUCCESS_NOTIFICATION');

export const showRejectItemSuccessNotification = /*#__PURE__*/ createAction<{ count?: number }>(
  'SHOW_REJECT_ITEM_SUCCESS_NOTIFICATION'
);

export const showSystemNotification = /*#__PURE__*/ createAction<{
  message: string;
  options?: OptionsObject;
}>('SHOW_SYSTEM_NOTIFICATION');

// endregion

export const emitSystemEvent = /*#__PURE__*/ createAction<StandardAction>('SYSTEM_EVENT');

export const storeInitialized = /*#__PURE__*/ createAction<{
  auth: ObtainAuthTokenResponse;
  user: User;
  sites: Array<Site>;
  properties: LookupTable<any>;
}>('STORE_INITIALIZED');

export const messageSharedWorker = /*#__PURE__*/ createAction<StandardAction>('MESSAGE_SHARED_WORKER');

export const fetchGlobalMenu = /*#__PURE__*/ createAction('FETCH_GLOBAL_MENU');

export const fetchGlobalMenuComplete = /*#__PURE__*/ createAction<GlobalState['uiConfig']['globalNavigation']['items']>(
  'FETCH_GLOBAL_MENU_COMPLETE'
);

export const fetchGlobalMenuFailed = /*#__PURE__*/ createAction('FETCH_GLOBAL_MENU_FAILED');

export const fetchSiteLocale = /*#__PURE__*/ createAction('FETCH_SITE_LOCALE');
export const fetchSiteLocaleComplete = /*#__PURE__*/ createAction('FETCH_SITE_LOCALE_COMPLETE');
export const fetchSiteLocaleFailed = /*#__PURE__*/ createAction('FETCH_SITE_LOCALE_FAILED');
