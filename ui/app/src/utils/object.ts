/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { camelize } from './string';
import { LookupTable } from '../models/LookupTable';
import { EntityState } from '../models/GlobalState';

export function pluckProps(source: object, ...props: string[]): object {
  const object = {};
  if (!source) {
    return object;
  }
  props.forEach((prop) => {
    const propName = prop.substr(prop.lastIndexOf('.') + 1);
    object[propName] = retrieveProperty(source, prop);
  });
  return object;
}

export function reversePluckProps(source: object, ...props: string[]): object {
  const object = {};
  if (!source) {
    return object;
  }
  for (let key in source) {
    if (!props.includes(key) && source.hasOwnProperty(key)) {
      object[key] = source[key];
    }
  }
  return object;
}

export function camelizeProps(obj: { [prop: string]: any }): object {
  return Object.entries(obj).reduce((camelized, [key, value]) => {
    camelized[camelize(key)] = value;
    return camelized;
  }, {});
}

export function createLookupTable<T>(list: T[], idProp: string = 'id'): LookupTable<T> {
  const table = {};
  list.forEach((item) => {
    table[retrieveProperty(item as any, idProp)] = item;
  });
  return table;
}

export function retrieveProperty(object: object, prop: string): any {
  return (object == null) ? null : prop.split('.').reduce((value, prop) => value[prop], object);
}

// Not Null Or Undefined (nnou)
export function nnou(object: any): boolean {
  return object != null;
}

// Null Or Undefined (nou)
export function nou(object: any): boolean {
  return object == null;
}

export function createEntityState(merge = {}): EntityState {
  return {
    byId: null,
    error: null,
    isFetching: null,
    ...merge
  };
}

export function resolveEntityCollectionFetch<T = any>(collection: Array<T>): EntityState<T> {
  return createEntityState({
    byId: createLookupTable<T>(collection)
  });
}
