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

import { createLookupTable, retrieveProperty } from '../util';

export class ContentTypeHelper {

  static getRelatedContentTypeIds(contentType) {
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

  static isGroupItem(contentType, fieldId) {
    return fieldId.includes('.');
  }

  static doesFieldAccept(contentType, fieldId) {
    const field = ContentTypeHelper.getField(contentType, fieldId);
  }

  static getField(type, fieldId) {
    // For repeat groups, the field inside the repeat group field will be
    // under {repeatName}.fields.{fieldName}. To abstract this complexity from devs
    // we parse it here.
    const parsedFieldId = fieldId.replace(/\./g, '.fields.');
    return retrieveProperty(
      Array.isArray(type.fields) ? createLookupTable(type.fields) : type.fields,
      parsedFieldId
    );
  }

  static getFields(type, ...ids) {
    return ids.map((id) => ContentTypeHelper.getField(id));
  }

  static getFieldsByType(contentType, fieldType) {
    return Object.values(contentType.fields)
      .filter((field) => field.type === fieldType);
  }

  descriptor = null;

  constructor(descriptor) {
    this.descriptor = descriptor;
  }

  getField(fieldId) {
    return ContentTypeHelper.getField(
      this.descriptor,
      fieldId);
  }

  getFields(...names) {
    return ContentTypeHelper.getFields(
      this.descriptor,
      ...names);
  }

  setContentType(descriptor) {
    this.descriptor = descriptor;
  }

}
