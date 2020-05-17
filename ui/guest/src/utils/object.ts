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

import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';

export function notNullOrUndefined(value: any): boolean {
  return value != null;
}
export function isNullOrUndefined(value: any): boolean {
  return value == null;
}
export function pluckProps(source: object, ...props: string[]): object {
  const object = {};
  if (isNullOrUndefined(source)) {
    return object;
  }
  props.forEach((prop) => {
    if (notNullOrUndefined(source[prop])) {
      object[prop] = source[prop];
    }
  });
  return object;
}
export function reversePluckProps(source: object, ...props: string[]): object {
  const object = {};
  if (isNullOrUndefined(source)) {
    return object;
  }
  for (let key in source) {
    if (!props.includes(key) && source.hasOwnProperty(key)) {
      object[key] = source[key];
    }
  }
  return object;
}
export function retrieveProperty(object: object, prop: string): any {
  return (object == null)
    ? null
    : (!prop)
      ? object
      : prop.split('.').reduce((value, prop) => value[prop], object);
}
export function deleteProperty<T, P extends keyof T>(object: T, prop: P): Omit<T, P> {
  delete object[prop];
  return object;
}
export function setProperty(object: object, prop: string, value: any): boolean {
  if (object) {
    const props = prop.split('.');
    const propToSet = props.pop();
    let target = retrieveProperty(object, props.join('.'));
    if (!target) {
      setProperty(object, props.join('.'), {});
      target = retrieveProperty(object, props.join('.'));
    }
    target[propToSet] = value;
    return true;
  }
  return false;
}
export function createLookupTable<T>(list: T[], idProp: string = 'id'): LookupTable<T> {
  const table = {};
  list.forEach((item) => {
    table[retrieveProperty(item as any, idProp)] = item;
  });
  return table;
}
