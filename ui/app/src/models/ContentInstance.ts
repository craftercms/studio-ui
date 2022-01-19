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

export interface ContentInstanceSystemProps {
  id: string;
  path: string;
  label: string; // Internal name
  dateCreated: string;
  dateModified: string;
  contentTypeId: string;
  sourceMap?: { [fieldId: string]: string }; // fieldId: path
}

export interface ContentInstance {
  craftercms: ContentInstanceSystemProps;
  [fieldId: string]: any;
}

export type InstanceRecord = Record<string, string | number | boolean | any[]>;

// TODO: ContentInstance typing is too loose.
//  Something like this may be more suitable. Some compilation issues would arise, though.
//  export type ContentInstance = { craftercms: ContentInstanceSystemProps } & {
//    [fieldId: string]: number | string | boolean | object | Array<object | string>;
//  };

export default ContentInstance;
