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

import LookupTable from '../models/LookupTable';

export function forEach<T = any, R = undefined>(
  array: T[],
  fn: (item: T, index: number, array: T[]) => R | 'continue' | 'break' | undefined,
  emptyReturnValue?: R
): R {
  if (emptyReturnValue != null && array?.length === 0) {
    return emptyReturnValue;
  }
  for (let i = 0, l = array.length; i < l; i++) {
    const result = fn(array[i], i, array);
    if (result !== 'continue') {
      if (result === 'break') {
        break;
      } else if (result !== undefined) {
        return result;
      }
    }
  }
  return emptyReturnValue;
}

export function asArray<T = unknown>(value: T | T[]): T[] {
  return Boolean(value) ? (Array.isArray(value) ? value : [value]) : [];
}

export function createPresenceTable(list: string[]): LookupTable<boolean>;
export function createPresenceTable<T extends string | number | boolean>(list: string[], value: T): LookupTable<T>;
export function createPresenceTable<T extends any>(
  list: string[],
  valueGenerator: (listItem: string) => T
): LookupTable<T>;
export function createPresenceTable<T extends any = boolean, K extends any = ''>(
  list: K[],
  valueOrGenerator: string | number | boolean | ((listItem: string) => T),
  itemKeyGenerator: (value: K) => string
): LookupTable<T>;
export function createPresenceTable<T extends any = boolean, K extends any = ''>(
  list: K[],
  valueOrGenerator: string | number | boolean | ((listItem: string) => T) = true,
  itemKeyGenerator: (value: K) => string = (value) => value as string
): LookupTable<T> {
  const table = {};
  const callback =
    typeof valueOrGenerator === 'function'
      ? (value) => (table[itemKeyGenerator(value)] = valueOrGenerator(value))
      : (value) => (table[itemKeyGenerator(value)] = valueOrGenerator);
  list.forEach(callback);
  return table;
}

/**
 * Receives two different arrays of string, it will combine it selecting one string of the first array
 * and then other string of the second array, until there are no more strings
 * @param a
 * @param b
 */
export function mergeArraysAlternatively(a: string[], b: string[]): string[] {
  return (a.length > b.length ? a : b).reduce(
    (acc, cur, i) => (a[i] && b[i] ? [...acc, a[i], b[i]] : [...acc, cur]),
    []
  );
}
