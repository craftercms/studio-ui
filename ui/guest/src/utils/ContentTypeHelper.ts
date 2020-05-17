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

export class ContentTypeHelper {

  descriptor: ContentType = null;

  static getRelatedContentTypeIds(contentType: ContentType): string[] {
    return Object.values(contentType.fields)
      .reduce((accumulator, field) => {
        if (
          (field.type === 'array') &&
          (field.validations != null) &&
          ('validations' in field) &&
          ('contentTypes' in field.validations)
        ) {
          field.validations.contentTypes.value.forEach((ctid) =>
            !accumulator.includes(ctid) && accumulator.push(ctid)
          );
        }
        return accumulator;
      }, []);
  }

  static isGroupItem(contentType: ContentType, fieldId: string): boolean {
    return fieldId.includes('.');
  }

  static isComponentHolder(contentType: ContentType, fieldId: string): boolean {
    return ContentTypeHelper.getField(contentType, fieldId).type === 'node-selector';
  }

  static isGroup(contentType: ContentType, fieldId: string): boolean {
    return ContentTypeHelper.getField(contentType, fieldId).type === 'repeat';
  }

  static doesFieldAccept(contentType: ContentType, fieldId: string) {
    const field = ContentTypeHelper.getField(contentType, fieldId);
  }

  static getField(type: ContentType, fieldId: string): any {
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

  constructor(descriptor) {
    this.descriptor = descriptor;
  }

  getField(fieldId: string): ContentTypeField {
    return ContentTypeHelper.getField(
      this.descriptor,
      fieldId);
  }

  getFields(...names: string[]): ContentTypeField[] {
    return ContentTypeHelper.getFields(
      this.descriptor,
      ...names);
  }

  setContentType(descriptor: ContentType): void {
    this.descriptor = descriptor;
  }

}
