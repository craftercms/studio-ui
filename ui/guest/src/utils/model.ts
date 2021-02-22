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

import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { isNullOrUndefined, retrieveProperty, setProperty } from './object';
import { removeLastPiece } from './string';

const systemPropList = ['id', 'path', 'contentTypeId', 'dateCreated', 'dateModified', 'label'];

export function prop(model: ContentInstance, propName: string): string {
  if (model == null) {
    return null;
  } else if (systemPropList.includes(propName)) {
    propName = `craftercms.${propName}`;
  }
  return retrieveProperty(model, propName);
}

export function value(model: ContentInstance, fieldId: string, newValue?: unknown, index?: string | number): any {
  // TODO: GraphQL transforms names as left-rail_o to left__rail_o.
  // This transform is potentially unreliable. We should discuss approach.
  const cleanFieldId = fieldId.replace(/-/g, '__');
  if (cleanFieldId !== fieldId && retrieveProperty(model, cleanFieldId)) {
    fieldId = cleanFieldId;
  }
  if (newValue !== undefined) {
    setProperty(model, fieldId, newValue, index);
  }
  return retrieveProperty(model, fieldId);
}

export function extractCollection(model: ContentInstance, fieldId: string, index: number | string): string[] {
  return extractCollectionPiece(model, fieldId, removeLastPiece(`${index}`));
}

export function extractCollectionItem(model: ContentInstance, fieldId: string, index: number | string): string[] {
  const indexes = index === '' || isNullOrUndefined(index) ? [] : `${index}`.split('.').map((i) => parseInt(i));
  const fields = fieldId.split('.');
  if (indexes.length > fields.length) {
    throw new Error(
      '[ModelHelper.extractCollectionItem] The number of indexes surpasses the number ' +
        `of nested properties on model id "${prop(model, 'id')}", field id "${fieldId}". ` +
        `Supplied index path was ${index}. `
    );
  }
  if (Math.abs(indexes.length - fields.length) > 1) {
    throw new Error(
      '[extractCollectionItem] The number of indexes and number of nested props mismatch ' +
        `by more than 1 on "${prop(model, 'id')}", field id "${fieldId}". ` +
        `Supplied index path was ${index}. Number of nested props may be greater by no more than one ` +
        'than the number of nested indexes.'
    );
  }
  return extractCollectionPiece(model, fieldId, index);
}

export function getContentTypeId(model: ContentInstance): string {
  return model?.craftercms?.contentTypeId;
}

export function isEmbedded(model: ContentInstance): boolean {
  return isNullOrUndefined(prop(model, 'path'));
}

function extractCollectionPiece(model: ContentInstance, fieldId: string, index: number | string): string[] {
  const indexes = index === '' || isNullOrUndefined(index) ? [] : `${index}`.split('.').map((i) => parseInt(i, 10));
  if (indexes.length === 0) {
    return retrieveProperty(model, fieldId);
  }
  const fields = fieldId.split('.');
  let aux = model;
  if (indexes.length > fields.length) {
    // There's more indexes than fields
    throw new Error(
      '[content/extractNode] Path not handled: indexes.length > fields.length. Indexes ' +
        `is ${indexes} and fields is ${fields}`
    );
  }
  indexes.forEach((index, i) => {
    const field = fields[i];
    aux = aux[field][index];
  });
  if (indexes.length === fields.length) {
    // @ts-ignore TODO: Fix type
    return aux;
  } else if (indexes.length < fields.length) {
    // There's one more field to use as there were less indexes
    // than there were fields. For example: fieldId: `items_o.content_o`, index: 0
    // At this point, aux would be `items_o[0]` and we need to extract `content_o`
    const field = fields[fields.length - 1];
    return aux[field];
  }
}
