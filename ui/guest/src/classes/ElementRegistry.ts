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

import * as iceRegistry from './ICERegistry';
import { getById } from './ICERegistry';
import {
  byPathFetchIfNotLoaded,
  getCachedContentType,
  getCachedModels,
  hasCachedModel,
  isInheritedField,
  model$
} from './ContentController';
import { take } from 'rxjs/operators';
import * as ContentType from '../utils/contentType';
import * as Model from '../utils/model';
import {
  DropZone,
  ElementRecord,
  ElementRecordRegistration,
  HighlightData,
  ICERecord,
  ValidationResult
} from '../models/InContextEditing';
import { RegistryEntry } from '../models/Registry';
import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';
import { isNullOrUndefined, notNullOrUndefined } from '../utils/object';
import { forEach } from '../utils/array';
import { getChildArrangement, sibling } from '../utils/dom';
import { removeLastPiece } from '../utils/string';
import $ from 'jquery';

let seq = 0;

const db: LookupTable<ElementRecord> = {};
const registry = {};

export function get(id: number): ElementRecord {
  const record = db[id];
  record && isNullOrUndefined(record.label) && setLabel(record);
  return record;
}

// TODO: Unknown field names go by ignored. Trace the registration point to warn...
// developers about field names that aren't found in the content type
export function setLabel(record: ElementRecord): void {
  const labels = [];
  const models = getCachedModels();
  record.iceIds.forEach((iceId) => {
    const iceRecord = iceRegistry.getById(iceId);
    const { model, field, fieldId, index, contentType } = iceRegistry.getReferentialEntries(iceRecord);
    if (notNullOrUndefined(field)) {
      if (field.type === 'node-selector') {
        if (notNullOrUndefined(index)) {
          let component;
          if (notNullOrUndefined(fieldId) && ContentType.isGroupItem(contentType, fieldId)) {
            // Repeat groups with possibly nested node-selector/repeat
            let aux = Model.extractCollectionItem(model, fieldId, index);
            // TODO: Only works for nested node-selector (?)...
            // A nested repeat group would not be a component and `aux` would rather be
            // an object to read the last piece of the `fieldId`
            // @ts-ignore TODO: Fix type
            component = models[aux];
          } else {
            // Ok for mono-level node selectors
            const id = Model.value(model, field.id)[index];
            component = models[id];
          }

          if (component) {
            labels.push(
              `${component.craftercms.label} (${getCachedContentType(component.craftercms.contentTypeId).name})`
            );
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
      labels.push(`${model.craftercms.label} (${contentType.name})`);
    }
  });
  record.label = labels.join(', ');
}

export function register(payload: ElementRecordRegistration): number {
  // @ts-ignore
  if (notNullOrUndefined(payload.id)) {
    throw new Error('Record already has id. Was it pre-registered? Please deregister first.');
  }

  const { element, modelId, index, label, fieldId, path } = payload;

  const id = seq++;
  const iceIds = [];
  // prettier-ignore
  const fieldIds =
    fieldId == null
      ? []
      : Array.isArray(fieldId)
        ? fieldId
        : fieldId.split(',').map((str) => str.trim());

  function create() {
    // Create/register the physical record
    db[id] = {
      id,
      element,
      modelId,
      index,
      label,
      fieldId: fieldIds,
      iceIds,
      complete: false,
      inherited: fieldIds.some((fieldId) => isInheritedField(modelId, fieldId))
    };
  }

  // If the relevant model is loaded, complete it's registration, otherwise,
  // request it and complete registration when it does load.
  if (hasCachedModel(modelId)) {
    create();
    completeDeferredRegistration(id);
  } else {
    path && byPathFetchIfNotLoaded(path).subscribe();
    model$(modelId)
      .pipe(take(1))
      .subscribe(() => {
        create();
        completeDeferredRegistration(id);
      });
  }

  return id;
}

export function completeDeferredRegistration(id: number): void {
  const record = db[id];
  const { modelId, index, fieldId: fieldIds, iceIds } = record;

  if (fieldIds.length > 0) {
    fieldIds.forEach((fieldId) => {
      const iceId = iceRegistry.register({ modelId, index, fieldId });
      if (!registry[iceId]) {
        registry[iceId] = [];
      }
      registry[iceId].push(record.id);
      iceIds.push(iceId);
    });
  } else {
    const iceId = iceRegistry.register({ modelId, index });
    if (!registry[iceId]) {
      registry[iceId] = [];
    }
    registry[iceId].push(record.id);
    iceIds.push(iceId);
  }

  db[id].complete = true;
}

export function deregister(id: string | number): ElementRecord {
  const record = db[id];
  if (notNullOrUndefined(record)) {
    const { iceIds } = record;
    iceIds.forEach((iceId) => {
      if (registry[iceId].length === 1) {
        delete registry[iceId];
      } else if (registry[iceId].length > 1) {
        registry[iceId].splice(registry[iceId].indexOf(record.id), 1);
      }
      iceRegistry.deregister(iceId);
    });
    delete db[id];
  }
  return record;
}

export function getDraggable(id: number): number | boolean {
  const record = get(id);
  return forEach(
    record.iceIds,
    function(iceId): boolean | number {
      if (iceRegistry.isMovable(iceId)) {
        return iceId;
      }
    },
    false
  );
}

export function getHoverData(id: number): HighlightData {
  const record = get(id);
  return {
    id,
    rect: record.element.getBoundingClientRect(),
    inherited: record.inherited,
    label: record.label,
    validations: {}
  };
}

export function getRect(id: number): DOMRect {
  return get(id).element.getBoundingClientRect();
}

export function createIntermediateElementRecord(record: ElementRecord, iceId: number): RegistryEntry {
  if (!record) {
    return null;
  }
  const { id, element, label, modelId, index } = record;
  return { id, element, modelId, index, label, fieldId: getById(iceId).fieldId, iceId };
}

export function fromICEId(iceId: number): RegistryEntry {
  const record = db[registry[iceId]?.[0]];
  return createIntermediateElementRecord(record, iceId);
}

export function getRecordsFromIceId(iceId: number): RegistryEntry[] {
  const recordsIds = registry[iceId];
  const records = [];

  if (!recordsIds) {
    return null;
  } else if (recordsIds.length > 1) {
    recordsIds.forEach((recordId) => {
      let record = db[recordId];
      let registry = createIntermediateElementRecord(record, iceId);
      if (registry) {
        records.push(registry);
      }
    });
    return records.length > 0 ? records : null;
  } else {
    let registry = fromICEId(iceId);
    return registry ? [registry] : null;
  }
}

function getDropZoneFromRegistryEntry(elementRecord: RegistryEntry, iceId: number): DropZone {
  const elementRecordId = elementRecord.id;
  const element = elementRecord.element;
  const children: Element[] = Array.from(element.children);
  const childrenRects = children.map((child: Element) => child.getBoundingClientRect());
  const rect = element.getBoundingClientRect();

  return {
    element,
    children,
    iceId,
    elementRecordId,
    rect,
    arrangement: getChildArrangement(children, childrenRects, rect),
    childrenRects,
    validations: {}
  };
}

export function compileDropZone(iceId: number): DropZone {
  const elementRecord = fromICEId(iceId);
  return getDropZoneFromRegistryEntry(elementRecord, iceId);
}

export function compileAllDropZones(iceId: number): DropZone[] {
  const elementRecords = getRecordsFromIceId(iceId);
  return elementRecords.map((elementRecord) => getDropZoneFromRegistryEntry(elementRecord, iceId));
}

export function getSiblingRects(id: number): LookupTable<DOMRect> {
  let //
    record = get(id),
    element = record.element,
    nextSibling,
    prevSibling,
    next,
    prev;

  nextSibling = sibling(element as HTMLElement, true);
  prevSibling = sibling(element as HTMLElement, false);

  forEach(Object.values(db), (record) => {
    if (record.element === nextSibling) {
      next = record.element.getBoundingClientRect();
    } else if (record.element === prevSibling) {
      prev = record.element.getBoundingClientRect();
    } else if (notNullOrUndefined(next) && notNullOrUndefined(prev)) {
      return 'break';
    }
  });

  return { next, prev };
}

export function fromElement(element: Element): ElementRecord {
  return forEach(Object.values(db), (record) => {
    if (record.element === element) {
      return get(record.id);
    }
  });
}

export function hasElement(element: Element): boolean {
  return forEach(
    Object.values(db),
    (record) => {
      if (record.element === element) {
        return true;
      }
    },
    false
  );
}

export function getHighlighted(dropZones: DropZone[]): LookupTable<HighlightData> {
  return dropZones.reduce((object, { elementRecordId: id, validations }) => {
    object[id] = getHoverData(id);
    object[id].validations = validations;
    return object;
  }, {} as LookupTable<HighlightData>);
}

export function getDragContextFromReceptacles(
  receptacles: ICERecord[],
  validationsLookup?: LookupTable<LookupTable<ValidationResult>>,
  currentRecord?: ElementRecord
): { dropZones: any; siblings: any; players: any; containers: any } {
  const response = {
    dropZones: [],
    siblings: [],
    players: [],
    containers: []
  };

  receptacles.forEach(({ id }) => {
    const dropZones = compileAllDropZones(id);
    const dropZonesFiltered = currentRecord
      ? dropZones.filter((dropZone) => dropZone.children.includes(currentRecord.element))
      : null;
    (dropZonesFiltered && dropZonesFiltered.length ? dropZonesFiltered : dropZones).forEach((dropZone) => {
      dropZone.origin = null;
      dropZone.origin = currentRecord ? dropZone.children.includes(currentRecord.element) : null;
      dropZone.validations = validationsLookup?.[id] ?? {};
      response.dropZones.push(dropZone);
      response.siblings = [...response.siblings, ...dropZone.children];
      response.players = [...response.players, ...dropZone.children, dropZone.element];
      response.containers.push(dropZone.element);
    });
  });
  return response;
}

export function getElementFromICEProps(modelId: string, fieldId: string, index: string | number): Element {
  const recordId = iceRegistry.exists({
    modelId: modelId,
    fieldId: fieldId,
    index: index
  });

  if (recordId !== -1) {
    const registryEntry = fromICEId(recordId);
    if (registryEntry) {
      return registryEntry.element;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
export function getParentElementFromICEProps(
  modelId: string,
  fieldId: string,
  index: string | number
): JQuery<Element> {
  const recordId = iceRegistry.exists({
    modelId: modelId,
    fieldId: fieldId,
    index: fieldId.includes('.') ? parseInt(removeLastPiece(index as string)) : null
  });

  return recordId === -1 ? null : $(fromICEId(recordId).element);
}
export function getParentsElementFromICEProps(
  modelId: string,
  fieldId: string,
  index: string | number
): JQuery<Element>[] {
  const recordId = iceRegistry.exists({
    modelId: modelId,
    fieldId: fieldId,
    index: fieldId.includes('.') ? parseInt(removeLastPiece(index as string)) : null
  });

  return recordId === -1 ? null : getRecordsFromIceId(recordId).map((registryEntry) => $(registryEntry.element));
}
