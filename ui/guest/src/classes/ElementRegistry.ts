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

import {
  forEach,
  getChildArrangement,
  isNullOrUndefined,
  notNullOrUndefined,
  sibling
} from '../util';
import iceRegistry from './ICERegistry';
import contentController from './ContentController';
import { take } from 'rxjs/operators';
import { ContentTypeHelper } from './ContentTypeHelper';
import { ModelHelper } from './ModelHelper';
import { DropZone, HoverData, Record } from '../models/InContextEditing';
import { RegistryEntry } from '../models/Registry';
import { LookupTable } from '../models/LookupTable';

let seq = 0;

export class ElementRegistry {

  static db = {};
  static registry = {};

  static get(id: number): Record {
    const record = this.db[id];
    record && isNullOrUndefined(record.label) && this.setLabel(record);
    return record;
  }

  // TODO: Unknown field names go by ignored. Trace the registration point to warn...
  // developers about field names that aren't found in the content type
  static setLabel(record: Record): void {
    const labels = [];
    const models = contentController.getCachedModels();
    record.iceIds.forEach((iceId) => {

      const iceRecord = iceRegistry.recordOf(iceId);
      const { model, field, fieldId, index, contentType } = iceRegistry.getReferentialEntries(iceRecord);

      if (notNullOrUndefined(field)) {
        if (field.type === 'node-selector') {
          if (notNullOrUndefined(index)) {

            let component;
            if (notNullOrUndefined(fieldId) && ContentTypeHelper.isGroupItem(contentType, fieldId)) {
              // Repeat groups with possibly nested node-selector/repeat
              let aux = ModelHelper.extractCollectionItem(model, fieldId, index);
              // TODO: Only works for nested node-selector (?)...
              // A nested repeat group would not be a component and `aux` would rather be
              // an object to read the last piece of the `fieldId`
              component = models[aux];
            } else {
              // Ok for mono-level node selectors
              const id = ModelHelper.value(model, field.id)[index];
              component = models[id];
            }

            if (component) {
              labels.push(`${field.name}: ${component.craftercms.label}`);
            } else {
              labels.push(`${field.name}`);
            }

          } else {
            labels.push(`${field.name}`);
          }
        } else {
          labels.push(field.name);
        }
      } else {
        labels.push(`${contentType.name}: ${model.craftercms.label}`);
      }

    });
    record.label = labels.join(', ');
  }

  static register(payload): number {
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

  static completeDeferredRegistration(id: number): void {

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

  static deregister(id: string | number): Record {
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

  static getDraggable(id: number): string {
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

  static getHoverData(id: number): HoverData {
    const record = this.get(id);
    return {
      id,
      rect: record.element.getBoundingClientRect(),
      label: record.label,
      validations: []
    };
  }

  static getRect(id: number): DOMRect {
    return this.get(id).element.getBoundingClientRect();
  }

  static fromICEId(iceId: number): RegistryEntry {
    return this.registry[iceId];
    // return Object.values(this.db).find(({ iceIds }) => {
    //   return iceIds.includes(iceId);
    // });
  }

  static compileDropZone(iceId: number): DropZone {

    const physicalRecord = this.fromICEId(iceId);
    const physicalRecordId = physicalRecord.id;
    const element = physicalRecord.element;
    const children: Element[] = Array.from(element.children);
    const childrenRects = children.map((child: Element) => child.getBoundingClientRect());
    const rect = element.getBoundingClientRect();

    return {
      element,
      children,
      iceId,
      physicalRecordId,
      rect,
      arrangement: getChildArrangement(children, childrenRects, rect),
      childrenRects
    };

  }

  static getSiblingRects(id: number): LookupTable<DOMRect> {
    let
      record = this.get(id),
      element = record.element,
      nextSibling,
      prevSibling,
      next,
      prev;

    nextSibling = sibling(element as HTMLElement, true);
    prevSibling = sibling(element as HTMLElement, false);

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

  static fromElement(element: Element): Record {
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

  static hasElement(element: Element): boolean {
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
