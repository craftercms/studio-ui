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
export const STATE_NEW_MASK /*                      */ = 0b1;
export const STATE_MODIFIED_MASK /*                 */ = 0b10;
export const STATE_DELETED_MASK /*                  */ = 0b100;
export const STATE_LOCKED_MASK /*                   */ = 0b1000;
export const STATE_SYSTEM_PROCESSING_MASK /*        */ = 0b10000;
export const STATE_SUBMITTED_MASK /*                */ = 0b100000; // <<= Submitted (STATE_IN_WORKFLOW_MASK)
export const STATE_SCHEDULED_MASK /*                */ = 0b1000000;
export const PUBLISHING_STAGED_MASK /*              */ = 0b10000000;
export const PUBLISHING_LIVE_MASK /*                */ = 0b100000000;
export const STATE_TRANSLATION_UP_TO_DATE_MASK /*   */ = 0b1000000000;
export const STATE_TRANSLATION_PENDING_MASK /*      */ = 0b10000000000;
export const STATE_TRANSLATION_IN_PROGRESS_MASK /*  */ = 0b100000000000;
// endregion

// region Available Actions Content
export const READ_MASK /*                            */ = 0b1;
export const CONTENT_COPY_MASK /*                    */ = 0b10;
export const CONTENT_READ_VERSION_HISTORY_MASK /*    */ = 0b100;
export const CONTENT_GET_DEPENDENCIES_ACTION_MASK /* */ = 0b1000;
export const PUBLISH_REQUEST_MASK /*                 */ = 0b10000;
export const CONTENT_CREATE_MASK /*                  */ = 0b100000;
export const CONTENT_PASTE_MASK /*                   */ = 0b1000000;
export const CONTENT_EDIT_MASK /*                    */ = 0b10000000;
export const CONTENT_RENAME_MASK /*                  */ = 0b100000000;
export const CONTENT_CUT_MASK /*                     */ = 0b1000000000;
export const CONTENT_UPLOAD_MASK /*                  */ = 0b10000000000;
export const CONTENT_DUPLICATE_MASK /*               */ = 0b100000000000;
export const CONTENT_CHANGE_TYPE_MASK /*             */ = 0b1000000000000;
export const CONTENT_REVERT_MASK /*                  */ = 0b10000000000000;
export const CONTENT_EDIT_CONTROLLER_MASK /*         */ = 0b100000000000000;
export const CONTENT_EDIT_TEMPLATE_MASK /*           */ = 0b1000000000000000;
export const FOLDER_CREATE_MASK /*                   */ = 0b10000000000000000;
export const CONTENT_DELETE_MASK /*                  */ = 0b100000000000000000;
export const CONTENT_DELETE_CONTROLLER_MASK /*       */ = 0b1000000000000000000;
export const CONTENT_DELETE_TEMPLATE_MASK /*         */ = 0b10000000000000000000;
export const PUBLISH_MASK /*                         */ = 0b100000000000000000000;
export const PUBLISH_APPROVE_MASK /*                 */ = 0b1000000000000000000000;
export const PUBLISH_SCHEDULE_MASK /*                */ = 0b10000000000000000000000;
export const PUBLISH_REJECT_MASK /*                  */ = 0b100000000000000000000000;
export const CONTENT_ITEM_UNLOCK /*                  */ = 0b1000000000000000000000000;
// endregion
