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

export enum EditingStatus {
  OFF = 'OFF',
  LISTENING = 'LISTENING',
  SORTING_COMPONENT = 'SORTING_COMPONENT',
  PLACING_NEW_COMPONENT = 'PLACING_NEW_COMPONENT',
  PLACING_DETACHED_COMPONENT = 'PLACING_DETACHED_COMPONENT',
  PLACING_DETACHED_ASSET = 'PLACING_DETACHED_ASSET',
  EDITING_COMPONENT = 'EDITING_COMPONENT',
  EDITING_COMPONENT_INLINE = 'EDITING_COMPONENT_INLINE',
  UPLOAD_ASSET_FROM_DESKTOP = 'UPLOAD_ASSET_FROM_DESKTOP',
  SHOW_RECEPTACLES = 'SHOW_RECEPTACLES'
}
