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

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ajax, AjaxResponse } from 'rxjs/ajax';
import { filter, map, share, take } from 'rxjs/operators';
import { ModelHelper } from './ModelHelper';
import {
  CHILDREN_MAP_UPDATE,
  CONTENT_TYPES_RESPONSE,
  createLookupTable,
  DELETE_ITEM_OPERATION,
  findComponentContainerFields,
  forEach,
  GUEST_MODELS_RECEIVED,
  INSERT_COMPONENT_OPERATION,
  INSERT_INSTANCE_OPERATION,
  INSERT_ITEM_OPERATION,
  isNullOrUndefined,
  MOVE_ITEM_OPERATION,
  notNullOrUndefined,
  pluckProps,
  popPiece,
  removeLastPiece,
  reversePluckProps,
  SORT_ITEM_OPERATION,
  UPDATE_FIELD_VALUE_OPERATION
} from '../util';
import Cookies from 'js-cookie';
import { fromTopic, post } from '../communicator';
import uuid from 'uuid/v4';
import { ContentInstance, ContentInstanceSystemProps } from '../models/ContentInstance';
import { ContentType, ContentTypeField } from '../models/ContentType';
import { LookupTable } from '../models/LookupTable';
import { Operation } from '../models/Operations';

const apiUrl = window.location.origin;

export class ContentController {

  static operations$ = new Subject<Operation>();
  static operations = ContentController.operations$.asObservable();

  /* private */
  static models$ = new BehaviorSubject<LookupTable<ContentInstance>>({ /*'modelId': { ...modelData }*/ });
  /* private */
  static modelsObs$ = ContentController.models$.asObservable().pipe(
    filter((objects) => Object.keys(objects).length > 0),
    share()
  );

  /* private */
  static contentTypes$ = new BehaviorSubject<LookupTable<ContentType>>({ /*...*/ });
  /* private */
  static contentTypesObs$ = ContentController.contentTypes$.asObservable().pipe(
    filter((objects) => Object.keys(objects).length > 0),
    share()
  );

  children = {
    /* [id]: [id, id, id] */
  };

  modelRequestsInFlight = {};

  constructor() {
    fromTopic(CONTENT_TYPES_RESPONSE).subscribe((data) => {
      this.contentTypesResponseReceived(data.payload);
    });
  }

  computeChildren(model: ContentInstance): void {

    let childIds = [];
    const modelId = ModelHelper.prop(model, 'id');
    const children = this.children;
    const contentTypeId = ModelHelper.getContentTypeId(model);
    const contentType = this.getCachedContentType(contentTypeId);

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

  getModel(modelId: string): Promise<ContentInstance> {
    return this.getModel$(modelId).toPromise();
  }

  getModel$(modelId: string): Observable<ContentInstance> {
    return this.models$(modelId).pipe(
      filter(models => modelId in models),
      map(models => models[modelId])
    );
  }

  getContentType(contentTypeId: string): Promise<ContentType> {
    return this.getContentType$(contentTypeId).toPromise();
  }

  getContentType$(contentTypeId: string): Observable<ContentType> {
    (!this.hasCachedContentType(contentTypeId)) && this.fetchContentType(contentTypeId);
    return ContentController.contentTypesObs$.pipe(
      filter(contentTypes => contentTypeId in contentTypes),
      map(contentTypes => contentTypes[contentTypeId])
    );
  }

  models$(modelId?: string): Observable<LookupTable<ContentInstance>> {
    (modelId && !this.hasCachedModel(modelId)) && this.fetchModel(modelId);
    return ContentController.modelsObs$;
  }

  contentTypes$(): Observable<LookupTable<ContentType>> {
    return ContentController.contentTypesObs$;
  }

  hasCachedModel(modelId: string): boolean {
    return (this.getCachedModel(modelId) != null);
  }

  getCachedModel(modelId: string): ContentInstance {
    return this.getCachedModels()[modelId];
  }

  getCachedModels(): LookupTable<ContentInstance> {
    return ContentController.models$.value;
  }

  hasCachedContentType(contentTypeId: string): boolean {
    return (this.getCachedContentType(contentTypeId) != null);
  }

  getCachedContentType(contentTypeId: string): ContentType {
    return this.getCachedContentTypes()[contentTypeId];
  }

  getCachedContentTypes(): LookupTable<ContentType> {
    return ContentController.contentTypes$.value;
  }

  updateField(modelId: string, fieldId: string, index: string | number, value: unknown): void {
    const models = this.getCachedModels();
    const model = { ...models[modelId] };

    ModelHelper.value(model, fieldId, value);

    ContentController.models$.next({
      ...models,
      [modelId]: model
    });

    post(UPDATE_FIELD_VALUE_OPERATION, {
      modelId,
      fieldId,
      index,
      value,
      parentModelId: getParentModelId(modelId, models, this.children)
    });

    ContentController.operations$.next({
      type: UPDATE_FIELD_VALUE_OPERATION,
      args: { modelId, fieldId, index, value }
    });

  }

  insertItem(
    modelId: string,
    fieldId: string,
    index: number | string,
    item: ContentInstance
  ): void {

    const models = this.getCachedModels();
    const model = models[modelId];
    const collection = ModelHelper.value(model, fieldId);
    const result = collection.slice(0);

    // Insert in desired position
    result.splice(index, 0, item);

    ContentController.models$.next({
      ...models,
      [modelId]: {
        ...model,
        [fieldId]: result
      }
    });

    post(INSERT_ITEM_OPERATION, { modelId, fieldId, index, item });

    ContentController.operations$.next({
      type: 'insert',
      args: arguments
    });

  }

  insertComponent(
    modelId: string,
    fieldId: string,
    targetIndex: number | string,
    contentType: ContentType,
    shared: boolean = false
  ): void {
    if (typeof contentType === 'string') {
      contentType = this.getCachedContentType(contentType);
    }

    const models = this.getCachedModels();
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
        // dateCreated: now,
        // dateModified: now,
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

    ContentController.models$.next({
      ...models,
      [instance.craftercms.id]: instance,
      [modelId]: {
        ...model,
        [fieldId]: result
      }
    });

    this.children[modelId].push(instance.craftercms.id);

    post(INSERT_COMPONENT_OPERATION, {
      modelId,
      fieldId,
      targetIndex,
      contentType,
      instance,
      parentModelId: getParentModelId(modelId, models, this.children),
      shared
    });

    ContentController.operations$.next({
      type: INSERT_COMPONENT_OPERATION,
      args: { modelId, fieldId, targetIndex, contentType, shared, instance }
    });

  }

  insertInstance(modelId: string, fieldId: string, targetIndex: number, instance: ContentInstance): void;
  insertInstance(modelId: string, fieldId: string, targetIndex: string, instance: ContentInstance): void;
  insertInstance(modelId: string, fieldId: string, targetIndex: number | string, instance: ContentInstance): void {
    const models = this.getCachedModels();
    const model = models[modelId];

    const result = getCollection(model, fieldId, targetIndex);

    // Insert in desired position
    result.splice(targetIndex as number, 0, instance.craftercms.id);

    ContentController.models$.next({
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
      parentModelId: getParentModelId(modelId, models, this.children)
    });

    ContentController.operations$.next({
      type: INSERT_INSTANCE_OPERATION,
      args: { modelId, fieldId, targetIndex, instance }
    });

  }

  insertGroup(modelId, fieldId, data): void {
  }

  sortItem(
    modelId: string,
    fieldId: string,
    currentIndex: number | string,
    targetIndex: number | string
  ): void {

    const models = this.getCachedModels();
    const model = models[modelId];
    const currentIndexParsed = (typeof currentIndex === 'number') ? currentIndex : parseInt(popPiece(currentIndex));
    const targetIndexParsed = (typeof targetIndex === 'number') ? targetIndex : parseInt(popPiece(targetIndex));
    const collection = getCollection(model, fieldId, currentIndex);
    const result = getCollectionWithoutItemAtIndex(collection, currentIndexParsed);

    // Insert in desired position
    result.splice(targetIndexParsed, 0, collection[currentIndexParsed]);

    ContentController.models$.next({
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
      parentModelId: getParentModelId(modelId, models, this.children)
    });

    ContentController.operations$.next({
      type: SORT_ITEM_OPERATION,
      args: arguments
    });

  }

  moveItem(
    originalModelId: string,
    originalFieldId: string,
    originalIndex: number | string,
    targetModelId: string,
    targetFieldId: string,
    targetIndex: number | string
  ): void {

    const models = this.getCachedModels();

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

    ContentController.models$.next(
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
      originalParentModelId: getParentModelId(originalModelId, models, this.children),
      targetParentModelId: getParentModelId(targetModelId, models, this.children)
    });

    ContentController.operations$.next({
      type: MOVE_ITEM_OPERATION,
      args: arguments
    });

  }

  deleteItem(modelId: string, fieldId: string, index: number | string): void {

    const isStringIndex = typeof index === 'string';
    const parsedIndex = parseInt(popPiece(`${index}`), 10);

    const models = this.getCachedModels();
    const model = models[modelId];
    const collection = isStringIndex
      ? ModelHelper.extractCollection(model, fieldId, index)
      : ModelHelper.value(model, fieldId);

    const result = collection
      .slice(0, parsedIndex)
      .concat(collection.slice(parsedIndex + 1));

    ContentController.models$.next({
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
      parentModelId: getParentModelId(modelId, models, this.children)
    });

    ContentController.operations$.next({
      type: DELETE_ITEM_OPERATION,
      args: arguments,
      state: { item: collection[parsedIndex] }
    });

  }

  /* private */
  createModelRequest(modelId: string): Observable<AjaxResponse> {
    return ajax.get(`${apiUrl}/content/${modelId}`);
  }

  /* private */
  fetchModel(modelId: string): void {
    if (!(modelId in this.modelRequestsInFlight)) {
      this.modelRequestsInFlight[modelId] = fetchById(modelId).subscribe(
        (response: LookupTable<ContentInstance>) => {
          delete this.modelRequestsInFlight[modelId];
          this.modelsResponseReceived(response);
        },
        (e) => console.log('Model fetch has failed...', e)
      );
    }
  }

  /* private */
  fetchContentType(contentTypeId: string): boolean {
    return false;
  }

  /* private */
  modelsResponseReceived(responseModels: ContentInstance[]): void;
  modelsResponseReceived(responseModels: LookupTable<ContentInstance>): void;
  modelsResponseReceived(responseModels: LookupTable<ContentInstance> | ContentInstance[]): void {

    if (Array.isArray(responseModels)) {
      responseModels = createLookupTable(responseModels, 'craftercms.id');
    }

    const currentModels = ContentController.models$.value;

    post(GUEST_MODELS_RECEIVED, responseModels);

    ContentController.contentTypes$.pipe(
      filter(hash => Object.values(hash).length !== 0),
      take(1)
    ).subscribe(() => {
      Object.values(responseModels).forEach((model) =>
        this.computeChildren(model)
      );
      post(CHILDREN_MAP_UPDATE, this.children);
    });

    ContentController.models$.next(
      Object.assign(
        {},
        currentModels,
        responseModels
      )
    );

  }

  /* private */
  contentTypesResponseReceived(responseContentTypes: ContentType[]): void;
  contentTypesResponseReceived(responseContentTypes: LookupTable<ContentType>): void;
  contentTypesResponseReceived(responseContentTypes: LookupTable<ContentType> | ContentType[]): void {

    if (Array.isArray(responseContentTypes)) {
      (responseContentTypes as LookupTable) = createLookupTable(responseContentTypes);
    }

    const currentContentTypes = ContentController.contentTypes$.value;

    ContentController.contentTypes$.next(
      Object.assign(
        {},
        currentContentTypes,
        responseContentTypes
      )
    );

  }

  /* private */
  responseReceived(response): void {
    const

      currentContentTypes = ContentController.contentTypes$.value,
      currentModels = ContentController.models$.value,

      responseContentTypes = response.contentTypes,
      responseModels = response.data;

    // cancel any inflight requests for loaded types.

    ContentController.contentTypes$.next(
      Object.assign({},
        currentContentTypes,
        responseContentTypes)
    );

    ContentController.models$.next(
      Object.assign({},
        currentModels,
        responseModels)
    );

    // Update test.
    // setTimeout(() => {
    //   const
    //     contentTypes = ContentController.contentTypes$.value,
    //     models = ContentController.models$.value;
    //
    //   models['4qT1W3HXewc'].title = 'NEW TITLE!';
    //   models['3biG6L6Kx06Q'].items[0].title = 'NEW TITLE!';
    //   models['feature_1'].title = 'NEW TITLE!';
    //
    //   contentTypes['3biG6LKx06Q_ctid'].name = 'NEW COMPONENT NAME';
    //
    //   ContentController.contentTypes$.next(contentTypes);
    //   ContentController.models$.next(models);
    // }, 2000);

  }

}

function getParentModelId(modelId: string, models: LookupTable<ContentInstance>, children: LookupTable<ContentInstance>): string {
  return isNullOrUndefined(ModelHelper.prop(models[modelId], 'path'))
    ? findParentModelId(modelId, children, models)
    : null;
}

function findParentModelId(modelId: string, childrenMap: LookupTable<ContentInstance>, models: LookupTable<ContentInstance>): string {
  const parentId = forEach(
    Object.entries(childrenMap),
    ([id, children]) => {
      if (
        notNullOrUndefined(children) &&
        (id !== modelId) &&
        children.includes(modelId)
      ) {
        return id;
      }
    },
    null
  );
  return notNullOrUndefined(parentId)
    // If it has a path, it is not embedded and hence the parent
    // Otherwise, need to keep looking.
    ? notNullOrUndefined(ModelHelper.prop(models[parentId], 'path'))
      ? parentId
      : findParentModelId(parentId, childrenMap, models)
    // No parent found for this model
    : null;
}

function fetchById(id: string, site: string = Cookies.get('crafterSite')): Observable<ContentInstance> {
  const isArticleRequest = [
    'f360780a-372f-d005-d736-bcc9d657e50c',
    'b7a724f1-3422-055d-a244-5fc79a1ca007',
    '52e8e75d-94f8-ae0b-3317-8d592b3d7dce',
    '07fc5ac7-05ea-b038-6455-26f895ba8822',
    '6121741f-8b6f-75ce-151b-75e57f04da13',
    '8bdd0180-b7c8-1eff-1f20-76ddca377e3c',
    'd5824453-b743-4575-bb7a-5c49c0fbedbb',
    'b30875f3-87ce-7b55-fd19-3d5c00508a08',
    'f1f9c488-67e1-7ec0-d3ca-560b194e64d1'
  ].includes(id);
  return ajax.post(
    `/api/1/site/graphql?crafterSite=${site}`,
    {
      variables: { id },
      query: (isArticleRequest ? `
        query Articles($id: String) {
          contentItems: page_article {
            total
            items {
              id: objectId(filter: {equals: $id})
              path: localId
              contentTypeId: content__type
              dateCreated: createdDate_dt
              dateModified: lastModifiedDate_dt
              label: internal__name
              title_t
              author_s
              categories_o {
                item {
                  key
                  value_smv
                }
              }
              featured_b
              summary_t
              subject_t
              segments_o {
                item {
                  key
                  value_smv
                }
              }
              sections_o {
                item {
                  section_html
                }
              }
              orderDefault_f
              left_rail_o {
                ...ContentIncludeWrapperFragment
              }
              header_o {
                ...ContentIncludeWrapperFragment
              }
              image_s
            }
          }
        }` : `
        query Page {
          contentItems(limit: 1000) {
            total
            items {
              id: objectId
              path: localId
              contentTypeId: content__type
              dateCreated: createdDate_dt
              dateModified: lastModifiedDate_dt
              label: internal__name
              ... on page_article {
                ...CrafterCMSProps
                title_t
                author_s
                categories_o {
                  item {
                    key
                    value_smv
                  }
                }
                featured_b
                summary_t
                subject_t
                segments_o {
                  item {
                    key
                    value_smv
                  }
                }
                sections_o {
                  item {
                    section_html
                  }
                }
                orderDefault_f
                left_rail_o {
                  ...ContentIncludeWrapperFragment
                }
                header_o {
                  ...ContentIncludeWrapperFragment
                }
                image_s
              }
              ... on component_articles__widget {
                title_t
                max_articles_i
              }
              ... on component_contact__widget {
                title_t
                text_html
                email_s
                phone_s
                address_html
              }
              ... on component_feature {
                icon_s
                title_t
                body_html
              }
              ... on component_header {
                logo_s
                logo_text_t
                business_name_s
                social_media_links_o {
                  item {
                    social_media_s
                    url_s
                  }
                }
              }
              ... on component_left__rail {
                widgets_o {
                  item {
                    key
                    component {
                      id: objectId
                    }
                  }
                }
              }
              ... on page_home {
                title_t
                header_o {
                  ...ContentIncludeWrapperFragment
                }
                left_rail_o {
                  ...ContentIncludeWrapperFragment
                }
                hero_title_html
                hero_text_html
                hero_image_s
                features_title_t
                features_o {
                  ...ContentIncludeWrapperFragment
                }
                content_o {
                  ...ContentIncludeWrapperFragment
                }
              }
              ... on taxonomy {
                items {
                  item {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      `) + (`
        fragment ContentIncludeWrapperFragment on ContentIncludeWrapper {
          item {
            key
            component {
              id: objectId
              path: localId
              contentTypeId: content__type
              dateCreated: createdDate_dt
              dateModified: lastModifiedDate_dt
              label: internal__name
              ... on component_feature {
                icon_s
                title_t
                body_html
                contentTypeId: content__type
                dateCreated: createdDate_dt
                dateModified: lastModifiedDate_dt
              }
              ... on component_layout {
                numberOfColumns_s
                items_o {
                  item {
                    content_o {
                      item {
                        key
                        component {
                          ...CrafterCMSProps
                          ... on component_feature {
                            icon_s
                            title_t
                            body_html
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        fragment CrafterCMSProps on ContentItem {
          id: objectId
          path: localId
          contentTypeId: content__type
          dateCreated: createdDate_dt
          dateModified: lastModifiedDate_dt
          label: internal__name
        }`
      )
    },
    { 'Content-Type': 'application/json' }
  ).pipe(
    map(({ response }) => response.data.contentItems.items.reduce(
      reducer,
      {}
    ))
  );
}

function reducer(lookupTable: LookupTable<ContentInstance>, model: ContentInstance): LookupTable<ContentInstance> {

  const systemPropList = ['id', 'path', 'contentTypeId', 'dateCreated', 'dateModified', 'label'];

  if ([
    '/page/search-results',
    '/component/level-descriptor'
  ].includes(model.contentTypeId)) {
    return lookupTable;
  }

  const system = pluckProps(model, ...systemPropList);
  const rawData = reversePluckProps(model, ...systemPropList);
  const data = {};

  const processEntry = ([key, value], data) => {
    if (key.endsWith('_o')) {
      data[key] = [];
      value.item.forEach((item) => {
        // Components & repeat groups
        if (item.component?.id) {
          // 1. Components
          data[key].push(item.component.id);
          if (item.component.id === item.key) {
            // Embedded component found.
            reducer(lookupTable, item.component);
          }
        } else {
          // 2. Repeat Groups
          const repeatGroupItem = {};
          data[key].push(repeatGroupItem);
          Object.entries(item).forEach((entry) =>
            processEntry(entry, repeatGroupItem)
          );
        }
      });
    } else if (model.contentTypeId === '/taxonomy' && key === 'items') {
      data[key] = value.item;
    } else {
      data[key] = value;
    }
  };

  Object.entries(rawData).forEach((entry, index) =>
    processEntry(entry, data)
  );

  lookupTable[model.id] = {
    craftercms: system as ContentInstanceSystemProps,
    ...data
  };

  return lookupTable;

}

function getCollectionWithoutItemAtIndex(collection: string[], index: string | number): string[] {
  const parsedIndex = parseInt(popPiece(`${index}`), 10);
  return collection
    .slice(0, parsedIndex)
    .concat(collection.slice(parsedIndex + 1));
}

function getCollection(model: ContentInstance, fieldId: string, index: string | number): string[] {
  const isStringIndex = typeof index === 'string';
  return isStringIndex
    ? ModelHelper.extractCollection(model, fieldId, index)
    : ModelHelper.value(model, fieldId);
}

export const contentController = new ContentController();

export default contentController;
