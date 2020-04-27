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
import { AjaxError } from 'rxjs/ajax';
import { HistoryDialogStateProps } from '../../modules/Content/History/HistoryDialog';
import { ViewVersionDialogStateProps } from '../../modules/Content/History/ViewVersionDialog';
import { FetchContentVersion } from '../../models/Version';
import { CompareVersionsDialogStateProps } from '../../modules/Content/History/CompareVersionsDialog';

//region History
export const showHistoryDialog = createAction<Partial<HistoryDialogStateProps>>('SHOW_HISTORY_DIALOG');
export const closeHistoryDialog = createAction<StandardAction>('CLOSE_HISTORY_DIALOG');
export const revertContent = createAction<string>('REVERT_CONTENT');
export const revertContentComplete = createAction<Boolean>('REVERT_CONTENT_COMPLETE');
export const revertContentFailed = createAction<AjaxError>('REVERT_CONTENT_FAILED');
// endregion

//region View Versions
export const showViewVersionDialog = createAction<Partial<ViewVersionDialogStateProps>>('SHOW_VIEW_VERSION_DIALOG');
export const closeViewVersionDialog = createAction<StandardAction>('CLOSE_VIEW_VERSION_DIALOG');
export const fetchContentVersion = createAction<FetchContentVersion>('FETCH_CONTENT_VERSION');
export const fetchContentVersionComplete = createAction<any>('FETCH_CONTENT_VERSION_COMPLETE');
export const fetchContentVersionFailed = createAction<any>('FETCH_CONTENT_VERSION_FAILED');
//endregion

//region Compare Versions
export const showCompareVersionsDialog = createAction<Partial<CompareVersionsDialogStateProps>>('SHOW_COMPARE_VERSIONS_DIALOG');
export const closeCompareVersionsDialog = createAction<StandardAction>('CLOSE_COMPARE_VERSIONS_DIALOG');
//endregion
