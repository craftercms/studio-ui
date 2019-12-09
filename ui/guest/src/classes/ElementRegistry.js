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

import { forEach, getChildArrangement, isNullOrUndefined, notNullOrUndefined, sibling } from '../util';
import iceRegistry from './ICERegistry';
import contentController from './ContentController';
import { take } from 'rxjs/operators';

let seq = 0;

export class ElementRegistry {

  static db = {};
  static registry = {};

  constructor() {

  }

  static get(id) {
    const record = this.db[id];
    record && isNullOrUndefined(record.label) && this.setLabel(record);
    return record;
  }

  // TODO: Unknown field names go by ignored. Trace the registration point to warn...
  // developers about field names that aren't found in the content type
  static setLabel(record) {
    const labels = [];
    record.iceIds.forEach((iceId) => {

      const iceRecord = iceRegistry.recordOf(iceId);
      const entities = iceRegistry.getReferentialEntries(iceRecord);
      labels.push(
        notNullOrUndefined(entities.field)
          ? entities.field.name
          : entities.contentType.name
      );

    });
    record.label = labels.join(', ');
  }

  static register(payload) {
    if (notNullOrUndefined(payload.id)) {
      throw new Error('Record already has id. Was it pre-registered? Please deregister first.');
    }

    const { db } = this;
    const { element, modelId, index, label, fieldId } = payload;

    const id = seq++;
    const iceIds = [];
    const fieldIds = (fieldId == null) ? [] : (
      Array.isArray(fieldId)
        ? fieldId
        : fieldId.split(',').map(str => str.trim())
    );

    // Create/register the physical record
    db[id] = { id, element, modelId, index, label, fieldId: fieldIds, iceIds, complete: false };

    // If the relevant model is loaded, complete it's registration, otherwise,
    // request it and complete registration when it does load.
    if (contentController.hasCachedModel(modelId)) {
      this.completeDeferredRegistration(id);
    } else {
      contentController.getModel$(modelId).pipe(take(1)).subscribe(() => {
        this.completeDeferredRegistration(id);
      });
    }

    return id;

  }

  static completeDeferredRegistration(id) {

    const { db, registry } = this;
    const { element, modelId, index, label, fieldId: fieldIds, iceIds } = db[id];

    if (fieldIds.length > 0) {
      fieldIds.forEach((fieldId) => {
        const iceId = iceRegistry.register({ modelId, index, fieldId });
        registry[iceId] = { id, element, modelId, index, label, fieldId, iceId };
        iceIds.push(iceId);
      });
    } else {
      const iceId = iceRegistry.register({ modelId, index });
      registry[iceId] = { id, element, modelId, index, label, fieldId: undefined, iceId };
      iceIds.push(iceId);
    }

    db[id].complete = true;

  }

  static deregister(id) {
    const record = this.db[id];
    if (notNullOrUndefined(record)) {
      const { iceIds } = record;
      iceIds.forEach((iceId) => {
        iceRegistry.deregister(iceId);
      });
      delete this.db[id];
    }
    return record;
  }

  static getDraggable(id) {
    const record = this.get(id);
    return forEach(
      record.iceIds,
      (iceId) => {
        if (iceRegistry.isMovable(iceId)) {
          return iceId;
        }
      },
      false
    );
  }

  static getHoverData(id) {
    const record = this.get(id);
    return {
      id,
      rect: record.element.getBoundingClientRect(),
      label: record.label
    };
  }

  static getRect(id) {
    return this.get(id).element.getBoundingClientRect();
  }

  static fromICEId(iceId) {
    return this.registry[iceId];
    // return Object.values(this.db).find(({ iceIds }) => {
    //   return iceIds.includes(iceId);
    // });
  }

  static compileDropZone(iceId) {

    const physicalRecord = this.fromICEId(iceId);
    const physicalRecordId = physicalRecord.id;
    const element = physicalRecord.element;
    const children = Array.from(element.children);
    const childrenRects = children.map((child) => child.getBoundingClientRect());

    return {
      element,
      children,

      iceId,
      physicalRecordId,
      rect: element.getBoundingClientRect(),
      arrangement: getChildArrangement(children, childrenRects),
      childrenRects
    };

  }

  static getSiblingRects(id) {
    let
      record = this.get(id),
      element = record.element,
      nextSibling,
      prevSibling,
      next,
      prev;

    nextSibling = sibling(element, true);
    prevSibling = sibling(element, false);

    forEach(
      Object.values(this.db),
      (record) => {
        if (record.element === nextSibling) {
          next = record.element.getBoundingClientRect();
        } else if (record.element === prevSibling) {
          prev = record.element.getBoundingClientRect();
        } else if (notNullOrUndefined(next) && notNullOrUndefined(prev)) {
          return 'break';
        }
      }
    );

    return { next, prev };

  }

  static fromElement(element) {
    const db = this.db;
    return forEach(
      Object.values(db),
      (record) => {
        if (record.element === element) {
          return this.get(record.id);
        }
      }
    );
  }

  static hasElement(element) {
    return forEach(
      Object.values(this.db),
      (record) => {
        if (record.element === element) {
          return true;
        }
      },
      false
    );
  }

}
