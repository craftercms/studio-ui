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

import { ContentType, ContentTypeField } from '@craftercms/studio-ui/models/ContentType';
import { createLookupTable, retrieveProperty } from './object';

export function getRelatedContentTypeIds(contentType: ContentType): string[] {
  return Object.values(contentType.fields).reduce((accumulator, field) => {
    if (
      field.type === 'array' &&
      field.validations != null &&
      'validations' in field &&
      'allowedContentTypes' in field.validations
    ) {
      field.validations.allowedContentTypes.value.forEach(
        (ctid) => !accumulator.includes(ctid) && accumulator.push(ctid)
      );
    }
    return accumulator;
  }, []);
}

export function isGroupItem(contentType: ContentType, fieldId: string): boolean {
  return fieldId.includes('.');
}

export function isComponentHolder(contentType: ContentType, fieldId: string): boolean {
  return getField(contentType, fieldId).type === 'node-selector';
}

export function isGroup(contentType: ContentType, fieldId: string): boolean {
  return getField(contentType, fieldId).type === 'repeat';
}

export function doesFieldAccept(contentType: ContentType, fieldId: string) {
  const field = getField(contentType, fieldId);
}

export function getField(type: ContentType, fieldId: string): ContentTypeField {
  // For repeat groups, the field inside the repeat group field will be
  // under {repeatName}.fields.{fieldName}. To abstract this complexity from devs
  // we parse it here.
  const parsedFieldId = fieldId.replace(/\./g, '.fields.');
  return retrieveProperty(Array.isArray(type.fields) ? createLookupTable(type.fields) : type.fields, parsedFieldId);
}

export function getFields(type: ContentType, ...ids: string[]): ContentTypeField[] {
  return ids.map((id) => getField(type, id));
}

export function getFieldsByType(contentType: ContentType, fieldType): ContentTypeField[] {
  return Object.values(contentType.fields).filter((field) => field.type === fieldType);
}

export function getDefaultValue(field: ContentTypeField): string {
  if (field.defaultValue) {
    return field.defaultValue;
  } else {
    switch (field.type) {
      case 'image':
        // TODO use validation width, height
        return 'https://via.placeholder.com/150';
      case 'text':
      case 'html':
        // TODO use lorem generator
        // TODO use maxLenght validation
        return 'Donec id elit non mi porta gravida at eget metus. Donec ullamcorper nulla non metus auctor fringilla. Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.';
    }
  }
}

export default {
  getRelatedContentTypeIds,
  isGroupItem,
  isComponentHolder,
  isGroup,
  doesFieldAccept,
  getField,
  getFields,
  getFieldsByType
};
