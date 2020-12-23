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

import * as contentController from './ContentController';
import { DEFAULT_RECORD_DATA } from '../utils/util';
import * as contentTypeUtils from '../utils/contentType';
import * as Model from '../utils/model';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { ContentType, ContentTypeField, ValidationKeys } from '@craftercms/studio-ui/models/ContentType';
import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';
import {
  ICEProps,
  ICERecord,
  ICERecordRegistration,
  ReferentialEntries,
  ValidationResult
} from '../models/InContextEditing';
import { isNullOrUndefined, notNullOrUndefined, nou, pluckProps } from '../utils/object';
import { forEach } from '../utils/array';
import { findComponentContainerFields } from '../utils/ice';

const validationChecks: { [key in ValidationKeys]: Function } = {
  minCount(id, minCount, level, length) {
    if (length < minCount) {
      return {
        id,
        level,
        values: { minCount }
      };
    } else {
      return null;
    }
  },
  maxCount(id, maxCount, level, length) {
    if (length >= maxCount) {
      return {
        id,
        level,
        values: { maxCount }
      };
    } else {
      return null;
    }
  },
  allowedContentTypeTags() {},
  allowedContentTypes() {},
  maxLength() {},
  readOnly() {},
  required() {},
  width() {},
  height() {},
  minWidth() {},
  minHeight() {},
  maxWidth() {},
  maxHeight() {}
};

let rid = 0;

/* private */
const registry: Map<number, ICERecord> = new Map();

let refCount: LookupTable<number> = {};

export function register(registration: ICERecordRegistration): number {
  // For consistency, set `fieldId` and `index` props
  // to null for records that don't include those values
  const data = Object.assign({}, DEFAULT_RECORD_DATA, pluckProps(registration, 'modelId', 'fieldId', 'index'));

  if (isNullOrUndefined(data.modelId)) {
    throw new Error(
      'ICE component registration requires a model ID to be supplied. ' + `Supplied model id was ${data.modelId}.`
    );
  } else if (
    notNullOrUndefined(data.fieldId) &&
    isNullOrUndefined(data.index) &&
    contentTypeUtils.isGroupItem(getReferentialEntries(data).contentType, data.fieldId)
  ) {
    throw new Error(
      'Group item registration requires the index within the collection that contains the item to be supplied. ' +
        `Please supply index for '${data.fieldId}' of the ${getReferentialEntries(data).contentType.name} model.`
    );
  }

  const id = exists(data);
  if (id !== -1) {
    // TODO: Risk
    // Though more efficient to just keep a refCount
    // clients mistakenly calling deregister multiple
    // times would set things off. The alternative was
    // having slave records.

    const record = getById(id);
    refCount[id]++;

    return record.id;
  } else {
    const record: ICERecord = { ...data, id: rid++ };
    const entities = getReferentialEntries(record);

    // Record coherence validation
    if (notNullOrUndefined(entities.fieldId) && isNullOrUndefined(entities.field)) {
      console.error(
        `[ICERegistry] Field "${entities.fieldId}" was not found on the "${entities.contentType.name}" content type. ` +
          `Please check the field name matches one of the content type field names ` +
          `(${Object.keys(entities.contentType.fields).join(', ')})`
      );
    }

    registry.set(record.id, record);
    refCount[record.id] = 1;

    return record.id;
  }
}

export function deregister(id: number): ICERecord {
  const record = registry.get(id);
  if (record) {
    if (refCount[id] === 1) {
      registry.delete(id);
    } else {
      refCount[id]--;
    }
  }
  return null;
}

export function exists(data: Partial<ICEProps>): number {
  for (const [, record] of registry) {
    if (
      record.modelId === data.modelId &&
      ((nou(record.fieldId) && nou(data.fieldId)) || record.fieldId === data.fieldId) &&
      ((nou(record.index) && nou(data.index)) || record.index === data.index)
    ) {
      return record.id;
    }
  }
  return -1;
}

export function getById(id: number | string): ICERecord {
  id = typeof id === 'string' ? parseInt(id) : id;
  return registry.get(id);
}

export function isRepeatGroup(id): boolean {
  const { field, index } = getReferentialEntries(id);
  return notNullOrUndefined(field) && isNullOrUndefined(index) && field.type === 'repeat';
}

export function isRepeatGroupItem(id: number): boolean {
  const { field, index } = getReferentialEntries(id);
  return (
    // If there's no field, it's a root item (component, page)
    notNullOrUndefined(field) &&
    // The field must be of type repeat
    field.type === 'repeat' &&
    // Collection items - i.e. repeat groups & node-selectors - must specify their
    // index withing their collection. The absence of an index would mean the tested
    // record refers to the group itself instead of an item of a group
    notNullOrUndefined(index) // &&
    // TODO: Determine nested items
    // If the index contains dot notation, the record is for a nested
    // collection. This logic is currently not handled.
    // `${index}`.includes('.')
  );
}

export function getMediaReceptacles(type: string): ICERecord[] {
  const receptacles = [];
  for (const [, record] of registry) {
    const entries = getReferentialEntries(record);
    if (entries.field && entries.field.type === type) {
      receptacles.push(record);
    }
  }
  return receptacles;
}

export function getRecordReceptacles(id: number): ICERecord[] {
  const record = getById(id);
  const { index, field, fieldId, model } = getReferentialEntries(record);
  if (isNullOrUndefined(index)) {
    // Can't move something that's not part of a collection.
    // Collection items will always have an index.
    return [];
  } else if (field.type === 'node-selector') {
    // Get content type of item
    const models = contentController.getCachedModels();
    const id = Model.extractCollectionItem(model, fieldId, index);
    // @ts-ignore TODO: Fix type
    const nestedModel = models[id];
    const contentType = Model.getContentTypeId(nestedModel);
    return getContentTypeReceptacles(contentType).map((rec) => rec);
  } else if (field.type === 'repeat') {
    // const item = Model.extractCollectionItem(model, fieldId, index);
    return getRepeatGroupItemReceptacles(record);
  } else {
    console.error('[ICERegistry/getRecordReceptacles] Unhandled path');
    return [];
  }
}

export function getRepeatGroupItemReceptacles(record: ICERecord): ICERecord[] {
  const entries = getReferentialEntries(record);
  const receptacles = [];
  const records = registry.values();
  for (const item of records) {
    if (isNullOrUndefined(item.index) && item.fieldId === record.fieldId) {
      const es = getReferentialEntries(item);
      if (es.contentTypeId === entries.contentTypeId) {
        receptacles.push(item);
      }
    }
  }
  return receptacles;
}

export function getComponentItemReceptacles(record: ICERecord): number[] {
  const contentType = getReferentialEntries(record).contentType;
  return getContentTypeReceptacles(contentType).map((rec) => rec.id);
}

export function getContentTypeReceptacles(contentType: string | ContentType): ICERecord[] {
  const contentTypeId = typeof contentType === 'string' ? contentType : contentType.id;
  return Array.from(registry.values()).filter((record) => {
    const { fieldId, index } = record;
    if (notNullOrUndefined(fieldId)) {
      const { field, contentType: _contentType, model } = getReferentialEntries(record);
      const acceptedTypes = field?.validations?.allowedContentTypes?.value;
      const accepts = acceptedTypes && (acceptedTypes.includes(contentTypeId) || acceptedTypes.includes('*'));
      if (!accepts) {
        return false;
      } else if (isNullOrUndefined(index)) {
        return true;
      } else {
        // At this point, this field has been identified as accepting the content type
        // but the record has an index. If it has an index, it may still be a nested component
        // holder (node-selector).
        return (
          // Check that the field in question is a node-selector
          contentTypeUtils.isComponentHolder(_contentType, fieldId) &&
          // If it is an array, it is a receptacle, otherwise it's an item:
          // If it is a node selector, it may be an item of the node selector or a node
          // selector itself. Node selectors themselves will be arrays. If it's a value of the
          // node selector it would be a string representing an id of a model held by the node
          // selector.
          Array.isArray(Model.extractCollectionItem(model, fieldId, index))
        );
      }
    } else {
      return false;
    }
  });
}

export function runReceptaclesValidations(receptacles: ICERecord[]): LookupTable<LookupTable<ValidationResult>> {
  const lookup = {};
  receptacles.forEach((record) => {
    const validationResult = {};
    const { fieldId, index } = record;
    let {
      field: { validations },
      model
    } = getReferentialEntries(record);
    const collection = Model.extractCollectionItem(model, fieldId, index);
    Object.keys(validations).forEach((key) => {
      const validation = validations[key];
      switch (validation.id) {
        case 'minCount': {
          if (validation.value && collection.length < validation.value) {
            validationResult[validation.id] = {
              id: validation.id,
              level: validation.level,
              values: { min: validation.value }
            };
          }
          break;
        }
        case 'maxCount': {
          if (validation.value && collection.length >= validation.value) {
            validationResult[validation.id] = {
              id: validation.id,
              level: validation.level,
              values: { max: validation.value }
            };
          }
          break;
        }
        default:
          break;
      }
    });
    lookup[record.id] = validationResult;
  });
  return lookup;
}

export function runValidation(iceId: number, validationId: ValidationKeys, args?: unknown[]): ValidationResult {
  const record = getById(iceId);
  let {
    field: { validations }
  } = getReferentialEntries(record);
  if (validations[validationId]) {
    return validationChecks[validationId](...[...Object.values(validations[validationId]), ...args]);
  } else {
    return null;
  }
}

export function getReferentialEntries(record: number | ICERecord): ReferentialEntries {
  record = typeof record === 'object' ? record : getById(record);
  let model = contentController.getCachedModel(record.modelId);
  let contentTypeId = Model.getContentTypeId(model);
  let contentType = contentController.getCachedContentType(contentTypeId);
  let field = record.fieldId ? contentTypeUtils.getField(contentType, record.fieldId) : null;

  if (!field && record.fieldId && model.craftercms.sourceMap?.[record.fieldId]) {
    model = contentController.getContentInstanceByPath(model.craftercms.sourceMap[record.fieldId]);
    contentTypeId = Model.getContentTypeId(model);
    contentType = contentController.getCachedContentType(contentTypeId);
    field = record.fieldId ? contentTypeUtils.getField(contentType, record.fieldId) : null;
  }

  return {
    model,
    field,
    contentType,
    contentTypeId,
    ...record
  };
}

export function getRecordField(record: ICERecord): ContentTypeField {
  return getReferentialEntries(record).field;
}

export function isMovable(recordId: number): boolean {
  // modeId -> the main/parent model id or a sub model id
  // fieldId -> repeatGroup or array
  const entries = getReferentialEntries(recordId);
  const { field, index } = entries;

  return (
    field != null &&
    (field.type === 'repeat' || field.type === 'node-selector') &&
    field.sortable &&
    // `index` must be a valid number. nullish value
    // may mean it's not an item but rather the repeat
    // group or component itself
    notNullOrUndefined(index)
  );
}

/* private */
export function checkComponentMovability(entries): boolean {
  // Can't move if
  // - no other zones
  // - other zones are maxed out
  // - leaving current zone would violate minimum

  if (entries.field?.type !== 'node-selector') {
    return false;
  }

  const records = Array.from(registry.values());

  let parentField, parentModelId, parentCollection, minCount;

  // Find the parent field and it's respective container collection
  // The array in which this model is listed on.

  for (let i = 0, l = records.length; i < l; i++) {
    if (records[i].id === entries.id) {
      continue;
    }
    const record = getReferentialEntries(records[i]);
    if (isNullOrUndefined(record.field)) {
      if (notNullOrUndefined(record.index)) {
        // Collection item record. Cannot be the container.
      } else {
        // Is a component...
        // - get model fields
        // - check if one of the fields has this value
        const children = contentController.children[record.modelId];
        if (children && children.includes(entries.modelId)) {
          parentModelId = record.modelId;
          const containers = findComponentContainerFields(record.contentType.fields),
            field = findContainerField(record.model, containers, entries.modelId);
          if (notNullOrUndefined(field)) {
            parentField = field;
            parentCollection = Model.prop(record.model, field.id);
            break;
          }
        }
      }
    } else if (record.field.type === 'node-selector') {
      const value = Model.value(record.model, record.fieldId);
      if (value.includes(entries.modelId) || value === entries.modelId) {
        parentField = record.field;
        parentModelId = record.modelId;
        parentCollection = value;
        break;
      }
    }
  }

  if (!parentField) {
    throw new Error(
      `Unable to find the parent field for instance "${entries.modelId}" of ` +
        `${entries.contentType.name} component${entries.fieldId ? ` (${entries.fieldId} field)` : ''}. ` +
        'Did you forget to declare the field when creating the content type?\n' +
        'Check the state of the model data this could mean the data is corrupted.'
    );
  }

  const found = forEach(
    records,
    (record) => {
      if (record.modelId === parentModelId && record.fieldId === parentField.id) {
        return true;
      }
    },
    false
  );

  if (!found) {
    const componentName = `'${entries.contentType.name} ${
      entries.contentType.name.toLowerCase().includes('component') ? "'" : "Component' "
    }`;
    console.warn(
      `Per definition the ${componentName} is sortable but a drop zone for it was not found. ` +
        'Did you forget to register the zone? Please initialize the drop zone element(s) of ' +
        `the ${componentName} with modelId="${parentModelId}" and fieldId="${parentField.id}".`
    );
    return false;
  }

  minCount = (parentField.validations && parentField.validations.minCount) || 0;

  if (parentField.type === 'node-selector') {
    return (
      (parentField.sortable &&
        // If there are more adjacent items on this zone to be able to
        // move current guy before/after
        parentCollection.length > 1) ||
      // Would moving the guy away from this zone violate it's minCount?
      (parentCollection.length - 1 >= minCount &&
        // Does anybody else accept this type of component?
        getComponentItemReceptacles(entries).length > 0)
    );
  } else {
    return (
      // Moving this component would make the parent field value null/blank
      // If the parent field is not required that should be ok
      !parentField.required &&
      // Is this guy accepted elsewhere?
      getComponentItemReceptacles(entries).length > 0
    );
  }
}

/* private */
export function checkRepeatGroupMovability(entries): boolean {
  const { model, field, index } = entries;
  return (
    field?.type === 'repeat' &&
    field.sortable &&
    // `index` must be a valid number. nullish value
    // may mean it's not a group item but rather the group
    // container
    notNullOrUndefined(index) &&
    // No point making movable an item that can't jump
    // zones and doesn't have any adjacent items to move it
    // next to.
    // TODO: What about DnD trashing, though?
    Model.value(model, field.id).length > 1
  );
}

export function findContainerField(
  model: ContentInstance,
  fields: ContentTypeField[],
  modelId: string
): ContentTypeField {
  return forEach(fields, (field) => {
    const value = Model.value(model, field.id);
    if (field.type === 'node-selector' && (value === modelId || value.includes(modelId))) {
      return field;
    } else if (field.type === 'repeatGroup') {
      // TODO ...
    }
  });
}

export function flush(): void {
  registry.clear();
  refCount = {};
}
