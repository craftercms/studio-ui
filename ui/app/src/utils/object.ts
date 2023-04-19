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

import { camelize } from './string';
import { LookupTable } from '../models/LookupTable';
import { MutableRefObject } from 'react';
import { EntityState } from '../models/EntityState';
import queryString, { StringifyOptions } from 'query-string';

export function pluckProps<T extends object, K extends keyof T>(
  source: T,
  omitNull: boolean,
  ...props: K[]
): Pick<T, K>;
export function pluckProps<T extends object, K extends keyof T>(source: T, ...props: K[]): Pick<T, K>;
export function pluckProps<T extends object, K extends keyof T>(source: T, ...props: K[]): Pick<T, K> {
  let omitNull = false;
  const object: any = {};
  if (!source) {
    return object;
  }
  if (typeof props[0] === 'boolean') {
    omitNull = true;
    props.shift();
  }
  props.forEach((_prop_) => {
    const prop = String(_prop_);
    const propName = prop.substr(prop.lastIndexOf('.') + 1);
    const value = retrieveProperty(source, prop);
    if (nnou(value) || !omitNull) {
      object[propName] = value;
    }
  });
  return object;
}

export function reversePluckProps<T, K extends keyof T = any>(source: T, ...props: K[]): Omit<T, K>;
export function reversePluckProps(source: object, ...props: any[]): object {
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

export function flattenHierarchical<T>(root: T | T[], childrenProp = 'children'): T[] {
  return (Array.isArray(root) ? root : [root]).flatMap((node) =>
    Boolean(node) ? [node, ...flattenHierarchical(node[childrenProp] ?? [], childrenProp)] : null
  );
}

export function hierarchicalToLookupTable<T>(root: T | T[], childrenProp = 'children', idProp = 'id'): LookupTable<T> {
  return createLookupTable(normalizeProp(flattenHierarchical(root, childrenProp), idProp, childrenProp), idProp);
}

// TODO: Types here could be better.
export function normalizeProp<T>(list: T[], idProp = 'id', normalizeTargetProp = 'children'): T[] {
  return list.map((item) => ({
    ...item,
    [normalizeTargetProp]: item[normalizeTargetProp]?.map((child) => child[idProp])
  }));
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
  value: V
): T {
  if (object) {
    const props = prop.split('.');
    const propToSet = props.pop();
    let target = retrieveProperty(object, props.join('.'));
    if (!target) {
      setProperty(object, props.join('.'), {});
      target = retrieveProperty(object, props.join('.'));
    }
    target[propToSet] = value;
  }
  return object;
}

let UND;

// Not Null Or Undefined (nnou)
export function nnou(object: any): boolean {
  return object !== null && object !== UND;
}

export const notNullOrUndefined = nnou;

// Null Or Undefined (nou)
export function nou(object: any): boolean {
  return object === null || object === UND;
}

export const nullOrUndefined = nou;

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

export function ref<T = any>(ref: MutableRefObject<T>): T {
  return ref.current;
}

export function isPlainObject<T extends any>(obj: T): boolean {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

/** @deprecated Use extend(target, source) */
export function extendDeep(target, source) {
  return extend(target, source, { deep: true });
}

/** @deprecated Use extend(target, source, { existingOnly: true }) */
export function extendDeepExistingProps(target, source) {
  return extend(target, source, { existingOnly: true });
}

export function extend(
  target: object,
  source: object,
  options?: {
    deep?: boolean;
    existingOnly?: boolean;
  }
) {
  options = Object.assign({ existingOnly: false, deep: true }, options);
  if (!options.deep) {
    return Object.assign(target, source);
  }
  for (let prop in source) {
    if (source.hasOwnProperty(prop) && (!options.existingOnly || (options.existingOnly && prop in target))) {
      if (prop in target && isPlainObject(target[prop]) && isPlainObject(source[prop])) {
        extend(target[prop], source[prop]);
      } else {
        target[prop] = source[prop];
      }
    }
  }
  return target;
}

export function toQueryString<T extends {} = {}>(args: T, options?: StringifyOptions & { prefix?: string }): string {
  if (!args) {
    return '';
  }
  options = { prefix: '?', ...options };
  return `${options.prefix}${queryString.stringify(args, options)}`;
}

export function applyDeserializedXMLTransforms<T extends object = {}>(
  target: T,
  options: { arrays?: string[]; lookupTables?: string[]; renameTable?: LookupTable<string> }
): T {
  const { arrays, lookupTables, renameTable } = options;
  const newObject = {} as T;
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
      let newName = renameTable?.[prop] ?? prop;
      if (arrays?.includes(newName)) {
        if (typeof target[prop] === 'string') {
          newObject[newName] = [];
        } else if (
          // @ts-ignore
          target[prop]._preserve === 'true'
        ) {
          newObject[newName] = target[prop];
          delete newObject[newName]._preserve;
        } else {
          const keys = Object.keys(target[prop]);
          const childName = keys[0];
          newObject[newName] = Array.isArray(target[prop][childName])
            ? target[prop][childName]
            : [target[prop][childName]];
          newObject[newName] = newObject[newName].map((item) =>
            typeof item === 'object' ? applyDeserializedXMLTransforms(item, options) : item
          );
        }
      } else if (lookupTables?.includes(newName)) {
        if (typeof target[prop] === 'string') {
          newObject[newName] = {};
        } else {
          const keys = Object.keys(target[prop]);
          const childName = keys[0];
          if (Array.isArray(target[prop][childName])) {
            // Assume single key as in `{ lookupTableKeyName: { childName: [{}, {}, {}] } }`
            const tempArray = target[prop][childName]
              .filter(Boolean)
              .map((item) => applyDeserializedXMLTransforms(item, options));
            newObject[newName] = createLookupTable(tempArray);
          } else {
            // Assume multiple keys that will be used as the index
            newObject[newName] = {};
            keys.forEach((key) => {
              newObject[newName][key] = applyDeserializedXMLTransforms(target[prop][key], options);
            });
          }
        }
      } else {
        newObject[newName] =
          typeof target[prop] === 'object'
            ? applyDeserializedXMLTransforms(target[prop] as any, options)
            : target[prop];
      }
    }
  }
  return newObject;
}

export function deepCopy<T extends object = any>(target: T): T {
  return JSON.parse(JSON.stringify(target));
}

export const foo = {};

export function isApiResponse(source: object): boolean {
  source = source ?? {};
  return (
    Object.prototype.hasOwnProperty.call(source, 'code') && Object.prototype.hasOwnProperty.call(source, 'message')
  );
}

export function isAjaxError(source: object): boolean {
  source = source ?? {};
  return (
    Object.prototype.hasOwnProperty.call(source, 'message') &&
    Object.prototype.hasOwnProperty.call(source, 'status') &&
    Object.prototype.hasOwnProperty.call(source, 'name')
  );
}
