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

export type   GuestActionTypes =
// dom events
  | 'mouseover'
  | 'mouseleave'
  | 'dragstart'
  | 'dragover'
  | 'dragleave'
  | 'drop'
  | 'dragend'
  | 'click'
  | 'dblclick'
  // other
  | 'add_asset_types'
  | 'move_component'
  | 'insert_component'
  | 'insert_instance'
  | 'computed_dragend'
  | 'computed_dragover'
  | 'ice_zone_selected'
  | 'edit_component_inline'
  | 'exit_component_inline_edit'
  | 'desktop_asset_upload_progress'
  | 'desktop_asset_upload_complete'
  | 'set_edit_mode'
  | 'start_listening';
