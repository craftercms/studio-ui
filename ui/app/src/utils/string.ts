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

export function camelize(str: string) {
  return str.replace(/-+(.)?/g, function (match, chr) {
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

export function isJSON(str: string): boolean {
  throw new Error('[isJSON] Not implemented.');
}

export function getInitials(str: string) {
  const pieces = str.split(' ');
  return `${pieces[0].substr(0, 1)}${pieces[1] ? pieces[1].substr(0, 1) : ''}`.toUpperCase();
}

export default {
  camelize,
  capitalize,
  underscore,
  dasherize
};
