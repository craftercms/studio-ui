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

import { LookupTable } from './LookupTable';

export interface ContentTypeSection {
  title: string;
  fields: string[];
  description: string;
  expandByDefault: boolean;
}

export interface ContentTypeFieldValidation<T = any> {
  id: string;
  value: T;
  level: 'required' | 'suggestion';
}

export type ValidationKeys =
  | 'allowedContentTypeTags'
  | 'allowedContentTypes' // TODO: assess removing this validation in favour of keeping allowedEmbeddedContentTypes & allowedSharedContentTypes only
  | 'allowedEmbeddedContentTypes'
  | 'allowedSharedContentTypes'
  | 'minCount'
  | 'maxCount'
  | 'maxLength'
  | 'readOnly'
  | 'required'
  | 'width'
  | 'height'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'minValue'
  | 'maxValue'
  | 'dropTargetsNotFound'
  | 'registerNotFound'
  | 'allowImagesFromRepo'
  | 'allowImageUpload'
  | 'allowVideosFromRepo'
  | 'allowVideoUpload';

export type ContentTypeFieldValidations = {
  [key in ValidationKeys]: ContentTypeFieldValidation;
};

export interface ValidationResult {
  id:
    | ValidationKeys
    | 'outOfSyncContent'
    | 'itemLocked'
    | 'noPolicyComply'
    | 'fileNameChangedPolicy'
    | 'uploadError'
    | 'assetUploadStarted';
  level?: 'required' | 'suggestion' | 'info';
  values?: object;
}

export interface ContentTypeField {
  id: string;
  name: string;
  description?: string;
  type: string;
  sortable?: boolean;
  validations: Partial<ContentTypeFieldValidations>;
  properties?: LookupTable;
  defaultValue: any;
  fields?: LookupTable<ContentTypeField>;
  values?: { label: string; value: string }[];
  helpText?: string;
  // localized: boolean;
  // disabled: boolean;
  // readOnly: boolean;
  // mapsTo: string;
  // mapsToType: string;
  // mapsToTarget: string;
  // editor: string;
}

export interface ContentTypeRepeatField extends ContentTypeField {
  fields: LookupTable<ContentTypeField>;
}

export interface DataSource {
  id: string;
  name: string;

  [prop: string]: any;
}

export type LegacyComponentType = 'component' | 'page' | 'file';

export interface ContentType {
  id: string;
  name: string;
  type: LegacyComponentType;
  quickCreate: boolean;
  quickCreatePath: string;
  displayTemplate: string;
  sections: ContentTypeSection[];
  fields: LookupTable<ContentTypeField>;
  dataSources: DataSource[];
  mergeStrategy: string;
}

export interface LegacyFormDefinitionProperty {
  label?: string; // => display name
  name: string; // => id
  type: string;
  value: string;
}

export interface LegacyFormDefinitionField {
  constraints: {
    constraint: LegacyFormDefinitionProperty | Array<LegacyFormDefinitionProperty>;
  };
  defaultValue: string;
  description: string;
  help: string;
  iceId: string;
  id: string;
  properties: {
    property: LegacyFormDefinitionProperty | Array<LegacyFormDefinitionProperty>;
  };
  title: string;
  type: string;
  fields?: {
    field: LegacyFormDefinitionField | Array<LegacyFormDefinitionField>;
  };
  // Repeat groups carry these both at the top and inside of "properties" (duplicated)
  minOccurs?: string;
  maxOccurs?: string;
}

export interface LegacyFormDefinitionSection {
  defaultOpen: 'true' | 'false';
  description: string;
  fields: {
    field: LegacyFormDefinitionField | Array<LegacyFormDefinitionField>;
  };
  title: string;
}

export interface LegacyDataSource {
  id: string; // id within the form
  title: string; // display name for authors
  type: string; // data source id
  interface: string; // ?
  properties: { property: LegacyFormDefinitionProperty[] | LegacyFormDefinitionProperty };
}

export interface LegacyFormDefinition {
  // As returned by `/studio/api/1/services/api/1/site/get-configuration.json?site=${site}&path=/content-types/.../form-definition.xml`
  title: string; // e.g. Page - Home
  'content-type': string; // e.g. /page/home
  description: string; // e.g. ""
  imageThumbnail: string; // e.g. page-home.png
  objectType: string; // e.g. page
  quickCreate: 'true' | 'false';
  quickCreatePath: string; // e.g. /site/pages
  sections: {
    section: LegacyFormDefinitionSection | Array<LegacyFormDefinitionSection>;
  };
  properties: {
    property: LegacyFormDefinitionProperty[] | LegacyFormDefinitionProperty;
  };
  datasources: { datasource: LegacyDataSource | Array<LegacyDataSource> };
}

// As returned by `/studio/api/1/services/api/1/content/get-content-types.json?site=${site}`
export interface LegacyContentType {
  allowedRoles: string[];
  contentAsFolder: boolean;
  copyDepedencyPattern: string[];
  deleteDependencyPattern: string[];
  form: string;
  formPath: string;
  imageThumbnail: string;
  label: string;
  lastUpdated: string;
  modelInstancePath: string;
  name: string;
  noThumbnail: boolean;
  nodeRef: any;
  pathExcludes: string[];
  pathIncludes: string[];
  previewable: boolean;
  quickCreate: boolean;
  quickCreatePath: string;
  type: LegacyComponentType;
  useRoundedFolder: string;
}

export interface ComponentsDatasource extends LegacyDataSource {
  allowEmbedded: boolean;
  allowShared: boolean;
  baseBrowsePath: string;
  baseRepositoryPath: string;
  contentTypes: string;
  enableBrowse: boolean;
  enableSearch: boolean;
  tags: string;
}

export default ContentType;
