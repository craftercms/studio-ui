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
import { HistoryDialogStateProps } from '../../modules/Content/History/HistoryDialog';
import { ViewVersionDialogStateProps } from '../../modules/Content/History/ViewVersionDialog';
import { FetchContentVersion } from '../../models/Version';
import { CompareVersionsDialogStateProps } from '../../modules/Content/History/CompareVersionsDialog';
import { ConfirmDialogStateProps } from '../../components/Dialogs/ConfirmDialog';
import { PublishDialogStateProps } from '../../modules/Content/Publish/PublishDialog';
import { DeleteDialogStateProps } from '../../modules/Content/Delete/DeleteDialog';
import { NewContentDialogStateProps } from '../../modules/Content/Authoring/NewContentDialog';
import { DependenciesDialogStateProps } from '../../modules/Content/Dependencies/DependenciesDialog';
import { SandboxItem } from '../../models/Item';

//region History
export const showHistoryDialog = createAction<Partial<HistoryDialogStateProps>>('SHOW_HISTORY_DIALOG');
export const changeHistoryDialogItem = createAction<SandboxItem>('CHANGE_HISTORY_DIALOG_ITEM');
export const closeHistoryDialog = createAction<StandardAction>('CLOSE_HISTORY_DIALOG');
export const historyDialogClosed = createAction('_DIALOG_CLOSED');
// endregion

//region View Versions
export const showViewVersionDialog = createAction<Partial<ViewVersionDialogStateProps>>('SHOW_VIEW_VERSION_DIALOG');
export const closeViewVersionDialog = createAction<StandardAction>('CLOSE_VIEW_VERSION_DIALOG');
// endregion

// region Fetch content
export const fetchContentVersion = createAction<FetchContentVersion>('FETCH_CONTENT_VERSION');
export const fetchContentVersionComplete = createAction<any>('FETCH_CONTENT_VERSION_COMPLETE');
export const fetchContentVersionFailed = createAction<any>('FETCH_CONTENT_VERSION_FAILED');
// endregion

//region Compare Versions
export const showCompareVersionsDialog = createAction<Partial<CompareVersionsDialogStateProps>>('SHOW_COMPARE_VERSIONS_DIALOG');
export const changeCompareVersionsDialogItem = createAction<SandboxItem>('CHANGE_COMPARE_VERSIONS_DIALOG_ITEM');
export const closeCompareVersionsDialog = createAction<StandardAction>('CLOSE_COMPARE_VERSIONS_DIALOG');
export const compareVersionsDialogClosed = createAction('COMPARE_VERSIONS_DIALOG_CLOSED');
//endregion

// region Confirm
export const showConfirmDialog = createAction<Partial<ConfirmDialogStateProps>>('SHOW_CONFIRM_DIALOG');
export const closeConfirmDialog = createAction<StandardAction>('CLOSE_CONFIRM_DIALOG');
export const confirmDialogClosed = createAction('CONFIRM_DIALOG_CLOSED');
// endregion

// region Publish
export const showPublishDialog = createAction<Partial<PublishDialogStateProps>>('SHOW_PUBLISH_DIALOG');
export const closePublishDialog = createAction<StandardAction>('CLOSE_PUBLISH_DIALOG');
export const publishDialogClosed = createAction('PUBLISH_DIALOG_CLOSED');
// endregion

// region Delete
export const showDeleteDialog = createAction<Partial<DeleteDialogStateProps>>('SHOW_DELETE_DIALOG');
export const closeDeleteDialog = createAction<StandardAction>('CLOSE_DELETE_DIALOG');
export const deleteDialogClosed = createAction('DELETE_DIALOG_CLOSED');
// endregion

// region New Content
export const showNewContentDialog = createAction<Partial<NewContentDialogStateProps>>('SHOW_NEW_CONTENT_DIALOG');
export const closeNewContentDialog = createAction<StandardAction>('CLOSE_NEW_CONTENT_DIALOG');
export const newContentDialogClosed = createAction('NEW_CONTENT_DIALOG_CLOSED');
// endregion

// region Dependencies
export const showDependenciesDialog = createAction<Partial<DependenciesDialogStateProps>>('SHOW_DEPENDENCIES_DIALOG');
export const closeDependenciesDialog = createAction<StandardAction>('CLOSE_DEPENDENCIES_DIALOG');
export const dependenciesDialogClosed = createAction('DEPENDENCIES_DIALOG_CLOSED');
// endregion
