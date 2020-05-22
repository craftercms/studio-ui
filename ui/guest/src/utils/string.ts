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

export function capitalize(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.substr(1)}`;
}
export function removeLastPiece(str: string, splitChar: string = '.'): string {
  return str.substr(0, str.lastIndexOf(splitChar));
}
export function popPiece(str: string, splitChar: string = '.'): string {
  return str.substr(str.lastIndexOf(splitChar) + 1);
}
export function isBlank(str: string): boolean {
  return str === '';
}
