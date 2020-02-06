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

import { createLookupTable, nou, retrieveProperty, setProperty } from './object';
import ContentType, { ContentTypeField } from '../models/ContentType';
import { removeLastPiece } from './string';

export class ContentTypeHelper {

  static getRelatedContentTypeIds(contentType: ContentType) {
    return Object.values(contentType.fields)
      .reduce((accumulator, field) => {
        if (
          (field.type === 'array') &&
          (field.validations != null) &&
          ('validations' in field) &&
          ('contentTypes' in field.validations)
        ) {
          field.validations.contentTypes.forEach((ctid) =>
            !accumulator.includes(ctid) && accumulator.push(ctid)
          );
        }
        return accumulator;
      }, []);
  }

  static isGroupItem(contentType: ContentType, fieldId: string): boolean {
    return fieldId.includes('.');
  }

  static isComponentHolder(contentType, fieldId) {
    return ContentTypeHelper.getField(contentType, fieldId).type === 'node-selector';
  }

  static isGroup(contentType, fieldId) {
    return ContentTypeHelper.getField(contentType, fieldId).type === 'repeat';
  }

  static doesFieldAccept(contentType: ContentType, fieldId: string) {
    // const field = ContentTypeHelper.getField(contentType, fieldId);
    throw new Error('[doesFieldAccept] Not implemented');
  }

  static getField(type: ContentType, fieldId: string): ContentTypeField {
    // For repeat groups, the field inside the repeat group field will be
    // under {repeatName}.fields.{fieldName}. To abstract this complexity from devs
    // we parse it here.
    const parsedFieldId = fieldId.replace(/\./g, '.fields.');
    return retrieveProperty(
      Array.isArray(type.fields) ? createLookupTable(type.fields) : type.fields,
      parsedFieldId
    );
  }

  static getFields(type: ContentType, ...ids: string[]): ContentTypeField[] {
    return ids.map((id) => ContentTypeHelper.getField(type, id));
  }

  static getFieldsByType(contentType: ContentType, fieldType): ContentTypeField[] {
    return Object.values(contentType.fields).filter((field) => field.type === fieldType);
  }

  descriptor: ContentType = null;

  constructor(descriptor) {
    this.descriptor = descriptor;
  }

  getField(fieldId: string) {
    return ContentTypeHelper.getField(
      this.descriptor,
      fieldId);
  }

  getFields(...names: string[]) {
    return ContentTypeHelper.getFields(
      this.descriptor,
      ...names);
  }

  setContentType(descriptor: ContentType) {
    this.descriptor = descriptor;
  }

}


const systemPropList = ['id', 'path', 'contentType', 'dateCreated', 'dateModified', 'label'];

export class ModelHelper {
  static prop(model, propName) {
    if (model == null) {
      return null;
    } else if (systemPropList.includes(propName)) {
      propName = `craftercms.${propName}`;
    }
    return retrieveProperty(model, propName);
  }

  static value(model, fieldId, newValue) {
    // TODO: GraphQL transforms names as left-rail_o to left__rail_o.
    // This transform is potentially unreliable. We should discuss approach.
    const cleanFieldId = fieldId.replace(/-/g, '__');
    if (cleanFieldId !== fieldId && retrieveProperty(model, cleanFieldId)) {
      fieldId = cleanFieldId;
    }
    if (newValue != null) {
      setProperty(model, fieldId, newValue);
    }
    return retrieveProperty(model, fieldId);
  }

  static extractCollection(model, fieldId: string, index: string) {
    return extractCollectionPiece(
      model,
      fieldId,
      removeLastPiece(`${index}`)
    );
  }

  static extractCollectionItem(model, fieldId: string, index: string) {
    const indexes = (
      (index === '' || nou(index))
        ? []
        : `${index}`.split('.').map(i => parseInt(i))
    );
    const fields = fieldId.split('.');
    if (indexes.length > fields.length) {
      throw new Error(
        '[ModelHelper.extractCollectionItem] The number of indexes surpasses the number ' +
        `of nested properties on model id "${ModelHelper.prop(model, 'id')}", field id "${fieldId}". ` +
        `Supplied index path was ${index}. `
      );
    }
    if (Math.abs(indexes.length - fields.length) > 1) {
      throw new Error(
        '[ModelHelper.extractCollectionItem] The number of indexes and number of nested props mismatch ' +
        `by more than 1 on "${ModelHelper.prop(model, 'id')}", field id "${fieldId}". ` +
        `Supplied index path was ${index}. Number of nested props may be greater by no more than one ` +
        'than the number of nested indexes.'
      );
    }
    return extractCollectionPiece(model, fieldId, index);
  }

  static getContentTypeId(model) {
    return model?.craftercms?.contentType;
  }

  static isEmbedded(model) {
    return nou(ModelHelper.prop(model, 'path'));
  }

  descriptor: any = null;

  constructor(descriptor) {
    this.descriptor = descriptor;
  }

  extractCollection(fieldId: string, index: string) {
    return ModelHelper.extractCollection(
      this.descriptor,
      fieldId,
      index
    )
  }

  extractCollectionItem(fieldId: string, index: string) {
    return ModelHelper.extractCollectionItem(
      this.descriptor,
      fieldId,
      index
    )
  }

  isEmbedded() {
    return ModelHelper.isEmbedded(this.descriptor)
  }

  prop(propName: string) {
    return ModelHelper.prop(
      this.descriptor,
      propName
    )
  }

  getContentTypeId() {
    return ModelHelper.getContentTypeId(this.descriptor)
  }

  setModel(descriptor: any) {
    this.descriptor = descriptor;
  }

}

function extractCollectionPiece(model, fieldId, index) {
  const indexes = (
    (index === '' || nou(index))
      ? []
      : `${index}`.split('.').map(i => parseInt(i, 10))
  );
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
    return aux;
  } else if (indexes.length < fields.length) {
    // There's one more field to use as there were less indexes
    // than there were fields. For example: fieldId: `items_o.content_o`, index: 0
    // At this point, aux would be `items_o[0]` and we need to extract `content_o`
    const field = fields[fields.length - 1];
    return aux[field];
  }
}
