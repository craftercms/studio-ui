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

// Not Null Or Undefined (nnou)
export function nnou(object: any): boolean {
  return object != null;
}

export const notNullOrUndefined = nnou;

export function nou(value: any): boolean {
  return value == null;
}

export const isNullOrUndefined = nou;

export function pluckProps<T extends object = {}, K extends keyof T = any>(source: T, ...props: K[]): Pick<T, K> {
  const object = {} as Pick<T, K>;
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

export function reversePluckProps<T extends object = {}, K extends keyof T = any>(
  source: T,
  ...props: K[]
): Omit<T, K> {
  const object = {} as Omit<T, K>;
  if (isNullOrUndefined(source)) {
    return object;
  }
  for (let key in source) {
    // @ts-ignore
    if (!props.includes(key) && source.hasOwnProperty(key)) {
      // @ts-ignore
      object[key] = source[key];
    }
  }
  return object;
}

export function retrieveProperty(object: object, prop: string): any {
  return object == null ? null : !prop ? object : prop.split('.').reduce((value, prop) => value[prop], object);
}

export function deleteProperty<T, P extends keyof T>(object: T, prop: P): Omit<T, P> {
  delete object[prop];
  return object;
}

export function setProperty<T extends object = {}, K extends string = string, V extends any = any>(
  object: T,
  prop: K,
  value: V,
  index?: number | string
): T {
  if (object) {
    const props = prop.split('.');
    const propToSet = props.pop();
    let target = retrieveProperty(object, props.join('.'));
    if (!target) {
      setProperty(object, props.join('.'), {}, index);
      target = retrieveProperty(object, props.join('.'));
    }

    if (index !== null && index !== undefined) {
      target[index][propToSet] = value;
    } else {
      target[propToSet] = value;
    }
  }
  return object;
}

export function createLookupTable<T>(list: T[], idProp: string = 'id'): LookupTable<T> {
  const table = {};
  list.forEach((item) => {
    table[retrieveProperty(item as any, idProp)] = item;
  });
  return table;
}
