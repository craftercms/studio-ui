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

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, pluck, switchMap, take, tap } from 'rxjs/operators';
import * as Model from '../utils/model';
import Cookies from 'js-cookie';
import { fromTopic, post } from '../utils/communicator';
import uuid from 'uuid/v4';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { ContentType, ContentTypeField } from '@craftercms/studio-ui/models/ContentType';
import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';
import { Operation } from '../models/Operations';
import {
  CONTENT_TYPES_RESPONSE,
  DELETE_ITEM_OPERATION,
  INSERT_COMPONENT_OPERATION,
  INSERT_INSTANCE_OPERATION,
  INSERT_ITEM_OPERATION,
  MOVE_ITEM_OPERATION,
  SORT_ITEM_OPERATION,
  UPDATE_FIELD_VALUE_OPERATION
} from '../constants';
import { createLookupTable, nou } from '../utils/object';
import { popPiece, removeLastPiece } from '../utils/string';
import { getCollection, getCollectionWithoutItemAtIndex, getParentModelId, setCollection } from '../utils/ice';
import { createQuery, search } from '@craftercms/search';
import { parseDescriptor, preParseSearchResults } from '@craftercms/content';
import { modelsToLookup } from '../utils/content';
import { crafterConf } from '@craftercms/classes';
import { getDefaultValue } from '../utils/contentType';

// if (process.env.NODE_ENV === 'development') {
// TODO: Notice
// Not so sure about this assumption. Maybe best to just leave it up to the consumer
// app to set the crafter URL via `crafterConf` if it wants something different?
crafterConf.getConfig().baseUrl === '' &&
  crafterConf.configure({
    baseUrl: window.location.hostname === 'localhost' ? 'http://localhost:8080' : window.location.origin,
    site: Cookies.get('crafterSite')
  });
// }

const operations$ = new Subject<Operation>();

const operationsObs$ = operations$.asObservable();

export const children = {
  /* [id]: [id, id, id] */
};

const pathsRequested = {};

const paths$ = new BehaviorSubject<LookupTable<string>>({
  /* 'path': 'modelId' */
});

const models$ = new BehaviorSubject<LookupTable<ContentInstance>>({
  /* 'modelId': { ...modelData } */
});

const contentTypes$ = new BehaviorSubject<LookupTable<ContentType>>({
  /* 'contentTypeId': { ...contentTypeData } */
});

// Share operator makes the behaviour subject's behaviour go away. New subscribers
// don't receive the latest value as soon as they subscribe. Would need to multicast
// to be able to continue using share
const notEmpty = (objects) => Object.keys(objects).length > 0;
const modelsObs$ = models$.pipe(filter(notEmpty));
const contentTypesObs$ = contentTypes$.pipe(filter(notEmpty));
const pathsObs$ = paths$.pipe(filter(notEmpty));

export { operationsObs$ as operations$, modelsObs$ as models$, contentTypesObs$ as contentTypes$, pathsObs$ as paths$ };

// region Models

export function model$(modelId: string): Observable<ContentInstance> {
  return models$.pipe(
    pluck(modelId),
    filter((model) => Boolean(model))
  );
}

export function hasCachedModel(modelId: string): boolean {
  return Boolean(models$.value[modelId]);
}

export function getCachedModel(modelId: string): ContentInstance {
  return models$.value[modelId];
}

export function getCachedModels(): LookupTable<ContentInstance> {
  return models$.value;
}

export function fetchById(id: string): Observable<LookupTable<ContentInstance>> {
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
                    fields: ['*objectId']
                  }
                }
              }
            }
          ]
        }
      }
    }),
    // TODO: Remove hardcoded url
    crafterConf.getConfig()
  ).pipe(
    tap(({ total }) => total === 0 && console.log(`[ContentController/fetchById] Model with id ${id} not found.`)),
    map<any, ContentInstance[]>(({ hits }) =>
      hits.map(({ _source }) => parseDescriptor(preParseSearchResults(_source)))
    ),
    map(modelsToLookup)
  );
}

export function byPathFetchIfNotLoaded(path: string): Observable<ContentInstance> {
  if (nou(path)) {
    return of(null);
  } else if (pathsRequested[path]) {
    return paths$.pipe(
      filter((paths) => Boolean(paths[path])),
      pluck(path),
      map((modelId) => models$.value[modelId])
    );
  } else {
    pathsRequested[path] = true;
    return fetchByPath(path).pipe(pluck('model'));
  }
}

export function getContentInstanceByPath(path: string): ContentInstance {
  let modelId = paths$.value[path];
  return models$.value[modelId];
}

export function isInheritedField(modelId: string, fieldId: string): boolean {
  return !!getCachedModel(modelId).craftercms.sourceMap?.[fieldId];
}

export function getModelIdFromInheritedField(modelId: string, fieldId): string {
  const levelDescriptorPath = models$.value[modelId].craftercms.sourceMap?.[fieldId];
  if (levelDescriptorPath) {
    return getContentInstanceByPath(levelDescriptorPath).craftercms.id;
  } else {
    return modelId;
  }
}

export function fetchByPath(
  path: string
): Observable<{ model: ContentInstance; modelLookup: LookupTable<ContentInstance> }> {
  return of('nothing').pipe(
    tap(() => post({ type: 'FETCH_GUEST_MODEL', payload: { path } })),
    switchMap(() =>
      fromTopic('FETCH_GUEST_MODEL_COMPLETE').pipe(
        pluck('payload'),
        filter((payload) => payload.path === path),
        take(1)
      )
    )
  );
}

// endregion

// region Content Types

export function hasCachedContentType(contentTypeId: string): boolean {
  return Boolean(contentTypes$.value[contentTypeId]);
}

export function getCachedContentType(contentTypeId: string): ContentType {
  return contentTypes$.value[contentTypeId];
}

export function getCachedContentTypes(): LookupTable<ContentType> {
  return contentTypes$.value;
}

// endregion

// region Operations

// To propagate the update up the model tree for
// reference based UI rendering libraries.
function collectReferrers(modelId) {
  const models = getCachedModels();
  const parentModels = [];
  const modelsToUpdate = {};
  let currentID = getParentModelId(modelId, models, children);
  while (currentID) {
    parentModels.push(currentID);
    currentID = getParentModelId(currentID, models, children);
  }
  parentModels.forEach((id) => (modelsToUpdate[id] = { ...models[id] }));
  return modelsToUpdate;
}

export function updateField(modelId: string, fieldId: string, index: string | number, value: unknown): void {
  const models = getCachedModels();
  const model = { ...models[modelId] };
  const parentModelId = getParentModelId(modelId, models, children);
  const modelsToUpdate = collectReferrers(modelId);

  Model.value(model, fieldId, value);

  // Update the model cache
  models$.next({
    ...models,
    ...modelsToUpdate,
    [modelId]: model
  });

  // Post the update to studio to persist it
  post(UPDATE_FIELD_VALUE_OPERATION, {
    modelId,
    fieldId,
    index,
    value,
    parentModelId
  });

  operations$.next({
    type: UPDATE_FIELD_VALUE_OPERATION,
    args: { modelId: getModelIdFromInheritedField(modelId, fieldId), fieldId, index, value }
  });
}

export function insertItem(modelId: string, fieldId: string, index: number | string, item: ContentInstance): void {
  const models = getCachedModels();
  const collection = Model.value(models[modelId], fieldId);
  const result = collection.slice(0);

  // Insert in desired position
  result.splice(index, 0, item);

  const model = setCollection(
    models[modelId],
    fieldId,
    typeof index === 'string' && index.includes('.') ? removeLastPiece(index) : index,
    result
  );

  models$.next({
    ...models,
    [modelId]: model
  });

  post(INSERT_ITEM_OPERATION, { modelId, fieldId, index, item });

  operations$.next({
    type: 'insert',
    args: arguments
  });
}

const systemProps = ['fileName', 'internalName'];

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
  const result = getCollection(models[modelId], fieldId, targetIndex).concat();

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
          if (!systemProps.includes(field.id)) {
            instance[id] = getDefaultValue(field);
          }
      }
    });
  }

  processFields(instance, contentType.fields);

  // Insert in desired position
  result.splice(targetIndex as number, 0, instance.craftercms.id);

  const model = setCollection(
    models[modelId],
    fieldId,
    typeof targetIndex === 'string' ? removeLastPiece(targetIndex) : targetIndex,
    result
  );

  models$.next({
    ...models,
    [instance.craftercms.id]: instance,
    [modelId]: model
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

// insertInstance(modelId: string, fieldId: string, targetIndex: number, instance: ContentInstance): void;
// insertInstance(modelId: string, fieldId: string, targetIndex: string, instance: ContentInstance): void;
export function insertInstance(
  modelId: string,
  fieldId: string,
  targetIndex: number | string,
  instance: ContentInstance
): void {
  const models = getCachedModels();

  const result = getCollection(models[modelId], fieldId, targetIndex).concat();

  // Insert in desired position
  result.splice(targetIndex as number, 0, instance.craftercms.id);

  const model = setCollection(
    models[modelId],
    fieldId,
    typeof targetIndex === 'string' ? removeLastPiece(targetIndex) : targetIndex,
    result
  );

  models$.next({
    ...models,
    [instance.craftercms.id]: instance,
    [modelId]: model
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

export function insertGroup(modelId, fieldId, data): void {}

export function sortItem(
  modelId: string,
  fieldId: string,
  currentIndex: number | string,
  targetIndex: number | string
): void {
  const models = getCachedModels();
  const currentIndexParsed = typeof currentIndex === 'number' ? currentIndex : parseInt(popPiece(currentIndex));
  const targetIndexParsed = typeof targetIndex === 'number' ? targetIndex : parseInt(popPiece(targetIndex));
  const collection = getCollection(models[modelId], fieldId, currentIndex);
  const result = getCollectionWithoutItemAtIndex(collection, currentIndexParsed);

  // Insert in desired position
  result.splice(targetIndexParsed, 0, collection[currentIndexParsed]);

  const model = setCollection(
    models[modelId],
    fieldId,
    typeof currentIndex === 'string' ? removeLastPiece(currentIndex) : currentIndex,
    result
  );

  models$.next({
    ...models,
    [modelId]: model
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
  let originalIndexParsed = typeof originalIndex === 'number' ? originalIndex : parseInt(popPiece(originalIndex));
  let targetIndexParsed = typeof targetIndex === 'number' ? targetIndex : parseInt(popPiece(targetIndex));

  const symmetricOriginal = originalFieldId.split('.').length === `${originalIndex}`.split('.').length;
  const symmetricTarget = targetFieldId.split('.').length === `${targetIndex}`.split('.').length;

  if (!symmetricOriginal) {
    debugger;
  } else if (!symmetricTarget) {
    debugger;
  }

  const currentModel = models[originalModelId];
  const currentCollection = symmetricOriginal
    ? Model.extractCollection(currentModel, originalFieldId, originalIndex)
    : Model.extractCollectionItem(currentModel, originalFieldId, originalIndex);
  // Remove item from original collection
  const currentResult = currentCollection
    .slice(0, originalIndexParsed)
    .concat(currentCollection.slice(originalIndexParsed + 1));

  const targetModel = models[targetModelId];
  const targetCollection = symmetricTarget
    ? Model.extractCollection(targetModel, targetFieldId, targetIndex)
    : Model.extractCollectionItem(targetModel, targetFieldId, targetIndex);
  // Insert item in target collection @ the desired position
  const targetResult = targetCollection.slice(0);

  targetResult.splice(targetIndexParsed, 0, currentCollection[originalIndexParsed]);

  const newOriginalModel = { ...currentModel };
  const newTargetModel = originalModelId === targetModelId ? newOriginalModel : { ...targetModel };

  // This should extract the object that contains the
  // collection so the collection can be replaced with the new one with the modifications.
  // This is for nested cases where there's something like `field_1.field_2`.
  const getFieldItem = (model, field, index) => {
    let item;
    if (symmetricOriginal) {
      item = Model.extractCollectionItem(model, removeLastPiece(`${field}`), removeLastPiece(`${index}`));
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

  if (targetModelId !== originalModelId && targetFieldId.includes('.')) {
    let item = getFieldItem(newTargetModel, targetFieldId, targetIndex);
    item[popPiece(targetFieldId)] = targetResult;
  } else {
    newTargetModel[targetFieldId] = targetResult;
  }

  models$.next(
    originalModelId === targetModelId
      ? {
          ...models,
          [originalModelId]: newOriginalModel
        }
      : {
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
  const collection = isStringIndex
    ? Model.extractCollection(models[modelId], fieldId, index)
    : Model.value(models[modelId], fieldId);

  const result = collection.slice(0, parsedIndex).concat(collection.slice(parsedIndex + 1));

  const model = setCollection(
    models[modelId],
    fieldId,
    typeof index === 'string' ? removeLastPiece(index) : index,
    result
  );

  models$.next({
    ...models,
    [modelId]: model
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

// Host sends over all content types upon Guest check in.
fromTopic(CONTENT_TYPES_RESPONSE)
  .pipe(pluck('payload'))
  .subscribe((contentTypes) => {
    contentTypes$.next(Array.isArray(contentTypes) ? createLookupTable(contentTypes) : contentTypes);
  });

interface FetchGuestModelCompletePayload {
  path: string;
  model: ContentInstance;
  modelLookup: LookupTable<ContentInstance>;
  modelIdByPath: LookupTable<string>;
  childrenMap: LookupTable<string[]>;
}

fromTopic('FETCH_GUEST_MODEL_COMPLETE')
  .pipe(pluck('payload'))
  .subscribe(({ modelLookup, childrenMap, modelIdByPath }: FetchGuestModelCompletePayload) => {
    Object.keys(modelIdByPath).forEach((path) => {
      pathsRequested[path] = true;
    });
    Object.assign(children, childrenMap);
    models$.next({ ...models$.value, ...modelLookup });
    paths$.next({ ...paths$.value, ...modelIdByPath });
  });
