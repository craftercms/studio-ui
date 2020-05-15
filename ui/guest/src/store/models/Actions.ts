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

import { GuestStandardAction } from './GuestStandardAction';
import { SyntheticEvent } from 'react';
import { Record } from '../../models/InContextEditing';
import { ActionsObservable } from 'redux-observable';
import GuestReducer from './GuestReducer';

export type GuestActionTypes =
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
  | 'set_drop_position'
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
  | 'start_listening'
  | 'scrolling'
  | 'scrolling_stopped'
  | 'host_component_drag_started';

export type MouseEventAction = GuestStandardAction<{
  event: JQueryMouseEventObject | SyntheticEvent<Element, MouseEvent> | MouseEvent;
  record: Record;
}>;

export type WithRecordAction = GuestReducer<{
  record: Record;
}>;

export type MouseEventActionObservable = ActionsObservable<MouseEventAction>;
