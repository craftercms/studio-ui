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
import { WorkflowCancellationDialogStateProps } from '../../components/Dialogs/WorkflowCancellationDialog';
import { RejectDialogStateProps } from '../../components/Dialogs/RejectDialog';
import { LegacyCodeEditorDialogStateProps } from '../../components/Dialogs/LegacyCodeEditorDialog';
import { LegacyFormDialogStateProps } from '../../components/Dialogs/LegacyFormDialog';
import { EditSiteDialogStateProps } from '../../modules/System/Sites/Edit/EditSiteDialog';
import { CreateFolderStateProps } from '../../components/Dialogs/CreateFolderDialog';
import { CreateFileStateProps } from '../../components/Dialogs/CreateFileDialog';
import { UploadDialogStateProps } from '../../components/Dialogs/UploadDialog';
import { PreviewDialogStateProps } from '../../components/Dialogs/PreviewDialog';
import { PathSelectionDialogStateProps } from '../../components/Dialogs/PathSelectionDialog';
import { ChangeContentTypeDialogStateProps } from '../../modules/Content/Authoring/ChangeContentTypeDialog';
import { CopyDialogStateProps } from '../../components/Dialogs/CopyDialog';
import { ItemMenuStateProps } from '../../components/ItemMenu/ItemMenu';

// region History
export const showHistoryDialog = createAction<Partial<HistoryDialogStateProps>>('SHOW_HISTORY_DIALOG');
export const closeHistoryDialog = createAction<StandardAction>('CLOSE_HISTORY_DIALOG');
export const historyDialogClosed = createAction('HISTORY_DIALOG_CLOSED');
// endregion

// region View Versions
export const showViewVersionDialog = createAction<Partial<ViewVersionDialogStateProps>>('SHOW_VIEW_VERSION_DIALOG');
export const closeViewVersionDialog = createAction<StandardAction>('CLOSE_VIEW_VERSION_DIALOG');
export const viewVersionDialogClosed = createAction<StandardAction>('VERSION_DIALOG_CLOSED');
// endregion

// region Fetch content
export const fetchContentVersion = createAction<FetchContentVersion>('FETCH_CONTENT_VERSION');
export const fetchContentVersionComplete = createAction<any>('FETCH_CONTENT_VERSION_COMPLETE');
export const fetchContentVersionFailed = createAction<any>('FETCH_CONTENT_VERSION_FAILED');
// endregion

// region Compare Versions
export const showCompareVersionsDialog = createAction<Partial<CompareVersionsDialogStateProps>>(
  'SHOW_COMPARE_VERSIONS_DIALOG'
);
export const closeCompareVersionsDialog = createAction<StandardAction>('CLOSE_COMPARE_VERSIONS_DIALOG');
export const compareVersionsDialogClosed = createAction('COMPARE_VERSIONS_DIALOG_CLOSED');
// endregion

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
export const fetchDeleteDependencies = createAction<string[]>('FETCH_DELETE_DEPENDENCIES');
export const fetchDeleteDependenciesComplete = createAction('FETCH_DELETE_DEPENDENCIES_COMPLETE');
export const fetchDeleteDependenciesFailed = createAction('FETCH_DELETE_DEPENDENCIES_FAILED');
// endregion

// region New Content
export const showNewContentDialog = createAction<Partial<NewContentDialogStateProps>>('SHOW_NEW_CONTENT_DIALOG');
export const closeNewContentDialog = createAction<StandardAction>('CLOSE_NEW_CONTENT_DIALOG');
export const newContentDialogClosed = createAction('NEW_CONTENT_DIALOG_CLOSED');
// endregion

// region Change ContentType
export const showChangeContentTypeDialog = createAction<Partial<ChangeContentTypeDialogStateProps>>(
  'SHOW_CHANGE_CONTENT_TYPE_DIALOG'
);
export const CloseChangeContentTypeDialog = createAction<StandardAction>('CLOSE_CHANGE_CONTENT_TYPE_DIALOG');
export const ChangeContentTypeDialogClosed = createAction('CHANGE_CONTENT_TYPE_DIALOG_CLOSED');
// endregion

// region Dependencies
export const showDependenciesDialog = createAction<Partial<DependenciesDialogStateProps>>('SHOW_DEPENDENCIES_DIALOG');
export const closeDependenciesDialog = createAction<StandardAction>('CLOSE_DEPENDENCIES_DIALOG');
export const dependenciesDialogClosed = createAction('DEPENDENCIES_DIALOG_CLOSED');
// endregion

// region Workflow Cancellation
export const showWorkflowCancellationDialog = createAction<Partial<WorkflowCancellationDialogStateProps>>(
  'SHOW_WORKFLOW_CANCELLATION_DIALOG'
);
export const closeWorkflowCancellationDialog = createAction<StandardAction>('CLOSE_WORKFLOW_CANCELLATION_DIALOG');
export const workflowCancellationDialogClosed = createAction('WORKFLOW_CANCELLATION_DIALOG_CLOSED');

// region Reject
export const showRejectDialog = createAction<Partial<RejectDialogStateProps>>('SHOW_REJECT_DIALOG');
export const closeRejectDialog = createAction<StandardAction>('CLOSE_REJECT_DIALOG');
export const rejectDialogClosed = createAction('REJECT_DIALOG_CLOSED');
// endregion

// region Legacy Form
export const showEditDialog = createAction<Partial<LegacyFormDialogStateProps>>('SHOW_EDIT_DIALOG');
export const closeEditDialog = createAction<StandardAction>('CLOSE_EDIT_DIALOG');
export const editDialogClosed = createAction<StandardAction>('EDIT_DIALOG_CLOSED');
export const newContentCreationComplete = createAction<StandardAction>('NEW_CONTENT_CREATION_COMPLETE');
export const updateEditConfig = createAction<any>('UPDATE_EDIT_CONFIG');
// endregion

// region Legacy Code Editor
export const showCodeEditorDialog = createAction<Partial<LegacyCodeEditorDialogStateProps>>('SHOW_CODE_EDITOR_DIALOG');
export const closeCodeEditorDialog = createAction<StandardAction>('CLOSE_CODE_EDITOR_DIALOG');
export const codeEditorDialogClosed = createAction('CODE_EDITOR_DIALOG_CLOSED');
export const updateCodeEditorDialog = createAction<any>('UPDATE_CODE_EDITOR_DIALOG');
// endregion

// region Create Folder Dialog
export const showCreateFolderDialog = createAction<Partial<CreateFolderStateProps>>('SHOW_CREATE_FOLDER_DIALOG');
export const closeCreateFolderDialog = createAction<StandardAction>('CLOSE_CREATE_FOLDER_DIALOG');
export const createFolderDialogClosed = createAction('CREATE_FOLDER_DIALOG_CLOSED');
// endregion

// region Create File Dialog
export const showCreateFileDialog = createAction<Partial<CreateFileStateProps>>('SHOW_CREATE_FILE_DIALOG');
export const closeCreateFileDialog = createAction<StandardAction>('CLOSE_CREATE_FILE_DIALOG');
export const createFileDialogClosed = createAction('CREATE_FILE_DIALOG_CLOSED');
// endregion

// region Copy Dialog
export const showCopyDialog = createAction<Partial<CopyDialogStateProps>>('SHOW_COPY_DIALOG');
export const closeCopyDialog = createAction<StandardAction>('CLOSE_COPY_DIALOG');
export const copyDialogClosed = createAction('COPY_DIALOG_CLOSED');
// endregion

// region Upload Dialog
export const showUploadDialog = createAction<Partial<UploadDialogStateProps>>('SHOW_UPLOAD_DIALOG');
export const closeUploadDialog = createAction<StandardAction>('CLOSE_UPLOAD_DIALOG');
export const uploadDialogClosed = createAction('UPLOAD_DIALOG_CLOSED');
// endregion

// region Preview Dialog
export const showPreviewDialog = createAction<Partial<PreviewDialogStateProps>>('SHOW_PREVIEW_DIALOG');
export const updatePreviewDialog = createAction<Partial<PreviewDialogStateProps>>('UPDATE_PREVIEW_DIALOG');
export const closePreviewDialog = createAction<StandardAction>('CLOSE_PREVIEW_DIALOG');
export const previewDialogClosed = createAction('PREVIEW_DIALOG_CLOSED');
// endregion

// region Edit Site
export const showEditSiteDialog = createAction<Partial<EditSiteDialogStateProps>>('SHOW_EDIT_SITE_DIALOG');
export const closeEditSiteDialog = createAction<StandardAction>('CLOSE_EDIT_SITE_DIALOG');
export const editSiteDialogClosed = createAction('EDIT_SITE_DIALOG_CLOSED');
// endregion

// region Path Selection Dialog
export const showPathSelectionDialog = createAction<Partial<PathSelectionDialogStateProps>>(
  'SHOW_PATH_SELECTION_DIALOG'
);
export const closePathSelectionDialog = createAction<StandardAction>('CLOSE_PATH_SELECTION_DIALOG');
export const pathSelectionDialogClosed = createAction('PATH_SELECTION_CLOSED');
// endregion

// region Item Menu
export const showItemMenu = createAction<Partial<ItemMenuStateProps>>('SHOW_ITEM_MENU');
export const closeItemMenu = createAction<StandardAction>('CLOSE_ITEM_MENU');
export const itemMenuClosed = createAction('ITEM_MENU_CLOSED');

// endregion
