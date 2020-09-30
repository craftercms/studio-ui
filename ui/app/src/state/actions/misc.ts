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

// region Batch Actions
export const batchActions = createAction<StandardAction[]>('BATCH_ACTIONS');
// endregion

// region TemplateActions
export const changeContentType = createAction<{ contentTypeId: string, path: string }>('CHANGE_CONTENT_TYPE');
export const editTemplate = createAction<{ contentTypeId: string }>('EDIT_TEMPLATE');
export const itemDuplicate = createAction<{ path: string, onSuccess: StandardAction }>('ITEM_DUPlICATE');
export const assetDuplicate = createAction<{ path: string, onSuccess: StandardAction }>('ASSET_DUPlICATE');
// endregion
