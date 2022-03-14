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

import { ContentType, ContentTypeField, ValidationResult } from '@craftercms/studio-ui/models/ContentType';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';

export type RecordTypes = 'page' | 'component' | 'field' | 'repeat-item' | 'node-selector-item';

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

export interface ICEProps {
  path?: string;
  modelId: string;
  fieldId: string;
  index: string | number;
}

export interface BaseICERecord extends ICEProps {
  id: number;
}

export interface ICERecord extends BaseICERecord {
  recordType: RecordTypes;
}

export interface ICERecordRegistration {
  modelId: string;
  fieldId?: string;
  index?: string | number;
}

export interface ElementRecord extends Omit<BaseICERecord, 'fieldId'> {
  label: string;
  iceIds: number[];
  element: HTMLElement;
  complete: boolean;
  fieldId: string[];
  inherited: boolean;
}

export interface ElementRecordRegistration extends ICEProps {
  label?: string;
  element: HTMLElement;
}

export interface HighlightData {
  id: number;
  rect: DOMRect;
  label: string;
  inherited: boolean;
  validations: LookupTable<ValidationResult>;
}

export interface ReferentialEntries extends ICERecord {
  field: ContentTypeField;
  model: ContentInstance;
  contentType: ContentType;
  contentTypeId: string;
}
