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

// region State
//                                                          6 |    5    |    4    |    3    |    2    |    1    |     0
//                                                         321|987654321|987654321|987654321|987654321|987654321|9876543210
import PluginDescriptorWithSource from '../models/PluginDescriptorWithSource';
import WidgetRecord from '../models/WidgetRecord';

export const STATE_NEW_MASK /*                      */ = 0b0000000000000000000000000000000000000000000000000000000000000001;
export const STATE_MODIFIED_MASK /*                 */ = 0b0000000000000000000000000000000000000000000000000000000000000010;
export const STATE_DELETED_MASK /*                  */ = 0b0000000000000000000000000000000000000000000000000000000000000100;
export const STATE_LOCKED_MASK /*                   */ = 0b0000000000000000000000000000000000000000000000000000000000001000;
export const STATE_SYSTEM_PROCESSING_MASK /*        */ = 0b0000000000000000000000000000000000000000000000000000000000010000;
export const STATE_SUBMITTED_MASK /*                */ = 0b0000000000000000000000000000000000000000000000000000000000100000; // <<= Submitted (STATE_IN_WORKFLOW_MASK)
export const STATE_SCHEDULED_MASK /*                */ = 0b0000000000000000000000000000000000000000000000000000000001000000;
export const STATE_PUBLISHING_MASK /*               */ = 0b0000000000000000000000000000000000000000000000000000000010000000;
export const PUBLISHING_DESTINATION_MASK /*         */ = 0b0000000000000000000000000000000000000000000000000000000100000000;
export const PUBLISHING_STAGED_MASK /*              */ = 0b0000000000000000000000000000000000000000000000000000001000000000;
export const PUBLISHING_LIVE_MASK /*                */ = 0b0000000000000000000000000000000000000000000000000000010000000000;
export const STATE_DISABLED_MASK /*                 */ = 0b0000000000000000000000000000000000000000000000000000100000000000;
// 12 Reserved                                           0b0000000000000000000000000000000000000000000000000001000000000000;
// 13 Reserved                                           0b0000000000000000000000000000000000000000000000000010000000000000;
// 14 Reserved                                           0b0000000000000000000000000000000000000000000000000100000000000000;
// 15 Reserved                                           0b0000000000000000000000000000000000000000000000001000000000000000;
// 16 Reserved                                           0b0000000000000000000000000000000000000000000000010000000000000000;
// 17 Reserved                                           0b0000000000000000000000000000000000000000000000100000000000000000;
// 18 Reserved                                           0b0000000000000000000000000000000000000000000001000000000000000000;
// 19 Reserved                                           0b0000000000000000000000000000000000000000000010000000000000000000;
// 20 Reserved                                           0b0000000000000000000000000000000000000000000100000000000000000000;
// 21 Reserved                                           0b0000000000000000000000000000000000000000001000000000000000000000;
// 22 Reserved                                           0b0000000000000000000000000000000000000000010000000000000000000000;
// 23 Reserved                                           0b0000000000000000000000000000000000000000100000000000000000000000;
export const STATE_TRANSLATION_UP_TO_DATE_MASK /*   */ = 0b0000000000000000000000000000000000000001000000000000000000000000;
export const STATE_TRANSLATION_PENDING_MASK /*      */ = 0b0000000000000000000000000000000000000010000000000000000000000000;
export const STATE_TRANSLATION_IN_PROGRESS_MASK /*  */ = 0b0000000000000000000000000000000000000100000000000000000000000000;
// endregion

// Backend counterpart
// @see https://github.com/craftercms/studio/blob/develop/src/main/java/org/craftercms/studio/api/v2/security/ContentItemAvailableActionsConstants.java

// region Available Actions Content
//                                                          6 |    5    |    4    |    3    |    2    |    1    |     0
//                                                         321|987654321|987654321|987654321|987654321|987654321|9876543210
export const READ_MASK /*                            */ = 0b000000000000000000000000000000000000000000000000000000000000001;
export const CONTENT_COPY_MASK /*                    */ = 0b000000000000000000000000000000000000000000000000000000000000010;
export const CONTENT_READ_VERSION_HISTORY_MASK /*    */ = 0b000000000000000000000000000000000000000000000000000000000000100;
export const CONTENT_GET_DEPENDENCIES_ACTION_MASK /* */ = 0b000000000000000000000000000000000000000000000000000000000001000;
export const PUBLISH_REQUEST_MASK /*                 */ = 0b000000000000000000000000000000000000000000000000000000000010000;
export const CONTENT_CREATE_MASK /*                  */ = 0b000000000000000000000000000000000000000000000000000000000100000;
export const CONTENT_PASTE_MASK /*                   */ = 0b000000000000000000000000000000000000000000000000000000001000000;
export const CONTENT_EDIT_MASK /*                    */ = 0b000000000000000000000000000000000000000000000000000000010000000;
export const CONTENT_RENAME_MASK /*                  */ = 0b000000000000000000000000000000000000000000000000000000100000000;
export const CONTENT_CUT_MASK /*                     */ = 0b000000000000000000000000000000000000000000000000000001000000000;
export const CONTENT_UPLOAD_MASK /*                  */ = 0b000000000000000000000000000000000000000000000000000010000000000;
export const CONTENT_DUPLICATE_MASK /*               */ = 0b000000000000000000000000000000000000000000000000000100000000000;
export const CONTENT_CHANGE_TYPE_MASK /*             */ = 0b000000000000000000000000000000000000000000000000001000000000000;
export const CONTENT_REVERT_MASK /*                  */ = 0b000000000000000000000000000000000000000000000000010000000000000;
export const CONTENT_EDIT_CONTROLLER_MASK /*         */ = 0b000000000000000000000000000000000000000000000000100000000000000;
export const CONTENT_EDIT_TEMPLATE_MASK /*           */ = 0b000000000000000000000000000000000000000000000001000000000000000;
export const FOLDER_CREATE_MASK /*                   */ = 0b000000000000000000000000000000000000000000000010000000000000000;
export const CONTENT_DELETE_MASK /*                  */ = 0b000000000000000000000000000000000000000000000100000000000000000;
export const CONTENT_DELETE_CONTROLLER_MASK /*       */ = 0b000000000000000000000000000000000000000000001000000000000000000;
export const CONTENT_DELETE_TEMPLATE_MASK /*         */ = 0b000000000000000000000000000000000000000000010000000000000000000;
export const PUBLISH_MASK /*                         */ = 0b000000000000000000000000000000000000000000100000000000000000000;
export const PUBLISH_APPROVE_MASK /*                 */ = 0b000000000000000000000000000000000000000001000000000000000000000;
export const PUBLISH_SCHEDULE_MASK /*                */ = 0b000000000000000000000000000000000000000010000000000000000000000;
export const PUBLISH_REJECT_MASK /*                  */ = 0b000000000000000000000000000000000000000100000000000000000000000;
export const CONTENT_ITEM_UNLOCK /*                  */ = 0b000000000000000000000000000000000000001000000000000000000000000;
// endregion

export const UNDEFINED: undefined = void 0;

export const PREVIEW_URL_PATH = '/preview';

// The `scripts_o` field id has a special mapping in Engine. People use the node-selector control to include
// groovy scripts. These aren't actually components and should be treated differently.
export const pageControllersFieldId = 'scripts_o';
export const pageControllersLegacyFieldId = 'scripts';

export const SHARED_WORKER_NAME = 'CrafterCMS-Worker';
export const SITE_COOKIE_NAME = 'crafterSite';
export const XSRF_TOKEN_HEADER_NAME = 'X-XSRF-TOKEN';
export const XSRF_TOKEN_COOKIE_NAME = 'XSRF-TOKEN';

export const plugins = new Map<string, PluginDescriptorWithSource>();

export const components = new Map<string, WidgetRecord>();

export const MAX_CONFIG_SIZE = 524288; // Max configuration file size allowed (in bytes) (512 * 1024 = 524288)

export const PROJECT_PREVIEW_IMAGE_UPDATED = 'ProjectPreviewImageUpdated';

export enum Routes {
  Projects = '/projects',
  Users = '/users',
  Groups = '/groups',
  Audit = '/audit',
  LogLevel = '/logging',
  LogConsole = '/log',
  GlobalConfig = '/global-config',
  EncryptTool = '/encryption-tool',
  TokenManagement = '/token-management',
  About = '/about-us',
  Settings = '/settings'
}
