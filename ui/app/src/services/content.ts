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

import { errorSelectorApi1, get, getBinary, getGlobalHeaders, getText, post, postJSON } from '../utils/ajax';
import { catchError, map, mapTo, pluck, switchMap, tap } from 'rxjs/operators';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { cdataWrap, createElement, createElements, fromString, getInnerHtml, serialize } from '../utils/xml';
import { ContentType } from '../models/ContentType';
import { createLookupTable, nnou, nou, reversePluckProps, toQueryString } from '../utils/object';
import { LookupTable } from '../models/LookupTable';
import $ from 'jquery/dist/jquery.slim';
import { dataUriToBlob, isBlank, popPiece, removeLastPiece } from '../utils/string';
import ContentInstance, { InstanceRecord } from '../models/ContentInstance';
import { AjaxError, AjaxResponse } from 'rxjs/ajax';
import { ComponentsContentTypeParams, ContentInstancePage } from '../models/Search';
import Core from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import { getRequestForgeryToken } from '../utils/auth';
import { DetailedItem, LegacyItem, SandboxItem } from '../models/Item';
import { VersionsResponse } from '../models/Version';
import { GetChildrenOptions } from '../models/GetChildrenOptions';
import {
  createItemActionMap,
  createItemStateMap,
  parseContentXML,
  parseSandBoxItemToDetailedItem
} from '../utils/content';
import QuickCreateItem from '../models/content/QuickCreateItem';
import ApiResponse from '../models/ApiResponse';
import { fetchContentTypes } from './contentTypes';
import { Clipboard } from '../models/GlobalState';
import { getFileNameFromPath, getParentPath, getPasteItemFromPath } from '../utils/path';
import { StandardAction } from '../models/StandardAction';
import { GetChildrenResponse } from '../models/GetChildrenResponse';
import { GetItemWithChildrenResponse } from '../models/GetItemWithChildrenResponse';
import { FetchItemsByPathOptions } from '../models/FetchItemsByPath';
import { v4 as uuid } from 'uuid';
import { asArray } from '../utils/array';

export function fetchComponentInstanceHTML(path: string): Observable<string> {
  return getText(`/crafter-controller/component.html?path=${path}`).pipe(pluck('response'));
}

interface GetContentOptions {
  lock: boolean;
}

export function fetchContentXML(site: string, path: string, options?: Partial<GetContentOptions>): Observable<string> {
  options = Object.assign({ lock: false }, options);
  const qs = toQueryString({ site_id: site, path, edit: options.lock });
  return get(`/studio/api/1/services/api/1/content/get-content.json${qs}`).pipe(pluck('response', 'content'));
}

export function fetchContentDOM(site: string, path: string): Observable<XMLDocument> {
  return fetchContentXML(site, path).pipe(map(fromString));
}

interface GetDescriptorOptions {
  flatten: boolean;
}

export function fetchDescriptorXML(
  site: string,
  path: string,
  options?: Partial<GetDescriptorOptions>
): Observable<string> {
  const qs = toQueryString({ siteId: site, path, flatten: true, ...options });
  return get(`/studio/api/2/content/descriptor${qs}`).pipe(pluck('response', 'xml'));
}

export function fetchDescriptorDOM(
  site: string,
  path: string,
  options?: Partial<GetDescriptorOptions>
): Observable<XMLDocument> {
  return fetchDescriptorXML(site, path, options).pipe(map(fromString));
}

export function fetchSandboxItem(site: string, path: string): Observable<SandboxItem> {
  return fetchItemsByPath(site, [path]).pipe(pluck(0));
}

export function fetchDetailedItem(
  siteId: string,
  path: string,
  options?: { preferContent: boolean }
): Observable<DetailedItem> {
  const { preferContent } = { preferContent: true, ...options };
  const qs = toQueryString({ siteId, path, preferContent });
  return get(`/studio/api/2/content/item_by_path${qs}`).pipe(
    pluck('response', 'item'),
    map((item: DetailedItem) => ({
      ...item,
      stateMap: createItemStateMap(item.state),
      availableActionsMap: createItemActionMap(item.availableActions)
    }))
  );
}

export function fetchContentInstanceLookup(
  site: string,
  path: string,
  contentTypesLookup: LookupTable<ContentType>
): Observable<LookupTable<ContentInstance>> {
  return fetchContentDOM(site, path).pipe(
    map((doc) => {
      const lookup = {};
      parseContentXML(doc, path, contentTypesLookup, lookup);
      return lookup;
    })
  );
}

export function fetchContentInstance(
  site: string,
  path: string,
  contentTypesLookup: LookupTable<ContentType>
): Observable<ContentInstance> {
  return fetchContentDOM(site, path).pipe(map((doc) => parseContentXML(doc, path, contentTypesLookup, {})));
}

export function writeContent(site: string, path: string, content: string, options?: { unlock: boolean }) {
  options = Object.assign({ unlock: true }, options);
  return post(
    writeContentUrl({
      site,
      path: getParentPath(path),
      unlock: options.unlock ? 'true' : 'false',
      fileName: getFileNameFromPath(path)
    }),
    content
  ).pipe(
    map((ajaxResponse) => {
      if (ajaxResponse.response.result.error) {
        // eslint-disable-next-line no-throw-literal
        throw {
          ...ajaxResponse,
          status: 500,
          response: {
            message: ajaxResponse.response.result.error.message
          }
        };
      } else return true;
    })
  );
}

export function fetchContentInstanceDescriptor(
  site: string,
  path: string,
  options?: Partial<GetDescriptorOptions>,
  contentTypeLookup?: LookupTable<ContentType>
): Observable<{ model: ContentInstance; modelLookup: LookupTable<ContentInstance> }> {
  return (
    contentTypeLookup
      ? of(contentTypeLookup)
      : fetchContentTypes(site).pipe(map((contentTypes) => createLookupTable(contentTypes)))
  ).pipe(
    switchMap((contentTypeLookup) =>
      fetchDescriptorDOM(site, path, options).pipe(
        map((doc) => {
          const modelLookup = {};
          const model = parseContentXML(doc, path, contentTypeLookup, modelLookup);
          return { model, modelLookup };
        })
      )
    )
  );
}

function writeContentUrl(qs: object): string {
  qs = new URLSearchParams(qs as URLSearchParams);
  return `/studio/api/1/services/api/1/content/write-content.json?${qs.toString()}`;
}

// region Operations

export function updateField(
  site: string,
  modelId: string,
  fieldId: string,
  indexToUpdate: number,
  path: string,
  value: any,
  serializeValue: boolean | ((value: any) => string) = false
): Observable<any> {
  return performMutation(
    site,
    path,
    (element) => {
      let node = extractNode(element, removeLastPiece(fieldId) || fieldId, indexToUpdate);
      if (fieldId.includes('.')) {
        // node is <item /> inside collection
        const fieldToUpdate = popPiece(fieldId);
        let fieldNode = node.querySelector(`:scope > ${fieldToUpdate}`);
        if (nou(fieldNode)) {
          fieldNode = createElement(fieldToUpdate);
          node.appendChild(fieldNode);
        }
        node = fieldNode;
      } else if (!node) {
        // node is <fieldId /> inside the element
        node = createElement(fieldId);
        element.appendChild(node);
      }
      node.innerHTML =
        typeof serializeValue === 'function'
          ? serializeValue(value)
          : Boolean(serializeValue)
          ? cdataWrap(value)
          : value;
    },
    modelId
  );
}

function performMutation(
  site: string,
  path: string,
  mutation: (doc: Element) => void,
  modelId: string = null
): Observable<any> {
  return fetchContentDOM(site, path).pipe(
    switchMap((doc) => {
      const documentModelId = doc.querySelector(':scope > objectId').innerHTML.trim();
      if (nnou(modelId) && documentModelId !== modelId) {
        const component = doc.querySelector(`[id="${modelId}"]`);
        mutation(component);
        updateModifiedDateElement(component);
      } else {
        mutation(doc.documentElement);
      }

      updateModifiedDateElement(doc.documentElement);

      return post(
        writeContentUrl({
          site,
          path: path,
          unlock: 'true',
          fileName: getInnerHtml(doc.querySelector(':scope > file-name'))
        }),
        serialize(doc)
      ).pipe(mapTo({ updatedDocument: doc }));
    })
  );
}

/**
 * Insert a *new* component on to the document
 * */
export function insertComponent(
  site: string,
  modelId: string,
  fieldId: string,
  targetIndex: string | number,
  contentType: ContentType,
  instance: ContentInstance,
  path: string,
  shared = false
): Observable<any> {
  return performMutation(
    site,
    path,
    (element) => {
      const id = instance.craftercms.id;
      const path = shared ? instance.craftercms.path ?? getComponentPath(id, instance.craftercms.contentTypeId) : null;

      // Create the new `item` that holds or references (embedded vs shared) the component.
      const newItem = createElement('item');

      delete instance.fileName;
      delete instance.internalName;

      // Create the new component that will be either embedded into the parent's XML or
      // shared stored on it's own.
      const component = mergeContentDocumentProps('component', {
        '@attributes': { id },
        'content-type': contentType.id,
        'display-template': contentType.displayTemplate,
        // TODO: per this, at this point, internal-name is always cdata wrapped, not driven by config.
        'internal-name': cdataWrap(instance.craftercms.label),
        'file-name': `${id}.xml`,
        objectId: id,
        ...reversePluckProps(instance, 'craftercms')
      });

      // Add the child elements into the `item` node
      createElements(newItem, {
        '@attributes': {
          // TODO: Hardcoded value. Fix.
          datasource: 'TODO',
          ...(shared ? {} : { inline: true })
        },
        key: shared ? path : id,
        value: instance.craftercms.label,
        ...(shared
          ? {
              include: path,
              disableFlattening: 'false'
            }
          : {
              component
            })
      });

      insertCollectionItem(element, fieldId, targetIndex, newItem);
    },
    modelId
  );
}

/**
 * Insert a *existing* (i.e. shared) component on to the document
 * */
export function insertInstance(
  site: string,
  modelId: string,
  fieldId: string,
  targetIndex: string | number,
  instance: ContentInstance,
  path: string,
  datasource?: string
): Observable<any> {
  return performMutation(
    site,
    path,
    (element) => {
      const path = instance.craftercms.path;

      const newItem = createElement('item');

      createElements(newItem, {
        '@attributes': {
          // TODO: Hardcoded value. Fix.
          datasource: datasource ?? 'TODO'
        },
        key: path,
        value: instance.craftercms.label,
        include: path,
        disableFlattening: 'false'
      });

      insertCollectionItem(element, fieldId, targetIndex, newItem);
    },
    modelId
  );
}

export function insertItem(
  site: string,
  modelId: string,
  fieldId: string,
  index: string | number,
  instance: InstanceRecord,
  path: string
): Observable<any> {
  return performMutation(
    site,
    path,
    (element) => {
      let node = extractNode(element, removeLastPiece(fieldId) || fieldId, index);
      const newItem = createElement('item');
      createElements(newItem, instance);
      node.appendChild(newItem);
    },
    modelId
  );
}

export function duplicateItem(
  site: string,
  modelId: string,
  fieldId: string,
  targetIndex: string | number,
  path: string
): Observable<any> {
  return performMutation(
    site,
    path,
    (element) => {
      // removing last piece to get the parent of the item
      const field: Element = extractNode(
        element,
        removeLastPiece(fieldId) || fieldId,
        removeLastPiece(`${targetIndex}`)
      );
      const item: Element = extractNode(element, fieldId, targetIndex).cloneNode(true) as Element;
      updateItemId(item);
      updateElementComponentsId(item);
      field.appendChild(item);
    },
    modelId
  );
}

export function sortItem(
  site: string,
  modelId: string,
  fieldId: string,
  currentIndex: number,
  targetIndex: number,
  path: string
): Observable<any> {
  return performMutation(
    site,
    path,
    (element) => {
      const item = extractNode(element, fieldId, currentIndex);
      insertCollectionItem(element, fieldId, targetIndex, item, currentIndex);
    },
    modelId
  );
}

export function moveItem(
  site: string,
  originalModelId: string,
  originalFieldId: string,
  originalIndex: number,
  targetModelId: string,
  targetFieldId: string,
  targetIndex: number,
  originalParentPath: string,
  targetParentPath: string
): Observable<any> {
  // TODO Warning: cannot perform as transaction whilst the UI is the one to do all this.
  // const isOriginalEmbedded = nnou(originalParentPath);
  // const isTargetEmbedded = nnou(targetParentPath);
  // When moving between inherited dropzone to other dropzone, the modelsIds will be different but in some cases the
  // parentId will be null for both targets in that case we need to add a nnou validation to parentsModelId;
  const isSameModel = originalModelId === targetModelId;
  const isSameDocument = originalParentPath === targetParentPath;
  if (isSameDocument || isSameModel) {
    // Moving items between two fields of the same document or model...
    return performMutation(site, originalParentPath, (element) => {
      // Item may be moving...
      // - from parent model to an embedded model
      // - from an embedded model to the parent model
      // - from an embedded model to another embedded model
      // - from a field to another WITHIN the same model (parent or embedded)
      const parentDocumentModelId = getInnerHtml(element.querySelector(':scope > objectId'));
      const sourceModelElement =
        parentDocumentModelId === originalModelId ? element : element.querySelector(`[id="${originalModelId}"]`);
      const targetModelElement =
        parentDocumentModelId === targetModelId ? element : element.querySelector(`[id="${targetModelId}"]`);
      const item = extractNode(sourceModelElement, originalFieldId, originalIndex);
      const targetField = extractNode(targetModelElement, targetFieldId, removeLastPiece(`${targetIndex}`));
      const targetFieldItems = targetField.querySelectorAll(':scope > item');
      const parsedTargetIndex = parseInt(popPiece(`${targetIndex}`));
      if (targetFieldItems.length === parsedTargetIndex) {
        targetField.appendChild(item);
      } else {
        targetField.insertBefore(item, targetFieldItems[parsedTargetIndex]);
      }
    });
  } else {
    let removedItemHTML: string;
    return performMutation(
      site,
      originalParentPath,
      (element) => {
        const item: Element = extractNode(element, originalFieldId, originalIndex);
        const field: Element = extractNode(element, originalFieldId, removeLastPiece(`${originalIndex}`));

        removedItemHTML = item.outerHTML;
        field.removeChild(item);
      },
      originalModelId
    ).pipe(
      switchMap(() =>
        performMutation(
          site,
          targetParentPath,
          (element) => {
            const item: Element = extractNode(element, targetFieldId, targetIndex);
            const field: Element = extractNode(element, targetFieldId, removeLastPiece(`${targetIndex}`));

            const auxElement = createElement('hold');
            auxElement.innerHTML = removedItemHTML;

            field.insertBefore(auxElement.querySelector(':scope > item'), item);
          },
          targetModelId
        )
      )
    );
  }
}

export function deleteItem(
  site: string,
  modelId: string,
  fieldId: string,
  indexToDelete: number | string,
  path: string
): Observable<any> {
  return performMutation(
    site,
    path,
    (element) => {
      let index = indexToDelete;
      let fieldNode = element.querySelector(`:scope > ${fieldId}`);

      if (typeof indexToDelete === 'string') {
        index = parseInt(popPiece(indexToDelete));
        // A fieldId can be in the form of `a.b`, which translates to `a > item > b` on the XML.
        // In terms of index, since all it should ever arrive here is collection items,
        // this assumes the index path points to the item itself, not the collection.
        // By calling removeLastPiece(indexToDelete), we should get the collection node here.
        fieldNode = extractNode(element, fieldId, removeLastPiece(`${indexToDelete}`));
      }

      const $fieldNode = $(fieldNode);

      $fieldNode
        .children()
        .eq(index as number)
        .remove();

      if ($fieldNode.children().length === 0) {
        // If the node isn't completely blank, the xml formatter won't do it's job in converting to a self-closing tag.
        // Also, later on, when retrieved, some *legacy* functions would impaired as the deserializing into JSON had unexpected content
        $fieldNode.html('');
      }
    },
    modelId
  );
}

// endregion

interface SearchServiceResponse {
  response: ApiResponse;
  result: {
    total: number;
    items: Array<{
      lastModified: string;
      lastModifier: string;
      mimeType: string;
      name: string;
      path: string;
      previewUrl: string;
      size: number;
      snippets: unknown;
    }>;
    facets: Array<{
      date: boolean;
      multiple: boolean;
      name: string;
      range: boolean;
      values: Array<{
        count: number;
        from: number;
        to: number;
      }>;
    }>;
  };
}

export function fetchItemsByContentType(
  site: string,
  contentType: string,
  contentTypesLookup: LookupTable<ContentType>,
  options?: ComponentsContentTypeParams
): Observable<ContentInstancePage>;
export function fetchItemsByContentType(
  site: string,
  contentTypes: string[],
  contentTypesLookup: LookupTable<ContentType>,
  options?: ComponentsContentTypeParams
): Observable<ContentInstancePage>;
export function fetchItemsByContentType(
  site: string,
  contentTypes: string[] | string,
  contentTypesLookup: LookupTable<ContentType>,
  options?: ComponentsContentTypeParams
): Observable<ContentInstancePage> {
  if (typeof contentTypes === 'string') {
    contentTypes = [contentTypes];
  }

  return postJSON(`/studio/api/2/search/search.json?siteId=${site}`, {
    ...options,
    filters: { 'content-type': contentTypes }
  }).pipe(
    map<AjaxResponse<SearchServiceResponse>, { count: number; paths: string[] }>(({ response }) => ({
      count: response.result.total,
      paths: response.result.items.map((item) => item.path)
    })),
    switchMap(({ paths, count }) =>
      zip(
        of(count),
        paths.length
          ? forkJoin(
              paths.reduce((array, path) => {
                array.push(fetchContentInstance(site, path, contentTypesLookup));
                return array;
              }, []) as Array<Observable<ContentInstance>>
            )
          : of([])
      )
    ),
    map(([count, array]) => {
      return {
        count,
        lookup: array.reduce(
          (hash, contentInstance) => Object.assign(hash, { [contentInstance.craftercms.path]: contentInstance }),
          {}
        )
      };
    })
  );
}

export function formatXML(site: string, path: string): Observable<boolean> {
  return fetchContentDOM(site, path).pipe(
    switchMap((doc) =>
      post(
        writeContentUrl({
          site,
          path: path,
          unlock: 'true',
          fileName: getInnerHtml(doc.querySelector(':scope > file-name'))
        }),
        serialize(doc)
      )
    ),
    mapTo(true)
  );
}

interface LegacyContentDocumentProps {
  'content-type': string;
  'display-template': string;
  'internal-name': string;
  'file-name': string;
  'merge-strategy': string;
  createdDate_dt: string;
  lastModifiedDate_dt: string;
  objectId: string;
  locale?: string;
  placeInNav?: 'true' | 'false';
}

interface AnyObject {
  [key: string]: any;
}

function updateItemId(item: Element): void {
  const component = item.querySelector(':scope > component');
  if (component) {
    const key = item.querySelector(':scope > key');
    const objectId = component.querySelector(':scope > objectId');
    const fileName = component.querySelector(':scope > file-name');
    const id = uuid();
    component.id = id;
    key.innerHTML = id;
    fileName.innerHTML = `${id}.xml`;
    objectId.innerHTML = id;
  }
}

function updateElementComponentsId(element: Element): void {
  element.querySelectorAll('item').forEach((item) => {
    updateItemId(item);
  });
}

function extractNode(doc: XMLDocument | Element, fieldId: string, index: string | number) {
  const indexes = index === '' || nou(index) ? [] : `${index}`.split('.').map((i) => parseInt(i, 10));
  let aux: Element = (doc as XMLDocument).documentElement ?? (doc as Element);
  if (nou(index) || isBlank(`${index}`)) {
    return aux.querySelector(`:scope > ${fieldId}`);
  }
  const fields = fieldId.split('.');
  if (indexes.length > fields.length) {
    // There's more indexes than fields
    throw new Error(
      '[content/extractNode] Path not handled: indexes.length > fields.length. Indexes ' +
        `is ${indexes} and fields is ${fields}`
    );
  }
  indexes.forEach((_index, i) => {
    const field = fields[i];
    aux = aux.querySelectorAll(`:scope > ${field} > item`)[_index];
  });
  if (indexes.length === fields.length) {
    return aux;
  } else if (indexes.length < fields.length) {
    // There's one more field to use as there were less indexes
    // than there were fields. For example: fieldId: `items_o.content_o`, index: 0
    // At this point, aux would be `items_o[0]` and we need to extract `content_o`
    const field = fields[fields.length - 1];
    return aux.querySelector(`:scope > ${field}`);
  }
}

function mergeContentDocumentProps(type: string, data: AnyObject): LegacyContentDocumentProps {
  // Dasherized props...
  // content-type, display-template, no-template-required, internal-name, file-name
  // merge-strategy, folder-name, parent-descriptor
  const now = data.lastModifiedDate_dt && data.createdDate_dt ? null : createModifiedDate();
  const dateCreated = data.createdDate_dt ? data.createdDate_dt : now;
  const dateModified = data.lastModifiedDate_dt ? data.lastModifiedDate_dt : now;
  return Object.assign(
    {
      'content-type': '',
      'display-template': '',
      'internal-name': '',
      'file-name': '',
      'merge-strategy': 'inherit-levels',
      createdDate_dt: dateCreated,
      lastModifiedDate_dt: dateModified,
      objectId: ''
    },
    type === 'page' ? { placeInNav: 'false' as 'false' } : {},
    data || {}
  );
}

function createModifiedDate() {
  return new Date().toISOString();
}

function updateModifiedDateElement(doc: Element) {
  doc.querySelector(':scope > lastModifiedDate_dt').innerHTML = createModifiedDate();
}

function getComponentPath(id: string, contentType: string) {
  const pathBase = `/site/components/${contentType.replace('/component/', '')}s/`.replace(/\/{1,}$/m, '');
  return `${pathBase}/${id}.xml`;
}

function insertCollectionItem(
  element: Element,
  fieldId: string,
  targetIndex: string | number,
  newItem: Node,
  currentIndex?: number
): void {
  let fieldNode = extractNode(element, fieldId, removeLastPiece(`${targetIndex}`));
  let index = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) : targetIndex;

  // If currentIndex it means the op is a 'sort', and the index(targetIndex) needs to plus 1 or no
  if (nnou(currentIndex)) {
    let currentIndexParsed = typeof currentIndex === 'string' ? parseInt(popPiece(currentIndex)) : currentIndex;
    let targetIndexParsed = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) : targetIndex;
    if (currentIndexParsed > targetIndexParsed) {
      index = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) : targetIndex;
    } else {
      index = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) + 1 : targetIndex + 1;
    }
  }

  if (nou(fieldNode)) {
    fieldNode = createElement(fieldId);
    fieldNode.setAttribute('item-list', 'true');
    element.appendChild(fieldNode);
  }

  const itemList = fieldNode.querySelectorAll(`:scope > item`);

  if (itemList.length === index) {
    fieldNode.appendChild(newItem);
  } else {
    fieldNode.insertBefore(newItem, itemList[index]);
  }
}

export function createFileUpload(
  uploadUrl: string,
  file: any,
  path: string,
  metaData: object,
  xsrfArgumentName: string
): Observable<StandardAction> {
  const qs = toQueryString({ [xsrfArgumentName]: getRequestForgeryToken() });
  return new Observable((subscriber) => {
    const uppy = new Core({ autoProceed: true });
    uppy.use(XHRUpload, { endpoint: `${uploadUrl}${qs}`, headers: getGlobalHeaders() });
    uppy.setMeta(metaData);

    const blob = dataUriToBlob(file.dataUrl);

    uppy.on('upload-success', (file, response) => {
      subscriber.next({
        type: 'complete',
        payload: response
      });
      subscriber.complete();
    });

    uppy.on('upload-progress', (file, progress) => {
      let type = 'progress';
      subscriber.next({
        type,
        payload: {
          file,
          progress
        }
      });
    });

    uppy.on('upload-error', (file, error) => {
      subscriber.error(error);
    });

    uppy.addFile({
      name: file.name,
      type: file.type,
      data: blob
    });

    return () => {
      uppy.cancelAll();
    };
  });
}

export function uploadDataUrl(
  site: string,
  file: any,
  path: string,
  xsrfArgumentName: string
): Observable<StandardAction> {
  return createFileUpload(
    '/studio/api/1/services/api/1/content/write-content.json',
    file,
    path,
    {
      site,
      name: file.name,
      type: file.type,
      path
    },
    xsrfArgumentName
  );
}

export function uploadToS3(
  site: string,
  file: any,
  path: string,
  profileId: string,
  xsrfArgumentName: string
): Observable<StandardAction> {
  return createFileUpload(
    '/studio/api/2/aws/s3/upload.json',
    file,
    path,
    {
      name: file.name,
      type: file.type,
      siteId: site,
      path,
      profileId: profileId
    },
    xsrfArgumentName
  );
}

export function uploadToWebDAV(
  site: string,
  file: any,
  path: string,
  profileId: string,
  xsrfArgumentName: string
): Observable<StandardAction> {
  return createFileUpload(
    '/studio/api/2/webdav/upload',
    file,
    path,
    {
      name: file.name,
      type: file.type,
      siteId: site,
      path,
      profileId: profileId
    },
    xsrfArgumentName
  );
}

export function uploadToCMIS(
  site: string,
  file: any,
  path: string,
  repositoryId: string,
  xsrfArgumentName: string
): Observable<StandardAction> {
  return createFileUpload(
    '/studio/api/2/cmis/upload',
    file,
    path,
    {
      name: file.name,
      type: file.type,
      siteId: site,
      cmisPath: path,
      cmisRepoId: repositoryId
    },
    xsrfArgumentName
  );
}

export function getBulkUploadUrl(site: string, path: string): string {
  const qs = toQueryString({
    site,
    path,
    contentType: 'folder',
    createFolders: true,
    draft: false,
    duplicate: false,
    unlock: true,
    _csrf: getRequestForgeryToken()
  });
  return `/studio/api/1/services/api/1/content/write-content.json${qs}`;
}

export function fetchQuickCreateList(site: string): Observable<QuickCreateItem[]> {
  return get(`/studio/api/2/content/list_quick_create_content.json?siteId=${site}`).pipe(pluck('response', 'items'));
}

export function fetchItemHistory(site: string, path: string): Observable<VersionsResponse> {
  return get(
    `/studio/api/1/services/api/1/content/get-item-versions.json?site=${site}&path=${encodeURIComponent(path)}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function revertTo(site: string, path: string, versionNumber: string): Observable<Boolean> {
  return get(
    `/studio/api/1/services/api/1/content/revert-content.json?site=${site}&path=${encodeURIComponent(
      path
    )}&version=${versionNumber}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

interface VersionDescriptor {
  site: string;
  path: string;
  versionNumber: string;
  content: ContentInstance;
}

export function fetchItemVersion(site: string, path: string, versionNumber: string): Observable<VersionDescriptor> {
  return of({
    site,
    path,
    versionNumber,
    content: null
  });
}

export function fetchVersions(
  site: string,
  path: string,
  versionNumbers: [string, string],
  contentTypes: LookupTable<ContentType>
): Observable<[VersionDescriptor, VersionDescriptor]> {
  return of([
    {
      site,
      path,
      versionNumber: versionNumbers[0],
      content: null
    },
    {
      site,
      path,
      versionNumber: versionNumbers[1],
      content: null
    }
  ]);
}

export function fetchChildrenByPath(
  siteId: string,
  path: string,
  options?: Partial<GetChildrenOptions>
): Observable<GetChildrenResponse> {
  return postJSON('/studio/api/2/content/children_by_path', {
    siteId,
    path,
    ...options
  }).pipe(
    pluck('response'),
    map(({ children, levelDescriptor, total, offset, limit }) =>
      Object.assign(
        children
          ? children.map((child) => ({
              ...child,
              stateMap: createItemStateMap(child.state),
              availableActionsMap: createItemActionMap(child.availableActions)
            }))
          : [],
        {
          ...(levelDescriptor && {
            levelDescriptor: {
              ...levelDescriptor,
              stateMap: createItemStateMap(levelDescriptor.state),
              availableActionsMap: createItemActionMap(levelDescriptor.availableActions)
            }
          }),
          total,
          offset,
          limit
        }
      )
    )
  );
}

export function fetchChildrenByPaths(
  siteId: string,
  paths: LookupTable<Partial<GetChildrenOptions>>,
  options?: Partial<GetChildrenOptions>
): Observable<LookupTable<GetChildrenResponse>> {
  const requests = Object.keys(paths).map((path) =>
    fetchChildrenByPath(siteId, path, { ...options, ...paths[path] }).pipe(
      catchError((error: AjaxError) => {
        if (error.status === 404) {
          return of([]);
        } else {
          throw error;
        }
      })
    )
  );
  return forkJoin(requests).pipe(
    map((responses) => {
      const data = {};
      Object.keys(paths).forEach((path, i) => (data[path] = responses[i]));
      return data;
    })
  );
}

export function fetchItemsByPath(siteId: string, paths: string[]): Observable<SandboxItem[]>;
export function fetchItemsByPath(
  siteId: string,
  paths: string[],
  options: FetchItemsByPathOptions & { castAsDetailedItem: false }
): Observable<SandboxItem[]>;
export function fetchItemsByPath(
  siteId: string,
  paths: string[],
  options: FetchItemsByPathOptions & { castAsDetailedItem: true }
): Observable<DetailedItem[]>;
export function fetchItemsByPath(
  siteId: string,
  paths: string[],
  options: FetchItemsByPathOptions
): Observable<SandboxItem[]>;
export function fetchItemsByPath(
  siteId: string,
  paths: string[],
  options?: FetchItemsByPathOptions
): Observable<SandboxItem[] | DetailedItem[]> {
  const { castAsDetailedItem = false, preferContent = true } = options ?? {};
  return postJSON('/studio/api/2/content/sandbox_items_by_path', { siteId, paths, preferContent }).pipe(
    pluck('response', 'items'),
    map(
      (items: SandboxItem[]) =>
        items.map((item) => ({
          ...(castAsDetailedItem ? parseSandBoxItemToDetailedItem(item) : item),
          stateMap: createItemStateMap(item.state),
          availableActionsMap: createItemActionMap(item.availableActions)
        })) as SandboxItem[] | DetailedItem[]
    )
  );
}

export function fetchItemByPath(siteId: string, path: string): Observable<SandboxItem>;
export function fetchItemByPath(
  siteId: string,
  path: string,
  options: FetchItemsByPathOptions & { castAsDetailedItem: false }
): Observable<SandboxItem>;
export function fetchItemByPath(
  siteId: string,
  path: string,
  options: FetchItemsByPathOptions & { castAsDetailedItem: true }
): Observable<DetailedItem>;
export function fetchItemByPath(
  siteId: string,
  path: string,
  options: FetchItemsByPathOptions
): Observable<SandboxItem>;
export function fetchItemByPath(
  siteId: string,
  path: string,
  options?: FetchItemsByPathOptions
): Observable<SandboxItem | DetailedItem> {
  return fetchItemsByPath(siteId, [path], options).pipe(
    tap((items) => {
      if (items[0] === void 0) {
        // Fake out the 404 which the backend won't return for this bulk API
        // eslint-disable-next-line no-throw-literal
        throw {
          name: 'AjaxError',
          status: 404,
          response: {
            response: {
              code: 7000,
              message: 'Content not found',
              remedialAction: `Check that path '${path}' is correct and it exists in site '${siteId}'`,
              documentationUrl: ''
            }
          }
        };
      }
    }),
    pluck(0)
  );
}

export function fetchItemWithChildrenByPath(
  siteId: string,
  path: string,
  options?: Partial<GetChildrenOptions>
): Observable<GetItemWithChildrenResponse> {
  return forkJoin({
    item: fetchItemByPath(siteId, path, { castAsDetailedItem: true }),
    children: fetchChildrenByPath(siteId, path, options)
  });
}

export function paste(siteId: string, targetPath: string, clipboard: Clipboard): Observable<any> {
  return postJSON('/studio/api/2/content/paste', {
    siteId,
    operation: clipboard.type,
    targetPath,
    item: getPasteItemFromPath(clipboard.sourcePath, clipboard.paths)
  }).pipe(pluck('response'));
}

export function duplicate(siteId: string, path: string): Observable<any> {
  return postJSON('/studio/api/2/content/duplicate', {
    siteId,
    path
  }).pipe(pluck('response'));
}

export function deleteItems(
  siteId: string,
  items: string[],
  comment: string,
  optionalDependencies?: string[]
): Observable<boolean> {
  return postJSON('/studio/api/2/content/delete', {
    siteId,
    items,
    optionalDependencies,
    comment
  }).pipe(mapTo(true));
}

export function lock(siteId: string, path: string): Observable<boolean>;
export function lock(siteId: string, paths: string[]): Observable<boolean>;
export function lock(siteId: string, paths: string[] | string): Observable<boolean> {
  return postJSON('/studio/api/2/content/items_lock_by_path', { siteId, paths: asArray(paths) }).pipe(mapTo(true));
}

export function unlock(siteId: string, path: string): Observable<boolean> {
  return postJSON('/studio/api/2/content/item_unlock_by_path', { siteId, path }).pipe(mapTo(true));
}

export function fetchWorkflowAffectedItems(site: string, path: string): Observable<SandboxItem[]> {
  return get(`/studio/api/2/workflow/affected_paths?siteId=${site}&path=${path}`).pipe(pluck('response', 'items'));
}

export function createFolder(site: string, path: string, name: string): Observable<unknown> {
  return post(
    `/studio/api/1/services/api/1/content/create-folder.json?site=${site}&path=${encodeURIComponent(
      path
    )}&name=${encodeURIComponent(name)}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function createFile(site: string, path: string, fileName: string): Observable<unknown> {
  return post(
    `/studio/api/1/services/api/1/content/write-content.json?site=${site}&phase=onSave&path=${encodeURIComponent(
      path
    )}&fileName=${fileName}&unlock=true`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function renameFolder(site: string, path: string, name: string) {
  return post(
    `/studio/api/1/services/api/1/content/rename-folder.json?site=${site}&path=${encodeURIComponent(
      path
    )}&name=${encodeURIComponent(name)}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function changeContentType(site: string, path: string, contentType: string): Observable<boolean> {
  return post(
    `/studio/api/1/services/api/1/content/change-content-type.json?site=${site}&path=${path}&contentType=${contentType}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function checkPathExistence(site: string, path: string): Observable<boolean> {
  return get(`/studio/api/1/services/api/1/content/content-exists.json?site_id=${site}&path=${path}`).pipe(
    pluck('response', 'content'),
    catchError(errorSelectorApi1)
  );
}

export function fetchLegacyItem(site: string, path: string): Observable<LegacyItem> {
  return get(
    `/studio/api/1/services/api/1/content/get-item.json?site_id=${site}&path=${encodeURIComponent(path)}`
  ).pipe(pluck('response', 'item'), catchError(errorSelectorApi1));
}

export function fetchLegacyItemsTree(
  site: string,
  path: string,
  options?: Partial<{ depth: number; order: string }>
): Observable<LegacyItem> {
  return get(
    `/studio/api/1/services/api/1/content/get-items-tree.json${toQueryString({
      site_id: site,
      path,
      ...options
    })}`
  ).pipe(pluck('response', 'item'), catchError(errorSelectorApi1));
}

export function fetchContentByCommitId(site: string, path: string, commitId: string): Observable<string | Blob> {
  return getBinary(
    `/studio/api/2/content/get_content_by_commit_id?siteId=${site}&path=${path}&commitId=${commitId}`,
    void 0,
    'blob'
  ).pipe(
    switchMap((ajax) => {
      const blob = ajax.response;
      const type = ajax.xhr.getResponseHeader('content-type');
      if (
        /^text\//.test(type) ||
        /^application\/(x-httpd-php|rtf|xhtml\+xml|xml|json|ld\+json|javascript|x-groovy|x-sh)$/.test(type)
      ) {
        return blob.text() as Promise<string>;
      } else if (/^image\//.test(type)) {
        return of(URL.createObjectURL(blob));
      } else {
        return of(blob);
      }
    })
  );
}
