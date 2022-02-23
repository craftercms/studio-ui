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

export enum EditingStatus {
  LISTENING = 'LISTENING',
  SORTING_COMPONENT = 'SORTING_COMPONENT',
  PLACING_NEW_COMPONENT = 'PLACING_NEW_COMPONENT',
  PLACING_DETACHED_COMPONENT = 'PLACING_DETACHED_COMPONENT',
  PLACING_DETACHED_ASSET = 'PLACING_DETACHED_ASSET',
  EDITING_COMPONENT = 'EDITING_COMPONENT',
  EDITING_COMPONENT_INLINE = 'EDITING_COMPONENT_INLINE',
  UPLOAD_ASSET_FROM_DESKTOP = 'UPLOAD_ASSET_FROM_DESKTOP',
  SHOW_DROP_TARGETS = 'SHOW_DROP_TARGETS',
  FIELD_SELECTED = 'FIELD_SELECTED',
  HIGHLIGHT_MOVE_TARGETS = 'HIGHLIGHT_MOVE_TARGETS'
}

export enum HighlightMode {
  ALL = 'all',
  MOVE_TARGETS = 'move'
}

export const editOnClass = 'craftercms-ice-on';
export const iceBypassKeyClass = 'craftercms-ice-bypass';
export const eventCaptureOverlayAttribute = 'data-craftercms-event-capture-overlay';
export const moveModeClass = `craftercms-highlight-${HighlightMode.MOVE_TARGETS}`;
export const editModeClass = `craftercms-highlight-${HighlightMode.ALL}`;
export const emptyCollectionClass = 'craftercms-empty-collection';
export const emptyFieldClass = 'craftercms-empty-field';
export const dragAndDropActiveClass = 'craftercms-drag-n-drop-active';
export const editModePaddingClass = 'craftercms-edit-mode-padding';
export const editModeIceBypassEvent = 'craftercms.iceBypass';
export const editModeEvent = 'craftercms.editMode';
