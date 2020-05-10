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

// region Quick Create
export const fetchQuickCreateList = createAction('FETCH_QUICK_CREATE_LIST');
export const fetchQuickCreateListComplete = createAction<QuickCreateItem[]>('FETCH_QUICK_CREATE_LIST_COMPLETE');
export const fetchQuickCreateListFailed = createAction('FETCH_QUICK_CREATE_LIST_FAILED');
// endregion
