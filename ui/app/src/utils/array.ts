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

import LookupTable from '../models/LookupTable';

export function forEach<T = any>(
  array: T[],
  fn: (item: T, index: number, array: T[]) => any,
  emptyReturnValue: any = undefined
): any {
  if (emptyReturnValue != null && array?.length === 0) {
    return emptyReturnValue;
  }
  for (let i = 0, l = array.length; i < l; i++) {
    const result = fn(array[i], i, array);
    if (result === 'continue') {
    } else if (result === 'break') {
      break;
    } else if (result !== undefined) {
      return result;
    }
  }
  return emptyReturnValue;
}

export function asArray<T = unknown>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function createPresenceTable(list: string[], valueGenerator: (listItem: string) => any): LookupTable<any> {
  const table = {};
  list.forEach((value) => (table[value] = valueGenerator ? valueGenerator(value) : true));
  return table;
}
