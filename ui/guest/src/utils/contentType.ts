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
import { createLookupTable } from './object';
import { LoremIpsum } from 'lorem-ipsum';
import LookupTable from '@craftercms/studio-ui/models/LookupTable';

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
  // const field = getField(contentType, fieldId);
  throw new Error('Not implemented.');
}

export function getField(
  type: ContentType,
  fieldId: string,
  contentTypes?: LookupTable<ContentType>
): ContentTypeField {
  const fields = fieldId.split('.');
  let accumulator = Array.isArray(type.fields) ? createLookupTable(type.fields) : type.fields;
  let parsedFieldId = [];
  fields.forEach((field) => {
    parsedFieldId.push(field);
    if (accumulator.type === 'node-selector') {
      if (!contentTypes) {
        throw new Error(
          `Content types not provided to content type helper \`getField\` method. ` +
            `Unable to retrieve the field \`${fieldId}\` without full list of content types.`
        );
      }
      const contentTypeWithTargetFieldId = accumulator.validations.allowedContentTypes.value.find((ct) =>
        Boolean(contentTypes[ct].fields[field])
      );
      accumulator = contentTypes[contentTypeWithTargetFieldId].fields[field];
    } else {
      if (accumulator.type === 'repeat') {
        // For repeat groups, the field inside the repeat group field will be
        // under {repeatName}.fields.{fieldName}. To abstract this complexity from devs
        // we parse it here.
        accumulator = accumulator.fields[field];
      } else {
        accumulator = accumulator[field];
      }
    }
  });
  return accumulator as ContentTypeField;
}

export function getFields(type: ContentType, ...ids: string[]): ContentTypeField[] {
  return ids.map((id) => getField(type, id));
}

export function getFieldsByType(contentType: ContentType, fieldType): ContentTypeField[] {
  return Object.values(contentType.fields).filter((field) => field.type === fieldType);
}

export function getDefaultValue(field: ContentTypeField): string | number {
  if (field.defaultValue) {
    return field.defaultValue;
  } else if (field.validations.required) {
    switch (field.type) {
      case 'image':
        const width = field.validations.width?.value ?? field.validations.minWidth?.value ?? 150;
        const height = field.validations.height?.value ?? field.validations.minHeight?.value ?? width;
        return `https://via.placeholder.com/${width}x${height}`;
      case 'textarea':
      case 'text': {
        let maxLength = parseInt(field.validations.maxLength?.value);
        let lorem = new LoremIpsum({
          wordsPerSentence: {
            max: 4,
            min: 4
          }
        });
        return maxLength ? lorem.generateSentences(1).substring(0, maxLength / 2) : lorem.generateWords(1);
      }
      case 'html':
        let lorem = new LoremIpsum();
        return lorem.generateParagraphs(1);
      case 'numeric-input': {
        return field.validations.minValue?.value ?? 1;
      }
      case 'boolean':
        return 'false';
      case 'date-time':
        return new Date().toISOString();
    }
  } else {
    return null;
  }
}
