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

//region Item Events

export const itemUpdated = createAction<{ target: string }>('ITEM_UPDATED');

export const itemCreated = createAction<{ target: string }>('ITEM_CREATED');

export const folderCreated = createAction<{ target: string; name: string }>('FOLDER_CREATED');

export const folderRenamed = createAction<{ target: string; oldName: string; newName: string }>(
  'FOLDER_RENAMED'
);

export const itemsPasted = createAction<{ target: string; resultingPaths: string[] }>(
  'ITEM_PASTED'
);

export const itemsDeleted = createAction<{ targets: string[] }>('ITEMS_DELETED');

export const fileUploaded = createAction<{ target: string }>('FILE_UPLOADED');

export const itemDuplicated = createAction<{ target: string; resultPath: string }>(
  'ITEM_DUPLICATED'
);

//endregion

// region Notifications
export const showDeleteItemSuccessNotification = createAction(
  'SHOW_DELETE_ITEM_SUCCESS_NOTIFICATION'
);

export const showPublishItemSuccessNotification = createAction(
  'SHOW_PUBLISH_ITEM_SUCCESS_NOTIFICATION'
);

export const showEditItemSuccessNotification = createAction('SHOW_EDIT_ITEM_SUCCESS_NOTIFICATION');

export const showCopyItemSuccessNotification = createAction('SHOW_COPY_ITEM_SUCCESS_NOTIFICATION');

export const showCutItemSuccessNotification = createAction('SHOW_CUT_ITEM_SUCCESS_NOTIFICATION');

export const showPasteItemSuccessNotification = createAction(
  'SHOW_PASTE_ITEM_SUCCESS_NOTIFICATION'
);

export const showDuplicatedItemSuccessNotification = createAction(
  'SHOW_DUPLICATED_ITEM_SUCCESS_NOTIFICATION'
);

export const showRevertItemSuccessNotification = createAction(
  'SHOW_REVERT_ITEM_SUCCESS_NOTIFICATION'
);
// endregion

export const emitSystemEvent = createAction<StandardAction>('SYSTEM_EVENT');
