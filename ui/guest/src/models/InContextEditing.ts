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

import { ContentType, ContentTypeField, ValidationKeys } from '@craftercms/studio-ui/models/ContentType';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';

export interface DropZone {
  element: Element;
  children: Element[];
  iceId: string | number;
  elementRecordId: number;
  rect: DOMRect;
  arrangement: string;
  childrenRects: DOMRect[];
  origin?: any;
  validations: LookupTable<ValidationResult>;
}

export interface ValidationResult {
  id: ValidationKeys;
  level: 'required' | 'suggestion';
  values: object;
}

export interface ICEProps {
  path?: string;
  modelId: string;
  fieldId: string;
  index: string | number;
}

export interface BaseICERecord extends ICEProps {
  id: number;
}

export interface ICERecord extends BaseICERecord {}

export interface ICERecordRegistration {
  modelId: string;
  fieldId?: string;
  index?: string | number;
}

export interface ElementRecord extends Omit<BaseICERecord, 'fieldId'> {
  label: string;
  iceIds: number[];
  element: Element;
  complete: boolean;
  fieldId: string[];
  inherited: boolean;
}

export interface ElementRecordRegistration extends ICEProps {
  label?: string;
  element: Element;
}

export interface HighlightData {
  id: number;
  rect: DOMRect;
  label: string;
  inherited: boolean;
  validations: LookupTable<ValidationResult>;
}

export interface ReferentialEntries extends BaseICERecord {
  field: ContentTypeField;
  model: ContentInstance;
  contentType: ContentType;
  contentTypeId: string;
}
