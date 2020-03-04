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

import { ContentType } from './ContentType';
import { ContentInstance } from './ContentInstance';

export interface IceZone {
  element?: Element;
  field?: any;
  modelId?: string;
  label?: string;
  id?: number;
  index?: number;
  recordIds?: number[];
  contentType?: ContentType;
}

export interface Stats {
  currentDZ: Element;
  currentDZChildren: Element[];
  dropZones: Element[];
  dropZoneRects: DOMRect[];
  currentDZElementRect: DOMRect;
  currentDZChildrenRects: DOMRect[];
  record: Record;
  $dropMarker: JQuery;
  draggedElementIndex: number;
  draggedElement: Element;
  childArrangement: string;
  originDropZone: Element;
  receptacles: any;
}

export interface DropZone {
  element: Element;
  children: Element[];
  iceId: string | number;
  physicalRecordId: number;
  rect: DOMRect;
  arrangement: string;
  childrenRects: DOMRect[];
  origin?: any;
}

export interface DZStats {
  currentDZ: Element;
  currentDZChildren: Element[];
  currentDZElementRect: DOMRect;
  currentDZChildrenRects: DOMRect[];
}

export interface Record {
  modelId?: string;
  index?: number | string;
  fieldId?: string;
  id?: number;
  element?: Element;
  label?: string;
  iceIds?: number[];
  complete?: boolean;
  refCount?: number;
}

export interface HoverData {
  id: number;
  rect: DOMRect;
  label: string;
}

export interface ReferentialEntries extends Record {
  model: ContentInstance;
  contentType: ContentType;
  field: any;
  contentTypeId: string;

}
