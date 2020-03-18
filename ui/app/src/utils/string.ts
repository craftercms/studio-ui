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

export function camelize(str: string) {
  return str.replace(/-+(.)?/g, function(match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

export function underscore(str: string) {
  return str.replace(/::/g, '/')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
}

export function dasherize(str: string) {
  return str.replace(/_/g, '-');
}

export function isBlank(str: string): boolean {
  return str === '';
}

export function bytesToSize(bytes: number, seperator: string = '') {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(`${Math.floor(Math.log(bytes) / Math.log(1024))}`, 10);
  if (i === 0) return `${bytes}${seperator}${sizes[i]}`;
  return `${(bytes / (1024 ** i)).toFixed(1)}${seperator}${sizes[i]}`
}

export default {
  camelize,
  capitalize,
  underscore,
  dasherize
};
