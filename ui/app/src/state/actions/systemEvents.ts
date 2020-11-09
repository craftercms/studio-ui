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

export const itemUpdated = createAction<{ target: string }>('ITEM_UPDATED');

export const itemCreated = createAction<{ target: string }>('ITEM_CREATED');

export const folderCreated = createAction<{ target: string; name: string }>('FOLDER_CREATED');

export const folderRenamed = createAction<{ target: string; oldName: string; newName: string }>(
  'FOLDER_RENAMED'
);

export const itemPasted = createAction<{ target: string; resultingPaths: string[] }>('ITEM_PASTED');

export const itemDeleted = createAction<{ targets: string[] }>('ITEM_DELETED');

export const fileUploaded = createAction<{ target: string }>('FILE_UPLOADED');

export const itemDuplicated = createAction<{ target: string; resultPath: string }>(
  'ITEM_DUPLICATED'
);

export const systemEvent = createAction<StandardAction>('SYSTEM_EVENT');
