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

import { nnou, nou, retrieveProperty, setProperty } from './object';
import { removeLastPiece } from './string';
import ContentInstance from '../models/ContentInstance';
import LookupTable from '../models/LookupTable';
import { ModelHierarchyMap } from './content';
import { forEach } from './array';

const systemPropList = ['id', 'path', 'contentTypeId', 'dateCreated', 'dateModified', 'label'];

export function prop(model: ContentInstance, propName: string): string {
  if (model == null) {
    return null;
  } else if (systemPropList.includes(propName)) {
    propName = `craftercms.${propName}`;
  }
  return retrieveProperty(model, propName);
}

export function value(model: ContentInstance, fieldId: string, newValue?: unknown): any {
  // TODO: GraphQL transforms names as left-rail_o to left__rail_o.
  // This transform is potentially unreliable. We should discuss approach.
  const cleanFieldId = fieldId.replace(/-/g, '__');
  if (cleanFieldId !== fieldId && retrieveProperty(model, cleanFieldId)) {
    fieldId = cleanFieldId;
  }
  if (nnou(newValue)) {
    setProperty(model, fieldId, newValue);
  }
  return retrieveProperty(model, fieldId);
}

export function extractCollection(model: ContentInstance, fieldId: string, index: string | number): string[] {
  return extractCollectionPiece(model, fieldId, removeLastPiece(`${index}`));
}

export function extractCollectionItem(model: ContentInstance, fieldId: string, index: string | number) {
  const indexes = index === '' || nou(index) ? [] : `${index}`.split('.').map((i) => parseInt(i));
  const fields = fieldId.split('.');
  if (indexes.length > fields.length) {
    throw new Error(
      '[Model.extractCollectionItem] The number of indexes surpasses the number ' +
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
  return nou(prop(model, 'path'));
}

export function extractCollectionPiece(model: ContentInstance, fieldId: string, index: string | number) {
  const indexes = index === '' || nou(index) ? [] : `${index}`.split('.').map((i) => parseInt(i, 10));
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
    aux = aux[field]?.[index];
  });

  if (nou(aux)) {
    return aux;
  }

  if (indexes.length === fields.length) {
    return aux;
  } else if (indexes.length < fields.length) {
    // There's one more field to use as there were less indexes
    // than there were fields. For example: fieldId: `items_o.content_o`, index: 0
    // At this point, aux would be `items_o[0]` and we need to extract `content_o`
    const field = fields[fields.length - 1];
    return aux[field];
  }
}

export function isInheritedField(model: ContentInstance, fieldId: string) {
  return Boolean(model.craftercms.sourceMap?.[fieldId]);
}

export function getModelIdFromInheritedField(
  model: ContentInstance,
  fieldId: string,
  modelIdByPath: LookupTable<string>
) {
  return model.craftercms.sourceMap?.[fieldId]
    ? modelIdByPath[model.craftercms.sourceMap?.[fieldId]]
    : model.craftercms.id;
}

export function findParentModelId(
  modelId: string,
  hierarchyDescriptorLookup: ModelHierarchyMap,
  models: LookupTable<ContentInstance>
): string {
  const parentId = forEach(
    Object.entries(hierarchyDescriptorLookup),
    ([id, children]) => {
      if (nnou(children) && id !== modelId && children.children.includes(modelId)) {
        return id;
      }
    },
    null
  );
  return nnou(parentId)
    ? // If it has a path, it is not embedded and hence the parent
      // Otherwise, need to keep looking.
      nnou(prop(models[parentId], 'path'))
      ? parentId
      : findParentModelId(parentId, hierarchyDescriptorLookup, models)
    : // No parent found for this model
      null;
}
