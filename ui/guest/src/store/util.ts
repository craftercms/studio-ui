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

import { SyntheticEvent } from 'react';
import { EditingStatus } from '../constants';

export function dragOk(status): boolean {
  return [
    EditingStatus.SORTING_COMPONENT,
    EditingStatus.PLACING_NEW_COMPONENT,
    EditingStatus.PLACING_DETACHED_ASSET,
    EditingStatus.PLACING_DETACHED_COMPONENT,
    EditingStatus.UPLOAD_ASSET_FROM_DESKTOP
  ].includes(status);
}

export function unwrapEvent<T extends Event>(event: JQueryEventObject | SyntheticEvent | Event): T {
  // @ts-ignore
  return event?.originalEvent ?? event?.nativeEvent ?? event;
}
