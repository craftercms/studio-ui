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

import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';
import { ContentTypeField } from '@craftercms/studio-ui/models/ContentType';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { nullOrUndefined, notNullOrUndefined, nou } from '@craftercms/studio-ui/utils/object';
import * as Model from '@craftercms/studio-ui/utils/model';
import { forEach, mergeArraysAlternatively } from '@craftercms/studio-ui/utils/array';
import { isSimple, isSymmetricCombination, popPiece } from '@craftercms/studio-ui/utils/string';
import { ModelHierarchyMap } from '@craftercms/studio-ui/utils/content';
import { RecordTypes, ReferentialEntries } from '../models/InContextEditing';

export function findComponentContainerFields(
  fields: LookupTable<ContentTypeField> | ContentTypeField[]
): ContentTypeField[] {
  if (!Array.isArray(fields)) {
    fields = Object.values(fields);
  }
  return fields.filter((field) => {
    if (field.type === 'node-selector') {
      return true;
    } else if (field.type === 'repeat') {
      // TODO Should repeats be considered containers?
      return false;
    } else {
      return false;
    }
  });
}

export function getParentModelId(
  modelId: string,
  models: LookupTable<ContentInstance>,
  children: ModelHierarchyMap
): string {
  return nullOrUndefined(Model.prop(models[modelId], 'path')) ? findParentModelId(modelId, children, models) : null;
}

function findParentModelId(
  modelId: string,
  hierarchyDescriptorLookup: ModelHierarchyMap,
  models: LookupTable<ContentInstance>
): string {
  const parentId = forEach(
    Object.entries(hierarchyDescriptorLookup),
    ([id, children]) => {
      if (notNullOrUndefined(children) && id !== modelId && children.children.includes(modelId)) {
        return id;
      }
    },
    null
  );
  return notNullOrUndefined(parentId)
    ? // If it has a path, it is not embedded and hence the parent
      // Otherwise, need to keep looking.
      notNullOrUndefined(Model.prop(models[parentId], 'path'))
      ? parentId
      : findParentModelId(parentId, hierarchyDescriptorLookup, models)
    : // No parent found for this model
      null;
}

export function getCollectionWithoutItemAtIndex(collection: string[], index: string | number): string[] {
  const parsedIndex = parseInt(popPiece(`${index}`), 10);
  return collection.slice(0, parsedIndex).concat(collection.slice(parsedIndex + 1));
}

export function getCollection(model: ContentInstance, fieldId: string, index: string | number) {
  const isStringIndex = typeof index === 'string';
  return isStringIndex ? Model.extractCollection(model, fieldId, index) : Model.value(model, fieldId);
}

export function setCollection(model: ContentInstance, fieldId: string, index: number | string, collection: string[]) {
  if (!isSimple(fieldId)) {
    const concatFieldId = mergeArraysAlternatively(fieldId.split('.'), index.toString().split('.')).join('.');
    const fieldNames = concatFieldId.split('.');
    const { length } = fieldNames;

    const _model = { ...model };

    fieldNames.reduce((acc, _fieldId, i) => {
      if (i === length - 1) {
        acc[_fieldId] = collection;
      }
      return (acc[_fieldId] = Array.isArray(acc[_fieldId]) ? [...acc[_fieldId]] : { ...acc[_fieldId] });
    }, _model);
    return _model;
  } else {
    return { ...model, [fieldId]: collection };
  }
}

export function determineRecordType(
  entities: Pick<ReferentialEntries, 'fieldId' | 'contentType' | 'index' | 'field'>
): RecordTypes {
  let recordType: RecordTypes;
  if (nou(entities.fieldId)) {
    // It's a model
    recordType = entities.contentType.type as RecordTypes;
  } else if (nou(entities.index)) {
    // It's a ${entities.field.type} field
    recordType = 'field';
  } else {
    if (
      isSimple(entities.fieldId) ||
      // By this point, it's been determined that it is a compound field
      isSymmetricCombination(entities.fieldId, entities.index)
    ) {
      // It's an item of a ${entities.field.type}
      recordType = entities.field.type === 'node-selector' ? 'node-selector-item' : 'repeat-item';
    } else {
      // It's a ${entities.field.type} field of a repeat group item
      recordType = 'field';
    }
  }
  return recordType;
}
