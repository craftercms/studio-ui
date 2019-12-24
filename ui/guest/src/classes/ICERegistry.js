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

import contentController from './ContentController';
import { zip } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  DEFAULT_RECORD_DATA,
  findComponentContainerFields,
  isNullOrUndefined,
  notNullOrUndefined,
  pluckProps,
  forEach
} from '../util';
import { ContentTypeHelper } from './ContentTypeHelper';
import { ModelHelper } from './ModelHelper';

export class ICERegistry {

  static rid = 0;
  static contentReady = false;

  /* private */
  registry = { /* [id]: { modelId, fieldId, index } */ };
  /* private */
  children = {
    $CHILDREN_REGISTRY_PENDING$: null
    /* [id]: [id, id, id] */
  };

  constructor() {

    zip(
      contentController.models$(),
      contentController.contentTypes$()
    ).pipe(take(1)).subscribe(() => {
      ICERegistry.contentReady = true;
      if (notNullOrUndefined(this.children.$CHILDREN_REGISTRY_PENDING$)) {
        this.children.$CHILDREN_REGISTRY_PENDING$.forEach((record) => {
          this.computeChildren(record);
        });
      }
    });

  }

  register(data) {

    // For consistency, set `fieldId` and `index` props
    // to null for records that don't include those values
    data = Object.assign(
      {},
      DEFAULT_RECORD_DATA,
      pluckProps(data, 'modelId', 'fieldId', 'index')
    );

    if (isNullOrUndefined(data.modelId)) {
      throw new Error(
        `ICE component registration requires a model ID to be supplied. Supplied model id was ${data.modelId}.`
      );
    } else if (
      notNullOrUndefined(data.fieldId) &&
      isNullOrUndefined(data.index) &&
      ContentTypeHelper.isGroupItem(
        this.getReferentialEntries(data).contentType,
        data.fieldId
      )
    ) {
      throw new Error(
        'Group item registration requires the index within the collection that contains the item to be supplied. ' +
        `Please supply index for '${data.fieldId}' of the ${this.getReferentialEntries(data).contentType.name} model.`
      );
    }

    const id = this.exists(data);
    if (id !== -1) {
      // TODO: Risk
      // Though more efficient to just keep a refCount
      // clients mistakenly calling deregister multiple
      // times would set things off. The alternative was
      // having slave records.

      const record = this.recordOf(id);

      record.refCount++;

      return record.id;

    } else {

      const record = { ...data, id: ICERegistry.rid++ };

      this.computeChildren(record);

      this.registry[record.id] = record;

      return record.id;

    }

  }

  deregister(id) {
    const
      registry = this.registry,
      record = registry[id];
    if (
      (id in registry) &&
      (--record.refCount === 0)
    ) {
      delete registry[id];
    }
    return record;
  }

  exists(data) {
    const records = Object.values(this.registry);
    const lastIndex = records.length - 1;
    return forEach(
      records,
      (record, i) => {
        if (
          record.modelId === data.modelId &&
          (data.fieldId == null || record.fieldId === data.fieldId) &&
          (data.index == null || record.index === data.index)
        ) {
          return record.id;
        }
        if (i === lastIndex) {
          return -1;
        }
      },
      -1
    );
  }

  recordOf(id) {
    return this.registry[id];
  }

  isRepeatGroup(id) {
    const record = this.recordOf(id);
    return notNullOrUndefined(record.fieldId);
  }

  getMediaReceptacles() {
    const receptacles = [];
    forEach(
      Object.values(this.registry),
      (record) => {
        const entries = this.getReferentialEntries(record);
        if (entries.field && entries.field.type === 'asset') {
          receptacles.push(record.id);
        }
      }
    );
    return receptacles;
  }

  getRecordReceptacles(id) {
    const record = this.recordOf(id);
    return (
      (this.isRepeatGroup(record.id))
        ? this.getRepeatGroupItemReceptacles(record)
        : this.getComponentItemReceptacles(record)
    );
  }

  getRepeatGroupItemReceptacles(record) {
    const entries = this.getReferentialEntries(record);
    return Object.values(this.registry)
      .filter((rec) =>
        isNullOrUndefined(rec.index) &&
        rec.fieldId === record.fieldId
      )
      .filter((rec) => {
        const es = this.getReferentialEntries(rec);
        return es.contentTypeId === entries.contentTypeId;
      })
      .map((rec) => rec.id);
  }

  getComponentItemReceptacles(record) {
    const contentType = this.getReferentialEntries(record).contentType;
    return this.getContentTypeReceptacles(contentType).map((rec) => rec.id);
  }

  getContentTypeReceptacles(contentType) {
    const contentTypeId = contentType.id;
    return Object.values(this.registry).filter((record) => {
      const { fieldId, index } = record;
      if (notNullOrUndefined(fieldId)) {
        const { field, contentType: _contentType } = this.getReferentialEntries(record);
        const contentTypes = field?.validations?.contentTypes;
        const accepts = contentTypes && (
          contentTypes.includes(contentTypeId) ||
          contentTypes.includes('*')
        );
        if (!accepts) {
          return false;
        } else if (isNullOrUndefined(index)) {
          return true;
        } else {
          // TODO: Need to check this logic.
          // console.log(
          //   fieldId,
          //   field.type,
          //   ContentTypeHelper.isGroupItem(_contentType, fieldId),
          //   ContentTypeHelper.isComponentHolder(_contentType, fieldId)
          // );
          return (
            ContentTypeHelper.isGroupItem(_contentType, fieldId) &&
            ContentTypeHelper.isComponentHolder(_contentType, fieldId)
          );
        }
      } else {
        return false;
      }
    });
  }

  // minCountCheck() {
  //
  // }
  //
  // maxCountCheck() {
  //   // Max count rule check...
  //   if (okSoFar) {
  //     const fieldValue = ModelHelper.value(model, field.id);
  //     return (
  //       // If there's no a maxCount then no problem
  //       not('maxCount' in field.validations) ||
  //       (
  //         // If one is added, would it violate the maxCount
  //         (fieldValue.length + 1) <= field.validations.maxCount
  //       )
  //     );
  //   }
  // }

  getReferentialEntries(record) {
    record = typeof record === 'object' ? record : this.recordOf(record);
    const
      model = contentController.getCachedModel(record.modelId),
      contentTypeId = ModelHelper.getContentTypeId(model),
      contentType = contentController.getCachedContentType(contentTypeId),
      field = record.fieldId ? ContentTypeHelper.getField(contentType, record.fieldId) : null;
    return {
      model,
      contentType,
      field,
      contentTypeId,
      ...record
    };
  }

  getRecordField(record) {
    return this.getReferentialEntries(record).field;
  }

  isMovable(recordId) {

    // modeId -> the main/parent model id or a sub model id
    // fieldId -> repeatGroup or array
    const entries = this.getReferentialEntries(recordId);
    const { field, index } = entries;

    return (
      (field != null) &&
      (field.type === 'repeat' || field.type === 'node-selector') &&
      (field.sortable) &&
      // `index` must be a valid number. nullish value
      // may mean it's not an item but rather the repeat
      // group or component itself
      notNullOrUndefined(index)
    );

  }

  findParentValueHolder(modelId) {

  }

  /*private*/
  computeChildren(record) {

    const
      children = this.children,
      childrenPreComputed = notNullOrUndefined(children[record.modelId]);

    if (childrenPreComputed) {
      return;
    }

    if (!ICERegistry.contentReady) {
      if (isNullOrUndefined(children.$CHILDREN_REGISTRY_PENDING$)) {
        children.$CHILDREN_REGISTRY_PENDING$ = [];
      }
      children.$CHILDREN_REGISTRY_PENDING$.push(record);
    } else {

      let childIds = [];
      const entities = this.getReferentialEntries(record);

      (entities?.contentType?.fields) && findComponentContainerFields(entities.contentType.fields)
        .forEach((field) => {
          const value = ModelHelper.value(entities.model, field.id);
          if (value != null) {
            if (field.type === 'node-selector') {
              childIds = childIds.concat(value);
            } else if (field.type === 'repeat') {
              // TODO ...
              throw new Error('Path not implemented.');
            }
          }
        });

      children[record.modelId] = (childIds.length) ? childIds : null;

    }

  }

  /* private */
  checkComponentMovability(entries) {
    // Can't move if
    // - no other zones
    // - other zones are maxed out
    // - leaving current zone would violate minimum

    if (entries.field?.type !== 'node-selector') {
      return false;
    }

    const records = Object.values(this.registry);

    let
      parentField,
      parentModelId,
      parentCollection,
      minCount;

    // Find the parent field and it's respective container collection
    // The array in which this model is listed on.

    for (let i = 0, l = records.length; i < l; i++) {
      if (records[i].id === entries.id) {
        continue;
      }
      const record = this.getReferentialEntries(records[i]);
      if (isNullOrUndefined(record.field)) {
        if (notNullOrUndefined(records.index)) {
          // Collection item record. Cannot be the container.
          continue;
        } else {
          // Is a component...
          // - get model fields
          // - check if one of the fields has this value
          const children = this.children[record.modelId];
          if (children && children.includes(entries.modelId)) {
            parentModelId = record.modelId;
            const
              containers = findComponentContainerFields(record.contentType.fields),
              field = findContainerField(record.model, containers, entries.modelId);
            if (notNullOrUndefined(field)) {
              parentField = field;
              parentCollection = ModelHelper.prop(record.model, field.id);
              break;
            }
          }
        }
      } else if (record.field.type === 'node-selector') {
        const value = ModelHelper.value(record.model, record.fieldId);
        if (value.includes(entries.modelId) || (value === entries.modelId)) {
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
        if (
          record.modelId === parentModelId &&
          record.fieldId === parentField.id
        ) {
          return true;
        }
      },
      false
    );

    if (!found) {
      const componentName = (
        `'${entries.contentType.name} ${
          entries.contentType.name.toLowerCase().includes('component')
            ? '\''
            : 'Component\' '
        }`
      );
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
        (
          parentField.sortable &&
          // If there are more adjacent items on this zone to be able to
          // move current guy before/after
          parentCollection.length > 1
        ) || (
          // Would moving the guy away from this zone violate it's minCount?
          ((parentCollection.length - 1) >= minCount) &&
          // Does anybody else accept this type of component?
          this.getComponentItemReceptacles(entries).length > 0
        )
      );
    } else {
      return (
        // Moving this component would make the parent field value null/blank
        // If the parent field is not required that should be ok
        !(parentField.required) &&
        // Is this guy accepted elsewhere?
        this.getComponentItemReceptacles(entries).length > 0
      );
    }

  }

  /* private */
  checkRepeatGroupMovability(entries) {
    const { model, field, index } = entries;
    return (
      (field?.type === 'repeat') &&
      (field.sortable) &&
      // `index` must be a valid number. nullish value
      // may mean it's not a group item but rather the group
      // container
      notNullOrUndefined(index) &&
      // No point making movable an item that can't jump
      // zones and doesn't have any adjacent items to move it
      // next to.
      // TODO: What about DnD trashing, though?
      (ModelHelper.value(model, field.id).length > 1)
    );
  }

}

export function findContainerField(model, fields, modelId) {
  return forEach(fields, (field) => {
    const value = ModelHelper.value(model, field.id);
    if (field.type === 'node-selector' && (value === modelId || value.includes(modelId))) {
      return field;
    } else if (field.type === 'repeatGroup') {
      // TODO ...
    }
  });
}

const iceRegistry = new ICERegistry();

export default iceRegistry;
