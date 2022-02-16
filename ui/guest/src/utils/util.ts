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

import { ICERecord } from '../models/InContextEditing';
import { pluckProps } from '@craftercms/studio-ui/utils/object';

export const foo = (...args: any[]) => void null;
export const //
  X_AXIS = 'X',
  Y_AXIS = 'Y',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  TOLERANCE_PERCENTS = { x: 5, y: 5 },
  DEFAULT_RECORD_DATA: ICERecord = {
    id: null,
    modelId: null,
    fieldId: null,
    index: null,
    recordType: null
  };

export function not(condition: boolean): boolean {
  return !condition;
}

export function createLocationArgument() {
  return pluckProps(
    window.location,
    'hash',
    'host',
    'hostname',
    'href',
    'origin',
    'pathname',
    'port',
    'protocol',
    'search'
  );
}
