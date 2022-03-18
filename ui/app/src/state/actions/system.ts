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
import StandardAction from '../../models/StandardAction';
import { OptionsObject } from 'notistack';
import GlobalState, { Clipboard } from '../../models/GlobalState';
import { ObtainAuthTokenResponse } from '../../services/auth';
import User from '../../models/User';
import { Site } from '../../models/Site';
import LookupTable from '../../models/LookupTable';
import { UIBlockerStateProps } from '../../components/UIBlocker';

// region Item Events

export const itemUpdated = /*#__PURE__*/ createAction<{ target: string }>('ITEM_UPDATED');

export const itemReverted = /*#__PURE__*/ createAction<{ target: string }>('ITEM_REVERTED');

export const itemCreated = /*#__PURE__*/ createAction<{ target: string }>('ITEM_CREATED');

export const itemCut = /*#__PURE__*/ createAction<{ target: string }>('ITEM_CUT');

export const folderCreated = /*#__PURE__*/ createAction<{ target: string; name: string }>('FOLDER_CREATED');

export const folderRenamed =
  /*#__PURE__*/ createAction<{ target: string; oldName: string; newName: string }>('FOLDER_RENAMED');

export const itemsUploaded = /*#__PURE__*/ createAction<{ target: string; targets: string[] }>('ITEM_UPLOADED');

export const itemsPasted = /*#__PURE__*/ createAction<{ target: string; clipboard: Clipboard }>('ITEMS_PASTED');

export const itemsDeleted = /*#__PURE__*/ createAction<{ targets: string[] }>('ITEMS_DELETED');

export const itemDuplicated = /*#__PURE__*/ createAction<{ target: string; resultPath: string }>('ITEM_DUPLICATED');

export const itemUnlocked = /*#__PURE__*/ createAction<{ target: string }>('ITEM_UNLOCKED');

export const itemLocked = /*#__PURE__*/ createAction<{ target: string }>('ITEM_LOCKED');

export const itemsRejected = /*#__PURE__*/ createAction<{ targets: string[] }>('ITEMS_REJECTED');

export const itemsScheduled = /*#__PURE__*/ createAction<{ targets: string[] }>('ITEMS_SCHEDULED');

export const itemsApproved = /*#__PURE__*/ createAction<{ targets: string[] }>('ITEMS_APPROVED');

interface Person {
  username: string;
  firstName: string;
  lastName: string;
}

interface SocketEventBase {
  targetPath: string;
  user: Person;
}

export const lockContentEvent = /*#__PURE__*/ createAction<SocketEventBase & { locked: boolean }>('LOCK_CONTENT_EVENT');

export const contentEvent = /*#__PURE__*/ createAction<SocketEventBase>('CONTENT_EVENT');

export const configurationEvent = /*#__PURE__*/ createAction<SocketEventBase>('CONFIGURATION_EVENT');

export const publishEvent = /*#__PURE__*/ createAction('PUBLISH_EVENT');

export const repositoryEvent = /*#__PURE__*/ createAction('REPOSITORY_EVENT');

export const workflowEvent = /*#__PURE__*/ createAction('WORKFLOW_EVENT');

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

export const pluginInstalled = /*#__PURE__*/ createAction<StandardAction>('PLUGIN_INSTALLED');

export const pluginUninstalled = /*#__PURE__*/ createAction<StandardAction>('PLUGIN_UNINSTALLED');

export const contentTypeCreated = /*#__PURE__*/ createAction<StandardAction>('CONTENT_TYPE_CREATED');

export const contentTypeUpdated = /*#__PURE__*/ createAction<StandardAction>('CONTENT_TYPE_UPDATED');

export const contentTypeDeleted = /*#__PURE__*/ createAction<StandardAction>('CONTENT_TYPE_DELETED');

export const storeInitialized = /*#__PURE__*/ createAction<{
  auth: ObtainAuthTokenResponse;
  user: User;
  sites: Array<Site>;
  properties: LookupTable<any>;
}>('STORE_INITIALIZED');

export const messageSharedWorker = /*#__PURE__*/ createAction<StandardAction>('MESSAGE_SHARED_WORKER');

export const fetchGlobalMenu = /*#__PURE__*/ createAction('FETCH_GLOBAL_MENU');

export const fetchGlobalMenuComplete =
  /*#__PURE__*/ createAction<GlobalState['globalNavigation']['items']>('FETCH_GLOBAL_MENU_COMPLETE');

export const fetchGlobalMenuFailed = /*#__PURE__*/ createAction('FETCH_GLOBAL_MENU_FAILED');

export const fetchUseLegacyPreviewPreference =
  /*#__PURE__*/ createAction<Partial<{ site: string }>>('FETCH_USE_PREVIEW_3');
export const fetchUseLegacyPreviewPreferenceComplete = /*#__PURE__*/ createAction<{
  site: string;
  useLegacyPreview: boolean;
}>('FETCH_USE_PREVIEW_3_COMPLETE');
export const fetchUseLegacyPreviewPreferenceFailed = /*#__PURE__*/ createAction('FETCH_USE_PREVIEW_3_FAILED');

export const blockUI = /*#__PURE__*/ createAction<Partial<UIBlockerStateProps>>('BLOCK_UI');
export const unblockUI = /*#__PURE__*/ createAction('UNBLOCK_UI');

export const openSiteSocket = /*#__PURE__*/ createAction<{ site: string; xsrfToken: string }>('OPEN_SITE_SOCKET');
