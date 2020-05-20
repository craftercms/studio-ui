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

import { BehaviorSubject, NEVER, Observable, Subject } from 'rxjs';
import { filter, map, pluck, share, switchMap, take, tap } from 'rxjs/operators';
import { ModelHelper } from '../utils/ModelHelper';
import Cookies from 'js-cookie';
import { fromTopic, post } from '../communicator';
import uuid from 'uuid/v4';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { ContentType, ContentTypeField } from '@craftercms/studio-ui/models/ContentType';
import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';
import { Operation } from '../models/Operations';
import {
  CHILDREN_MAP_UPDATE,
  CONTENT_TYPES_RESPONSE,
  DELETE_ITEM_OPERATION,
  GUEST_MODELS_RECEIVED,
  INSERT_COMPONENT_OPERATION,
  INSERT_INSTANCE_OPERATION,
  INSERT_ITEM_OPERATION,
  MOVE_ITEM_OPERATION,
  SORT_ITEM_OPERATION,
  UPDATE_FIELD_VALUE_OPERATION
} from '../constants';
import { createLookupTable, isNullOrUndefined } from '../utils/object';
import { popPiece, removeLastPiece } from '../utils/string';
import {
  findComponentContainerFields,
  getCollection,
  getCollectionWithoutItemAtIndex,
  getParentModelId
} from '../utils/ice';
import { createQuery, search } from '@craftercms/search';
import { parseDescriptor } from '@craftercms/content';
import {
  createChildModelIdList,
  modelsToLookup,
  normalizeModelsLookup,
  preParseSearchResults
} from '../utils/content';

const operations$ = new Subject<Operation>();
const operations = operations$.asObservable();

/* private */
const _models$ = new BehaviorSubject<LookupTable<ContentInstance>>({ /*'modelId': { ...modelData }*/ });

/* private */
const modelsObs$ = _models$.asObservable().pipe(
  filter((objects) => Object.keys(objects).length > 0),
  share()
);

/* private */
const _contentTypes$ = new BehaviorSubject<LookupTable<ContentType>>({ /*...*/ });

/* private */
const contentTypesObs$ = _contentTypes$.asObservable().pipe(
  filter((objects) => Object.keys(objects).length > 0),
  share()
);

export const children = {
  /* [id]: [id, id, id] */
};

const modelsRequested = {};

function computeChildren(model: ContentInstance): void {

  let childIds = [];
  const modelId = ModelHelper.prop(model, 'id');

  const contentTypeId = ModelHelper.getContentTypeId(model);
  const contentType = getCachedContentType(contentTypeId);

  findComponentContainerFields(contentType.fields).forEach((field) => {
    const value = ModelHelper.value(model, field.id);
    if (value != null) {
      if (field.type === 'node-selector') {
        childIds = childIds.concat(value);
      } else if (field.type === 'repeat') {
        // TODO ...
        throw new Error('Path not implemented.');
      }
    }
  });

  children[modelId] = (childIds.length) ? childIds : null;

}

export function getModel(modelId: string): Promise<ContentInstance> {
  return getModel$(modelId).toPromise();
}

export function getModel$(modelId: string): Observable<ContentInstance> {
  return models$(modelId).pipe(
    filter(models => modelId in models),
    map(models => models[modelId])
  );
}

export function getContentType(contentTypeId: string): Promise<ContentType> {
  return getContentType$(contentTypeId).toPromise();
}

export function getContentType$(contentTypeId: string): Observable<ContentType> {
  (!hasCachedContentType(contentTypeId)) && fetchContentType(contentTypeId);
  return contentTypesObs$.pipe(
    filter(contentTypes => contentTypeId in contentTypes),
    map(contentTypes => contentTypes[contentTypeId])
  );
}

export function models$(modelId?: string): Observable<LookupTable<ContentInstance>> {
  (modelId && !hasCachedModel(modelId)) && fetchModel(modelId);
  return modelsObs$;
}

export function contentTypes$(): Observable<LookupTable<ContentType>> {
  return contentTypesObs$;
}

export function hasCachedModel(modelId: string): boolean {
  return (getCachedModel(modelId) != null);
}

export function getCachedModel(modelId: string): ContentInstance {
  return getCachedModels()[modelId];
}

export function getCachedModels(): LookupTable<ContentInstance> {
  return _models$.value;
}

export function hasCachedContentType(contentTypeId: string): boolean {
  return (getCachedContentType(contentTypeId) != null);
}

export function getCachedContentType(contentTypeId: string): ContentType {
  return getCachedContentTypes()[contentTypeId];
}

export function getCachedContentTypes(): LookupTable<ContentType> {
  return _contentTypes$.value;
}

// region Operations

export function updateField(modelId: string, fieldId: string, index: string | number, value: unknown): void {
  const models = getCachedModels();
  const model = { ...models[modelId] };

  ModelHelper.value(model, fieldId, value);

  _models$.next({
    ...models,
    [modelId]: model
  });

  post(UPDATE_FIELD_VALUE_OPERATION, {
    modelId,
    fieldId,
    index,
    value,
    parentModelId: getParentModelId(modelId, models, children)
  });

  operations$.next({
    type: UPDATE_FIELD_VALUE_OPERATION,
    args: { modelId, fieldId, index, value }
  });

}

export function insertItem(
  modelId: string,
  fieldId: string,
  index: number | string,
  item: ContentInstance
): void {

  const models = getCachedModels();
  const model = models[modelId];
  const collection = ModelHelper.value(model, fieldId);
  const result = collection.slice(0);

  // Insert in desired position
  result.splice(index, 0, item);

  _models$.next({
    ...models,
    [modelId]: {
      ...model,
      [fieldId]: result
    }
  });

  post(INSERT_ITEM_OPERATION, { modelId, fieldId, index, item });

  operations$.next({
    type: 'insert',
    args: arguments
  });

}

export function insertComponent(
  modelId: string,
  fieldId: string,
  targetIndex: number | string,
  contentType: ContentType,
  shared: boolean = false
): void {
  if (typeof contentType === 'string') {
    contentType = getCachedContentType(contentType);
  }

  const models = getCachedModels();
  const model = models[modelId];
  const result = getCollection(model, fieldId, targetIndex);

  // Create Item
  // const now = new Date().toISOString();
  const instance: ContentInstance = {
    craftercms: {
      id: uuid(),
      path: null,
      label: `New ${contentType.name}`,
      contentTypeId: contentType.id,
      dateCreated: null,
      dateModified: null,
      locale: 'en'
    }
  };

  function processFields(instance, fields: LookupTable<ContentTypeField>) {
    Object.entries(fields).forEach(([id, field]) => {
      switch (field.type) {
        case 'repeat':
        case 'node-selector': {
          instance[id] = [];
          if (field.type === 'repeat') {
            instance[id].push({});
            processFields(instance[id][0], field.fields);
          }
          break;
        }
        default:
          instance[id] = field.defaultValue;
      }
    });
  }

  processFields(instance, contentType.fields);

  // Insert in desired position
  result.splice(targetIndex as number, 0, instance.craftercms.id);

  post(GUEST_MODELS_RECEIVED, {
    [instance.craftercms.id]: instance,
    [modelId]: {
      ...model,
      [fieldId]: result
    }
  });

  _models$.next({
    ...models,
    [instance.craftercms.id]: instance,
    [modelId]: {
      ...model,
      [fieldId]: result
    }
  });

  children[modelId]?.push(instance.craftercms.id);

  post(INSERT_COMPONENT_OPERATION, {
    modelId,
    fieldId,
    targetIndex,
    contentType,
    instance,
    parentModelId: getParentModelId(modelId, models, children),
    shared
  });

  operations$.next({
    type: INSERT_COMPONENT_OPERATION,
    args: { modelId, fieldId, targetIndex, contentType, shared, instance }
  });

}

//insertInstance(modelId: string, fieldId: string, targetIndex: number, instance: ContentInstance): void;
//insertInstance(modelId: string, fieldId: string, targetIndex: string, instance: ContentInstance): void;
export function insertInstance(modelId: string, fieldId: string, targetIndex: number | string, instance: ContentInstance): void {
  const models = getCachedModels();
  const model = models[modelId];

  const result = getCollection(model, fieldId, targetIndex);

  // Insert in desired position
  result.splice(targetIndex as number, 0, instance.craftercms.id);

  _models$.next({
    ...models,
    [instance.craftercms.id]: instance,
    [modelId]: {
      ...model,
      [fieldId]: result
    }
  });

  post(INSERT_INSTANCE_OPERATION, {
    modelId,
    fieldId,
    targetIndex,
    instance,
    parentModelId: getParentModelId(modelId, models, children)
  });

  operations$.next({
    type: INSERT_INSTANCE_OPERATION,
    args: { modelId, fieldId, targetIndex, instance }
  });

}

export function insertGroup(modelId, fieldId, data): void {
}

export function sortItem(
  modelId: string,
  fieldId: string,
  currentIndex: number | string,
  targetIndex: number | string
): void {

  const models = getCachedModels();
  const model = models[modelId];
  const currentIndexParsed = (typeof currentIndex === 'number') ? currentIndex : parseInt(popPiece(currentIndex));
  const targetIndexParsed = (typeof targetIndex === 'number') ? targetIndex : parseInt(popPiece(targetIndex));
  const collection = getCollection(model, fieldId, currentIndex);
  const result = getCollectionWithoutItemAtIndex(collection, currentIndexParsed);

  // Insert in desired position
  result.splice(targetIndexParsed, 0, collection[currentIndexParsed]);

  _models$.next({
    ...models,
    [modelId]: {
      ...model,
      [fieldId]: result
    }
  });

  post(SORT_ITEM_OPERATION, {
    modelId,
    fieldId,
    currentIndex,
    targetIndex,
    parentModelId: getParentModelId(modelId, models, children)
  });

  operations$.next({
    type: SORT_ITEM_OPERATION,
    args: arguments
  });

}

export function moveItem(
  originalModelId: string,
  originalFieldId: string,
  originalIndex: number | string,
  targetModelId: string,
  targetFieldId: string,
  targetIndex: number | string
): void {

  const models = getCachedModels();

  // Parse indexes to clear out dot notation for nested repeat/collection items.
  let originalIndexParsed = (typeof originalIndex === 'number') ? originalIndex : parseInt(popPiece(originalIndex));
  let targetIndexParsed = (typeof targetIndex === 'number') ? targetIndex : parseInt(popPiece(targetIndex));

  const symmetricOriginal = (originalFieldId.split('.').length === `${originalIndex}`.split('.').length);
  const symmetricTarget = (targetFieldId.split('.').length === `${targetIndex}`.split('.').length);

  if (!symmetricOriginal) {
    debugger
  } else if (!symmetricTarget) {
    debugger
  }

  const currentModel = models[originalModelId];
  const currentCollection = (
    symmetricOriginal
      ? ModelHelper.extractCollection(currentModel, originalFieldId, originalIndex)
      : ModelHelper.extractCollectionItem(currentModel, originalFieldId, originalIndex)
  );
  // Remove item from original collection
  const currentResult = currentCollection
    .slice(0, originalIndexParsed)
    .concat(currentCollection.slice(originalIndexParsed + 1));

  const targetModel = models[targetModelId];
  const targetCollection = (
    symmetricTarget
      ? ModelHelper.extractCollection(targetModel, targetFieldId, targetIndex)
      : ModelHelper.extractCollectionItem(targetModel, targetFieldId, targetIndex)
  );
  // Insert item in target collection @ the desired position
  const targetResult = targetCollection.slice(0);

  targetResult.splice(targetIndexParsed, 0, currentCollection[originalIndexParsed]);

  const newOriginalModel = { ...currentModel };
  const newTargetModel = (originalModelId === targetModelId) ? newOriginalModel : { ...targetModel };

  // This should extract the object that contains the
  // collection so the collection can be replaced with the new one with the modifications.
  // This is for nested cases where there's something like `field_1.field_2`.
  const getFieldItem = (model, field, index) => {
    let item;
    if (symmetricOriginal) {
      item = ModelHelper.extractCollectionItem(
        model,
        removeLastPiece(`${field}`),
        removeLastPiece(`${index}`)
      );
    } else {
      debugger;
    }
    return item;
  };

  if (originalFieldId.includes('.')) {
    let item = getFieldItem(newOriginalModel, originalFieldId, originalIndex);
    item[popPiece(originalFieldId)] = targetResult;
  } else {
    newOriginalModel[originalFieldId] = currentResult;
  }

  if (
    (targetModelId !== originalModelId) &&
    (targetFieldId.includes('.'))
  ) {
    let item = getFieldItem(newTargetModel, targetFieldId, targetIndex);
    item[popPiece(targetFieldId)] = targetResult;
  } else {
    newTargetModel[targetFieldId] = targetResult;
  }

  _models$.next(
    (originalModelId === targetModelId) ? {
      ...models,
      [originalModelId]: newOriginalModel
    } : {
      ...models,
      [originalModelId]: newOriginalModel,
      [targetModelId]: newTargetModel
    }
  );

  post(MOVE_ITEM_OPERATION, {
    originalModelId,
    originalFieldId,
    originalIndex,
    targetModelId,
    targetFieldId,
    targetIndex,
    originalParentModelId: getParentModelId(originalModelId, models, children),
    targetParentModelId: getParentModelId(targetModelId, models, children)
  });

  operations$.next({
    type: MOVE_ITEM_OPERATION,
    args: arguments
  });

}

export function deleteItem(modelId: string, fieldId: string, index: number | string): void {

  const isStringIndex = typeof index === 'string';
  const parsedIndex = parseInt(popPiece(`${index}`), 10);

  const models = getCachedModels();
  const model = models[modelId];
  const collection = isStringIndex
    ? ModelHelper.extractCollection(model, fieldId, index)
    : ModelHelper.value(model, fieldId);

  const result = collection
    .slice(0, parsedIndex)
    .concat(collection.slice(parsedIndex + 1));

  _models$.next({
    ...models,
    [modelId]: {
      ...model,
      [fieldId]: result
    }
  });

  post(DELETE_ITEM_OPERATION, {
    modelId,
    fieldId,
    index,
    parentModelId: getParentModelId(modelId, models, children)
  });

  operations$.next({
    type: DELETE_ITEM_OPERATION,
    args: arguments,
    state: { item: collection[parsedIndex] }
  });

}

// endregion

const fetching$ = new BehaviorSubject<boolean>(false);

function fetchModel(modelId: string): void {
  if (!(modelId in modelsRequested)) {
    modelsRequested[modelId] = true;
    fetching$.pipe(
      filter(isFetching => !isFetching),
      switchMap(() => _models$.pipe(pluck(modelId), take(1))),
      switchMap((model) => {
        if (isNullOrUndefined(model)) {
          return fetchById(modelId);
        } else {
          // Model was already fetched, discard repeated request.
          return NEVER;
        }
      }),
      take(1)
    ).subscribe(
      modelResponseReceived,
      (e) => console.log('Model fetch has failed...', e)
    );
  }
}

function fetchContentType(contentTypeId: string): boolean {
  return false;
}

function modelResponseReceived(responseModels: LookupTable<ContentInstance>): void {

  const currentModels = _models$.value;
  const normalizedModels = normalizeModelsLookup(responseModels);

  Object.entries(responseModels).forEach(([id, model]) => {
    children[id] = createChildModelIdList(model);
    children[id].forEach((modelId) => {
      modelsRequested[modelId] = true;
    });
    if (children[id].length === 0) {
      children[id] = null;
    }
  });

  post(GUEST_MODELS_RECEIVED, normalizedModels);
  post(CHILDREN_MAP_UPDATE, children);

  _models$.next(
    Object.assign(
      {},
      currentModels,
      normalizedModels
    )
  );

  fetching$.next(false);

}

function contentTypesResponseReceived(responseContentTypes: ContentType[]): void;
function contentTypesResponseReceived(responseContentTypes: LookupTable<ContentType>): void;
function contentTypesResponseReceived(responseContentTypes: LookupTable<ContentType> | ContentType[]): void {

  if (Array.isArray(responseContentTypes)) {
    (responseContentTypes as LookupTable) = createLookupTable(responseContentTypes);
  }

  const currentContentTypes = _contentTypes$.value;

  _contentTypes$.next(
    Object.assign(
      {},
      currentContentTypes,
      responseContentTypes
    )
  );

}

function fetchById(
  id: string,
  site: string = Cookies.get('crafterSite')
): Observable<LookupTable<ContentInstance>> {
  fetching$.next(true);
  return search(
    createQuery('elasticsearch', {
      query: {
        bool: {
          filter: [
            {
              bool: {
                should: {
                  multi_match: {
                    query: id,
                    fields: ['*objectId'],
                  }
                }
              }
            }
          ]
        }
      }
    }),
    { baseUrl: '', site }
  ).pipe(
    tap(({ total }) => (total === 0) && console.log(`[ContentController/fetchById] Model with id ${id} not found.`)),
    map<any, ContentInstance[]>(({ hits }) => hits.map(({ _source }) => parseDescriptor(preParseSearchResults(_source)))),
    map(modelsToLookup)
  );
}

fromTopic(CONTENT_TYPES_RESPONSE).subscribe((data) => {
  contentTypesResponseReceived(data.payload);
});

export default {
  children,
  operations,
  getModel,
  getModel$,
  getContentType,
  getContentType$,
  models$,
  contentTypes$,
  hasCachedModel,
  getCachedModel,
  getCachedModels,
  hasCachedContentType,
  getCachedContentType,
  getCachedContentTypes,
  updateField,
  insertItem,
  insertComponent,
  insertInstance,
  insertGroup,
  sortItem,
  moveItem,
  deleteItem
};
