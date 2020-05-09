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

import { LookupTable } from './LookupTable';

type LegacyComponentTypes = 'component' | 'page' | 'unknown';

export interface ContentTypeField {
  id: string;
  name: string;
  type: string;
  sortable: boolean;
  validations: {
    contentTypes: string[];
  };
  defaultValue: string;
  required: boolean;
  fields?: LookupTable<ContentTypeField>;
  values?: { label: string, value: string }[];
  helpText?: string;
  // localized: boolean;
  // disabled: boolean;
  // readonly: boolean;
  // mapsTo: string;
  // mapsToType: string;
  // mapsToTarget: string;
  // editor: string;
}

export interface ContentTypeSection {
  title: string;
  fields: string[];
  description: string;
  expandByDefault: string;
}

export interface DataSource {
  id: string;
  name: string;
  [prop: string]: any;
}

export interface ContentType {
  id: string;
  name: string;
  type: LegacyComponentTypes;
  quickCreate: boolean;
  quickCreatePath: string;
  displayTemplate: string;
  sections: ContentTypeSection[];
  fields: LookupTable<ContentTypeField>;
  dataSources: DataSource[];
  mergeStrategy: string;
}

export interface Asset {
  path: string;
  name: string;
  type: string;
  mimeType: string;
  previewUrl: string;
  lastModifier: string;
  lastModified: string;
  size: number;
  snippets: unknown;
}

export interface ContentTypeReceptacle {
  modelId: string;
  fieldId: string;
  label: string;
  id: number;
  contentTypeId: string;

  [prop: string]: any;
}
