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
import GlobalState from '../../models/GlobalState';
import { ObtainAuthTokenResponse } from '../../services/auth';
import User from '../../models/User';
import { Site } from '../../models/Site';
import LookupTable from '../../models/LookupTable';
import { UIBlockerStateProps } from '../../components/UIBlocker';
import SocketEventBase, { SocketRootEventBase } from '../../models/SocketEvent';
import { MarketplacePlugin } from '../../models';

// region Item Events

export const itemReverted = /*#__PURE__*/ createAction<{ target: string }>('ITEM_REVERTED');

export const itemCut = /*#__PURE__*/ createAction<{ target: string }>('ITEM_CUT');

export const lockContentEvent = /*#__PURE__*/ createAction<SocketEventBase & { locked: boolean }>('LOCK_CONTENT_EVENT');

export type ContentEventPayload = SocketEventBase;
export type DeleteContentEventPayload = SocketEventBase;

// New or updated (writeContent, createFolder, copyContent, revertContent, renameFolder
export const contentEvent = /*#__PURE__*/ createAction<ContentEventPayload>('CONTENT_EVENT');

export const deleteContentEvent = /*#__PURE__*/ createAction<DeleteContentEventPayload>('DELETE_CONTENT_EVENT');

export const configurationEvent = /*#__PURE__*/ createAction<SocketEventBase>('CONFIGURATION_EVENT');

export const publishEvent = /*#__PURE__*/ createAction('PUBLISH_EVENT');

export const repositoryEvent = /*#__PURE__*/ createAction('REPOSITORY_EVENT');

export const workflowEvent = /*#__PURE__*/ createAction('WORKFLOW_EVENT');

export type MoveContentEventPayload = SocketEventBase & { sourcePath: string };

export const moveContentEvent = /*#__PURE__*/ createAction<MoveContentEventPayload>('MOVE_CONTENT_EVENT');

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

export const pluginInstalled = /*#__PURE__*/ createAction<MarketplacePlugin>('PLUGIN_INSTALLED');

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

export const blockUI = /*#__PURE__*/ createAction<Partial<UIBlockerStateProps>>('BLOCK_UI');
export const unblockUI = /*#__PURE__*/ createAction('UNBLOCK_UI');

export const openSiteSocket = /*#__PURE__*/ createAction<{ site?: string; xsrfToken: string }>('OPEN_SITE_SOCKET');
export const setSiteSocketStatus = /*#__PURE__*/ createAction<{ connected: boolean }>('SET_SITE_SOCKET_STATUS');

// region projects events
export const newProjectReady = /*#__PURE__*/ createAction<SocketRootEventBase & { siteId: string }>('SITE_READY_EVENT');
export const projectBeingDeleted = /*#__PURE__*/ createAction<SocketRootEventBase & { siteId: string }>(
  'SITE_DELETING_EVENT'
);
// endregion
