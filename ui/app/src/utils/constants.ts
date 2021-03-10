/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

// region State
export const STATE_MASK_NEW_MASK = 0b1;
export const STATE_MASK_MODIFIED_MASK = 0b10;
export const STATE_MASK_DELETED_MASK = 0b100;
export const STATE_MASK_LOCKED_MASK = 0b1000;
export const STATE_MASK_SYSTEM_PROCESSING_MASK = 0b10000;
export const STATE_MASK_IN_WORKFLOW_MASK = 0b100000;
export const STATE_MASK_SCHEDULED_MASK = 0b1000000;
export const STATE_MASK_STAGED_MASK = 0b10000000;
export const STATE_MASK_LIVE_MASK = 0b100000000;
export const STATE_MASK_TRANSLATION_UP_TO_DATE_MASK = 0b1000000000;
export const STATE_MASK_TRANSLATION_PENDING_MASK = 0b10000000000;
export const STATE_MASK_TRANSLATION_IN_PROGRESS_MASK = 0b100000000000;
export const STATE_MASK_SUBMITTED_MASK = 0b1000000000000;
// endregion

// region Available Actions Content
export const READ_ACTION_MASK = 0b1;
export const COPY_ACTION_MASK = 0b10;
export const HISTORY_ACTION_MASK = 0b100;
export const DEPENDENCIES_ACTION_MASK = 0b1000;
export const REQUEST_PUBLISH_ACTION_MASK = 0b10000;
export const CREATE_ACTION_MASK = 0b100000;
export const PASTE_ACTION_MASK = 0b1000000;
export const EDIT_ACTION_MASK = 0b10000000;
export const RENAME_ACTION_MASK = 0b100000000;
export const CUT_ACTION_MASK = 0b1000000000;
export const UPLOAD_ACTION_MASK = 0b10000000000;
export const DUPLICATE_ACTION_MASK = 0b100000000000;
export const CHANGE_TYPE_ACTION_MASK = 0b1000000000000;
export const REVERT_ACTION_MASK = 0b1000000000000;
export const EDIT_CONTROLLER_ACTION_MASK = 0b10000000000000;
export const EDIT_TEMPLATE_ACTION_MASK = 0b100000000000000;
export const CREATE_FOLDER_ACTION_MASK = 0b1000000000000000;
export const DELETE_ACTION_MASK = 0b10000000000000000;
export const DELETE_CONTROLLER_ACTION_MASK = 0b100000000000000000;
export const DELETE_TEMPLATE_ACTION_MASK = 0b100000000000000000;
export const APPROVE_ACTION_MASK = 0b1000000000000000000;
export const APPROVE_PUBLISH_ACTION_MASK = 0b10000000000000000000;
export const SCHEDULE_PUBLISH_ACTION_MASK = 0b10000000000000000000;
// endregion
